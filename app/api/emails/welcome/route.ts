import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { welcomeEmail } from '@/lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json()
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })

    const supabase = await createClient()

    // Check if already sent
    const { data: existing } = await supabase
      .from('email_log')
      .select('id')
      .eq('user_id', userId)
      .eq('email_type', 'welcome')
      .single()

    if (existing) return Response.json({ skipped: true })

    const { subject, html } = welcomeEmail(name ?? 'there')

    const { error } = await resend.emails.send({
      from: 'HustleGuide <hello@hustleguide.app>',
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error('[welcome email]', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('email_log').insert({
      user_id: userId,
      email_type: 'welcome',
      sent_at: new Date().toISOString(),
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[welcome email]', err)
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
