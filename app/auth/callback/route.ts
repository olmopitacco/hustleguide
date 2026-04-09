import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const isNew = searchParams.get('new') === 'true'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Send welcome email for brand new signups (non-blocking)
      if (isNew) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
          fetch(`${appUrl}/api/emails/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? '',
              email: user.email,
            }),
          }).catch(e => console.error('[welcome email trigger]', e))
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
