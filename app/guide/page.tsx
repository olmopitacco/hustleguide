import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isGuideContent } from '@/lib/guideTypes'
import type { GuideContent } from '@/lib/guideTypes'
import GuideClient from './GuideClient'

type Props = {
  searchParams: Promise<{ path?: string; id?: string }>
}

export default async function GuidePage({ searchParams }: Props) {
  const { path, id } = await searchParams
  const pathName = path ? decodeURIComponent(path) : ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users').select('name, subscription_status').eq('id', user.id).single()

  // Load existing guide if already generated
  let existingContent: GuideContent | null = null
  let savedCriteriaChecked: Record<number, number[]> = {}
  if (id) {
    const { data: guide } = await supabase
      .from('generated_guides')
      .select('content, criteria_checked')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (isGuideContent(guide?.content)) {
      existingContent = guide.content as GuideContent
    }
    if (guide?.criteria_checked && typeof guide.criteria_checked === 'object') {
      savedCriteriaChecked = guide.criteria_checked as Record<number, number[]>
    }
  }

  // Load check-ins to determine which weeks have been completed
  let checkedInWeeks: number[] = []
  if (id) {
    const { data: checkins } = await supabase
      .from('weekly_checkins')
      .select('week_number')
      .eq('guide_id', id)
      .eq('user_id', user.id)
    checkedInWeeks = (checkins ?? []).map(c => c.week_number)
  }

  return (
    <GuideClient
      pathName={pathName}
      guideId={id ?? ''}
      userId={user.id}
      userName={userData?.name?.split(' ')[0] ?? 'there'}
      existingContent={existingContent}
      checkedInWeeks={checkedInWeeks}
      savedCriteriaChecked={savedCriteriaChecked}
      subscriptionStatus={userData?.subscription_status ?? 'free'}
    />
  )
}
