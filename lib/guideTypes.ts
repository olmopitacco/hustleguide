export type DailyEntry = {
  focus: string
  tasks: string[]
  hours: string
}

export type DetailedTask = {
  task_name: string
  steps: string[]
  tool: string
  example_script: string
  time_estimate: string
  what_good_looks_like: string
  if_it_doesnt_work: string
}

export type GuideTool = {
  name: string
  purpose: string
  cost: string
  pro_tip: string
}

export type CommonMistake = {
  mistake: string
  how_to_avoid: string
}

export type GuideWeek = {
  week_number: number
  theme: string
  goal: string
  why_it_matters: string
  mindset: string
  based_on_your_progress?: string
  daily_breakdown: {
    day_1: DailyEntry
    day_2_3: DailyEntry
    day_4_5: DailyEntry
    day_6_7: DailyEntry
  }
  detailed_tasks: DetailedTask[]
  tools: GuideTool[]
  insider_tips: string[]
  common_mistakes: CommonMistake[]
  completion_criteria: string[]
}

export type GuideContent = {
  path_name: string
  weeks: GuideWeek[]
}

export type CheckIn = {
  guide_id: string
  week_number: number
  accomplished: string
  harder_than_expected: string
  wins: string
  concerns: string
  actual_hours: number
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text
}

export function isGuideContent(v: unknown): v is GuideContent {
  return (
    typeof v === 'object' && v !== null &&
    'weeks' in v && Array.isArray((v as GuideContent).weeks) &&
    (v as GuideContent).weeks.length > 0 &&
    typeof (v as GuideContent).weeks[0] === 'object'
  )
}

export function isGuideWeek(v: unknown): v is GuideWeek {
  return (
    typeof v === 'object' && v !== null &&
    'week_number' in v &&
    'theme' in v &&
    'detailed_tasks' in v
  )
}
