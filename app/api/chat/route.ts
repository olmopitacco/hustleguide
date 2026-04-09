import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ChatMessage, GuideWeek } from '@/lib/guideTypes'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, guideId, pathName, currentWeekNumber } = await request.json() as {
      messages: ChatMessage[]
      guideId: string
      pathName: string
      currentWeekNumber: number
    }

    const [profileRes, guideRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('generated_guides').select('content').eq('id', guideId).single(),
    ])

    const profile = profileRes.data ?? {}
    const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'None'
    const hates = Array.isArray(profile.hates) ? profile.hates.join(', ') : 'None'
    const guideContent = guideRes.data?.content as { weeks?: GuideWeek[] } | null
    const currentWeek = guideContent?.weeks?.find(w => w.week_number === currentWeekNumber)

    const systemPrompt = `You are a business coach helping someone build income through ${pathName}.

Their profile:
- Location: ${profile.location ?? 'Not specified'}
- Hours per week: ${profile.hours_available ?? 'Not specified'}
- Budget: ${profile.budget ?? 'Not specified'}
- Skills: ${skills}
- Hates: ${hates}

Current week: Week ${currentWeekNumber}${currentWeek ? ` — "${currentWeek.theme}"` : ''}
${currentWeek ? `Week goal: ${currentWeek.goal}` : ''}

Answer concisely in 3-5 sentences. Be honest, practical, and encouraging. Give specific actionable advice tailored to their exact situation. No generic platitudes.`

    const last8 = messages.slice(-8)

    let message
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: last8.map(m => ({ role: m.role, content: m.content })),
      })
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 502 })
    }

    const reply = (message.content[0] as { type: string; text: string }).text
    return Response.json({ reply })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
