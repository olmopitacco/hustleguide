import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { extractJSON, isGuideContent, isGuideWeek } from '@/lib/guideTypes'
import type { GuideContent } from '@/lib/guideTypes'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const WEEK_JSON_SHAPE = `{
  "week_number": 1,
  "theme": "",
  "goal": "",
  "why_it_matters": "",
  "mindset": "",
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

function buildWeek1Prompt(profile: Record<string, unknown>, pathName: string): string {
  const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'None listed'
  const hates = Array.isArray(profile.hates) ? profile.hates.join(', ') : 'None listed'
  const lang = typeof profile.preferred_language === 'string' ? profile.preferred_language : 'en'
  const langName = LANGUAGE_NAMES[lang] ?? 'English'
  const location = profile.location ?? 'Not specified'

  return `You are an expert business coach.
Create a detailed, actionable Week 1 plan for someone starting ${pathName}.

Profile:
- Location: ${location}
- Hours per week: ${profile.hours_available ?? 'Not specified'}
- Budget: ${profile.budget ?? 'Not specified'}
- Skills: ${skills}
- Income needed by: ${profile.income_timeline ?? 'Not specified'}
- Hates: ${hates}
- Work style: ${profile.preferences ?? 'Not specified'}

IMPORTANT LANGUAGE & LOCALISATION RULES:
- Generate ALL content in ${langName}.
- Reference platforms, tools, income figures, and examples that are relevant to the user's location (${location}) and country.
- Use local currency and realistic local income figures where applicable.
- Keep platform names, tool names, and brand names in their original form (do not translate proper nouns).

Make every task extremely specific and actionable. Include real example scripts and templates where relevant. Be honest about difficulty and realistic about outcomes.

Include 4-5 detailed tasks. Each task must have concrete step-by-step instructions and a real example script or template where applicable.

Respond in this exact JSON format. Nothing outside the JSON:
${WEEK_JSON_SHAPE}`
}

export async function POST(request: Request) {
  try {
    return await handlePost(request)
  } catch (err) {
    console.error('[generate-guide]', err)
    return Response.json({ error: (err as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}

async function handlePost(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { guideId, pathName } = await request.json()

  // Return existing if valid
  if (guideId) {
    const { data: existing } = await supabase
      .from('generated_guides')
      .select('content')
      .eq('id', guideId)
      .single()
    if (isGuideContent(existing?.content)) {
      return Response.json({ content: existing.content })
    }
  }

  const { data: profile } = await supabase
    .from('user_profiles').select('*').eq('user_id', user.id).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildWeek1Prompt(profile, pathName) }],
    })
  } catch (err) {
    const msg = (err as Error).message ?? 'Anthropic API error'
    const isCredits = msg.includes('credit balance') || msg.includes('billing')
    return Response.json(
      { error: isCredits ? 'Your Anthropic API key has no credits. Top up at console.anthropic.com → Billing.' : msg },
      { status: 402 }
    )
  }

  const rawText = (message.content[0] as { type: string; text: string }).text

  let week: unknown
  try {
    week = JSON.parse(extractJSON(rawText))
  } catch {
    console.error('[generate-guide] JSON parse failed. Raw text length:', rawText.length, '| Last 200 chars:', rawText.slice(-200))
    return Response.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
  }

  if (!isGuideWeek(week)) {
    return Response.json({ error: 'AI returned unexpected format. Please try again.' }, { status: 500 })
  }

  const content: GuideContent = { path_name: pathName, weeks: [week] }

  if (guideId) {
    const { error: saveError } = await supabase
      .from('generated_guides')
      .update({ content, path_name: pathName })
      .eq('id', guideId)

    if (saveError) {
      console.error('[generate-guide] SAVE FAILED — missing UPDATE RLS policy? Run supabase/stripe.sql in Supabase SQL Editor.', saveError.message)
    } else {
      // Fire guide-ready email (non-blocking)
      const { data: userData } = await supabase.auth.getUser()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hustleguide.vercel.app'
      fetch(`${appUrl}/api/emails/guide-ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: userData.user?.user_metadata?.name ?? userData.user?.user_metadata?.full_name ?? 'there',
          email: user.email,
          pathName,
          week1Content: (week as Record<string, unknown>),
          guideId,
        }),
      }).catch(e => console.error('[guide-ready email trigger]', e))
    }
  }

  return Response.json({ content })
}
