import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { extractJSON, isGuideWeek, isGuideContent } from '@/lib/guideTypes'
import type { GuideWeek, CheckIn } from '@/lib/guideTypes'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const WEEK_JSON_SHAPE = `{
  "week_number": N,
  "theme": "",
  "goal": "",
  "why_it_matters": "",
  "mindset": "",
  "based_on_your_progress": "",
  "daily_breakdown": {
    "day_1": {"focus": "", "tasks": [], "hours": ""},
    "day_2_3": {"focus": "", "tasks": [], "hours": ""},
    "day_4_5": {"focus": "", "tasks": [], "hours": ""},
    "day_6_7": {"focus": "", "tasks": [], "hours": ""}
  },
  "detailed_tasks": [
    {
      "task_name": "",
      "steps": [],
      "tool": "",
      "example_script": "",
      "time_estimate": "",
      "what_good_looks_like": "",
      "if_it_doesnt_work": ""
    }
  ],
  "tools": [{"name": "", "purpose": "", "cost": "", "pro_tip": ""}],
  "insider_tips": [],
  "common_mistakes": [{"mistake": "", "how_to_avoid": ""}],
  "completion_criteria": []
}`

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', it: 'Italian', es: 'Spanish', fr: 'French',
  de: 'German', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
}

function buildNextWeekPrompt(
  pathName: string,
  profile: Record<string, unknown>,
  completedWeekNumber: number,
  checkin: CheckIn
): string {
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'None listed'
  const nextWeek = completedWeekNumber + 1
  const lang = typeof profile.preferred_language === 'string' ? profile.preferred_language : 'en'
  const langName = LANGUAGE_NAMES[lang] ?? 'English'
  const location = profile.location ?? 'Not specified'

  return `IMPORTANT: You must respond entirely in ${langName}. Every single word of your response must be in ${langName}. Do not use any English unless it is a proper noun like a platform name (e.g. Instagram, Canva, Google). All advice, explanations, task descriptions, tips, and examples must be in ${langName}.

You are an expert business coach.

The user is on a ${pathName} journey.

Their profile:
- Location: ${location}
- Hours per week: ${profile.hours_available ?? 'Not specified'}
- Budget: ${profile.budget ?? 'Not specified'}
- Skills: ${skills}

Their Week ${completedWeekNumber} check-in:
- Accomplished: ${checkin.accomplished}
- Harder than expected: ${checkin.harder_than_expected}
- Wins: ${checkin.wins || 'None mentioned'}
- Concerns: ${checkin.concerns || 'None mentioned'}
- Hours spent: ${checkin.actual_hours}

Generate their Week ${nextWeek} plan. Customize it based on their actual progress.
If they struggled — simplify tasks and directly address their concerns.
If they're ahead — push further and introduce more ambitious actions.

Start with a "based_on_your_progress" field: 2 sentences explaining exactly how you customized this week specifically for them based on what they told you.

LOCALISATION RULES:
- Reference platforms, tools, income figures, and examples relevant to the user's location (${location}).
- Use local currency and realistic local income figures where applicable.
- Keep platform names, tool names, and brand names in their original form.

Include 4-5 detailed tasks. Each task must have concrete step-by-step instructions and a real example script or template where applicable.

Respond in this exact JSON format with week_number set to ${nextWeek}. Nothing outside the JSON:
${WEEK_JSON_SHAPE.replace('week_number": N', `week_number": ${nextWeek}`)}`
}

export async function POST(request: Request) {
  try {
    return await handlePost(request)
  } catch (err) {
    return Response.json({ error: (err as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}

async function handlePost(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { guideId, pathName, weekNumber, checkin } = body as {
    guideId: string
    pathName: string
    weekNumber: number
    checkin: CheckIn
  }

  // Enforce week limit based on plan
  const { data: userData } = await supabase.from('users').select('subscription_status').eq('id', user.id).single()
  const isPro = userData?.subscription_status === 'pro'
  const nextWeekNumber = weekNumber + 1
  if (!isPro && nextWeekNumber > 2) {
    return Response.json({ error: 'PRO_REQUIRED' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('user_profiles').select('*').eq('user_id', user.id).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  // Save check-in
  await supabase.from('weekly_checkins').insert({
    user_id: user.id,
    guide_id: guideId,
    week_number: weekNumber,
    accomplished: checkin.accomplished,
    harder_than_expected: checkin.harder_than_expected,
    wins: checkin.wins ?? '',
    concerns: checkin.concerns ?? '',
    actual_hours: checkin.actual_hours ?? 0,
  })

  // Generate next week
  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildNextWeekPrompt(pathName, profile, weekNumber, checkin) }],
    })
  } catch (err) {
    const msg = (err as Error).message ?? 'Anthropic API error'
    return Response.json({ error: msg }, { status: 402 })
  }

  const rawText = (message.content[0] as { type: string; text: string }).text

  let newWeek: unknown
  try {
    newWeek = JSON.parse(extractJSON(rawText))
  } catch {
    return Response.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
  }

  if (!isGuideWeek(newWeek)) {
    return Response.json({ error: 'AI returned unexpected format. Please try again.' }, { status: 500 })
  }

  // Load current guide and append new week
  const { data: guideRow } = await supabase
    .from('generated_guides').select('content').eq('id', guideId).single()

  const existing = isGuideContent(guideRow?.content) ? guideRow.content : { path_name: pathName, weeks: [] as GuideWeek[] }
  const weeks = existing.weeks.filter(w => w.week_number !== (newWeek as GuideWeek).week_number)
  weeks.push(newWeek as GuideWeek)
  weeks.sort((a, b) => a.week_number - b.week_number)

  const { error: saveError } = await supabase
    .from('generated_guides')
    .update({ content: { ...existing, weeks } })
    .eq('id', guideId)

  if (saveError) {
    console.error('[generate-week] SAVE FAILED — missing UPDATE RLS policy? Run supabase/stripe.sql in Supabase SQL Editor.', saveError.message)
  }

  return Response.json({ week: newWeek })
}
