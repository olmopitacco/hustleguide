import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { guideReadyEmail } from '@/lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { userId, name, email, pathName, week1Content, guideId } = await request.json()
    if (!email || !week1Content) return Response.json({ error: 'Missing data' }, { status: 400 })

    const supabase = await createClient()

    // Only send once per guide
    const { data: existing } = await supabase
      .from('email_log')
      .select('id')
      .eq('user_id', userId)
      .eq('email_type', 'guide_ready')
      .eq('metadata->>guide_id', guideId)
      .single()

    if (existing) return Response.json({ skipped: true })

    const criteria: string[] = week1Content.completion_criteria ?? []
    const firstTask = week1Content.detailed_tasks?.[0] ?? { task_name: 'Your first task', steps: [] }

    const { subject, html } = guideReadyEmail(name, pathName, criteria, firstTask, guideId)

    const { error } = await resend.emails.send({
      from: 'HustleGuide <hello@hustleguide.app>',
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error('[guide-ready email]', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('email_log').insert({
      user_id: userId,
      email_type: 'guide_ready',
      sent_at: new Date().toISOString(),
      metadata: { guide_id: guideId },
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[guide-ready email]', err)
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
