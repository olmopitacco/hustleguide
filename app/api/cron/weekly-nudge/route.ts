import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { weeklyNudgeEmail } from '@/lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

// Runs every Monday at 9am UTC via Vercel cron
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get all users with active guides
  const { data: guides, error } = await supabase
    .from('generated_guides')
    .select(`
      id,
      user_id,
      path_name,
      weeks_unlocked,
      content,
      users (
        email,
        raw_user_meta_data,
        last_sign_in_at
      )
    `)
    .not('content', 'is', null)

  if (error) {
    console.error('[weekly-nudge cron]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const guide of guides ?? []) {
    try {
      const user = (guide as any).users
      if (!user?.email) { skipped++; continue }

      const week = guide.weeks_unlocked ?? 1
      const content = (guide as any).content
      const currentWeekData = content?.weeks?.find((w: any) => w.week_number === week) ?? content?.weeks?.[0]
      if (!currentWeekData) { skipped++; continue }

      // Check inactivity
      const lastLogin = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      const inactiveDays = lastLogin
        ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
        : 99

      const name = user.raw_user_meta_data?.name ?? user.raw_user_meta_data?.full_name ?? 'there'

      // Check if already sent this week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const { data: alreadySent } = await supabase
        .from('email_log')
        .select('id')
        .eq('user_id', guide.user_id)
        .eq('email_type', 'weekly_nudge')
        .gte('sent_at', weekStart.toISOString())
        .single()

      if (alreadySent) { skipped++; continue }

      const hoursEstimate = currentWeekData.daily_breakdown?.day_1?.hours ?? '2–4 hours'

      const { subject, html } = weeklyNudgeEmail(
        name,
        guide.path_name,
        week,
        currentWeekData.theme ?? `Week ${week}`,
        currentWeekData.completion_criteria ?? [],
        hoursEstimate,
        guide.id,
        undefined,
        inactiveDays
      )

      const { error: sendError } = await resend.emails.send({
        from: 'HustleGuide <hello@hustleguide.app>',
        to: user.email,
        subject,
        html,
      })

      if (!sendError) {
        await supabase.from('email_log').insert({
          user_id: guide.user_id,
          email_type: 'weekly_nudge',
          sent_at: new Date().toISOString(),
          metadata: { guide_id: guide.id, week },
        })
        sent++
      } else {
        console.error('[weekly-nudge] send error:', sendError)
        skipped++
      }
    } catch (err) {
      console.error('[weekly-nudge] per-user error:', err)
      skipped++
    }
  }

  return Response.json({ ok: true, sent, skipped })
}
