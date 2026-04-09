import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { scorePaths } from '@/lib/hustlePaths'
import DashboardClient from './DashboardClient'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user data and subscription status
  const { data: userData } = await supabase
    .from('users')
    .select('name, email, subscription_status')
    .eq('id', user.id)
    .single()

  // Fetch all guides
  const { data: guidesRaw } = await supabase
    .from('generated_guides')
    .select('id, path_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch all check-ins to determine weeks_unlocked per guide
  const { data: checkIns } = await supabase
    .from('weekly_checkins')
    .select('guide_id, week_number, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent activity
  const { data: activityRaw } = await supabase
    .from('activity_log')
    .select('id, type, payload, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch user profile for matched paths
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const displayName = userData?.name ?? user.email?.split('@')[0] ?? 'Hustler'
  const subscriptionStatus = userData?.subscription_status ?? 'free'

  // Compute weeks_unlocked per guide (max week_number from check-ins + 1 for the current in-progress week)
  const checkInsByGuide: Record<string, number[]> = {}
  for (const ci of checkIns ?? []) {
    if (!checkInsByGuide[ci.guide_id]) checkInsByGuide[ci.guide_id] = []
    checkInsByGuide[ci.guide_id].push(ci.week_number)
  }

  const guides = (guidesRaw ?? []).map(g => {
    const completedWeeks = checkInsByGuide[g.id] ?? []
    const maxCompleted = completedWeeks.length > 0 ? Math.max(...completedWeeks) : 0
    return {
      ...g,
      weeks_unlocked: maxCompleted + 1, // current week in progress
    }
  })

  const activeGuide = guides[0] ?? null

  // Other matched paths (excluding active guide's path)
  const otherPaths = profile
    ? scorePaths(profile)
        .filter(p => p.name !== activeGuide?.path_name)
        .slice(0, 8)
        .map(p => ({
          name: p.name,
          emoji: p.emoji,
          matchPercent: p.matchPercent,
          description: p.description,
        }))
    : []

  const totalWeeksCompleted = (checkIns ?? []).length
  const totalCheckIns = (checkIns ?? []).length

  return (
    <DashboardClient
      userName={displayName}
      subscriptionStatus={subscriptionStatus}
      guides={guides}
      activeGuide={activeGuide}
      otherPaths={otherPaths}
      recentActivity={(activityRaw ?? []) as Array<{ id: string; type: string; payload: Record<string, unknown>; created_at: string }>}
      totalWeeksCompleted={totalWeeksCompleted}
      totalCheckIns={totalCheckIns}
      upgradedParam={params.upgraded === '1'}
    />
  )
}
