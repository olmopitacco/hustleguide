import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { scorePaths } from '@/lib/hustlePaths'
import ResultsClient from './ResultsClient'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Start of current month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [profileResult, userDataResult, monthlyResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('users').select('name, subscription_status').eq('id', user.id).single(),
    supabase.from('generated_guides').select('id').eq('user_id', user.id).gte('created_at', monthStart),
  ])

  if (!profileResult.data) redirect('/onboarding')

  const profileLang = (profileResult.data as Record<string, unknown>)?.preferred_language as string | undefined
  const scored = scorePaths(profileResult.data, profileLang ?? 'en')
  const top3 = scored.slice(0, 3)
  const rest = scored.slice(3)
  const displayName = userDataResult.data?.name?.split(' ')[0] ?? 'there'
  const subscriptionStatus = userDataResult.data?.subscription_status ?? 'free'
  const monthlyGuideCount = monthlyResult.data?.length ?? 0

  return (
    <ResultsClient
      top3={top3}
      rest={rest}
      userId={user.id}
      userName={displayName}
      subscriptionStatus={subscriptionStatus}
      monthlyGuideCount={monthlyGuideCount}
    />
  )
}
