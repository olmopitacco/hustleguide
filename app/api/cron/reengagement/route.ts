import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { reengagementEmail } from '@/lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

// Runs daily at 10am UTC via Vercel cron
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()

  // Get users who haven't logged in for ~7 days and have an active guide
  const { data: guides, error } = await supabase
    .from('generated_guides')
    .select(`
      id,
      user_id,
      path_name,
      weeks_unlocked,
      content,
      created_at,
      users (
        email,
        raw_user_meta_data,
        last_sign_in_at
      )
    `)
    .not('content', 'is', null)

  if (error) {
    console.error('[reengagement cron]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const guide of guides ?? []) {
    try {
      const user = (guide as any).users
      if (!user?.email || !user?.last_sign_in_at) { skipped++; continue }

      const lastLogin = new Date(user.last_sign_in_at)
      const inactiveDays = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))

      // Only target users inactive for exactly 7 days (between 7 and 8 days ago)
      if (inactiveDays < 7 || inactiveDays >= 8) { skipped++; continue }

      // Check if already sent re-engagement for this guide
      const { data: alreadySent } = await supabase
        .from('email_log')
        .select('id')
        .eq('user_id', guide.user_id)
        .eq('email_type', 'reengagement')
        .gte('sent_at', eightDaysAgo)
        .single()

      if (alreadySent) { skipped++; continue }

      const content = (guide as any).content
      const currentWeek = guide.weeks_unlocked ?? 1
      const weekData = content?.weeks?.find((w: any) => w.week_number === currentWeek) ?? content?.weeks?.[0]
      if (!weekData) { skipped++; continue }

      const tasks = weekData.detailed_tasks ?? []
      const lastTask = tasks[Math.max(0, tasks.length - 2)]?.task_name ?? 'your last task'
      const nextTask = tasks[tasks.length - 1]?.task_name ?? 'your next task'

      const createdAt = new Date(guide.created_at)
      const daysSinceStart = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      const name = user.raw_user_meta_data?.name ?? user.raw_user_meta_data?.full_name ?? 'there'

      const { subject, html } = reengagementEmail(
        name,
        guide.path_name,
        daysSinceStart,
        currentWeek,
        lastTask,
        nextTask,
        guide.id
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
          email_type: 'reengagement',
          sent_at: new Date().toISOString(),
          metadata: { guide_id: guide.id },
        })
        sent++
      } else {
        console.error('[reengagement] send error:', sendError)
        skipped++
      }
    } catch (err) {
      console.error('[reengagement] per-user error:', err)
      skipped++
    }
  }

  return Response.json({ ok: true, sent, skipped })
}
