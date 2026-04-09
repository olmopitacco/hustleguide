import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uid = user.id

    // Delete all user data in order
    await supabase.from('weekly_checkins').delete().eq('user_id', uid)
    await supabase.from('activity_log').delete().eq('user_id', uid)
    await supabase.from('email_log').delete().eq('user_id', uid)
    await supabase.from('generated_guides').delete().eq('user_id', uid)
    await supabase.from('user_profiles').delete().eq('user_id', uid)

    // Attempt to delete auth user via service role if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey,
      )
      await admin.auth.admin.deleteUser(uid)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
