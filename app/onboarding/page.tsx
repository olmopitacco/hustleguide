'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Question definitions ───────────────────────────────────────────────────

type Question =
  | { id: string; type: 'single'; question: string; options: string[] }
  | { id: string; type: 'multi';  question: string; options: string[] }
  | { id: string; type: 'text';   question: string; placeholder: string; optional?: boolean }

const QUESTIONS: Question[] = [
  {
    id: 'hours_available',
    type: 'single',
    question: 'How many hours per week can you realistically dedicate?',
    options: ['2–5 hrs', '5–10 hrs', '10–20 hrs', '20+ hrs'],
  },
  {
    id: 'income_timeline',
    type: 'single',
    question: 'How quickly do you need to earn money?',
    options: ['Within 30 days', '1–3 months', '3–6 months', 'Building long term'],
  },
  {
    id: 'budget',
    type: 'single',
    question: 'What is your budget to invest to get started?',
    options: ['€0 — no budget at all', 'Under €100', '€100–500', '€500+'],
  },
  {
    id: 'location',
    type: 'text',
    question: 'Where are you based?',
    placeholder: 'City, Country',
  },
  {
    id: 'skills',
    type: 'multi',
    question: 'What skills do you already have?',
    options: ['Writing', 'Design', 'Coding', 'Marketing', 'Teaching', 'Sales', 'Cooking', 'Fitness', 'Languages', 'None of these'],
  },
  {
    id: 'tried_before',
    type: 'text',
    question: 'Have you tried making money online before? What happened?',
    placeholder: 'e.g. tried dropshipping but gave up after 2 weeks',
    optional: true,
  },
  {
    id: 'preferences',
    type: 'single',
    question: 'What kind of work do you prefer?',
    options: ['Creative work', 'Analytical work', 'Working with people', 'Working alone'],
  },
  {
    id: 'hates',
    type: 'multi',
    question: 'What do you absolutely hate doing?',
    options: ['Cold outreach', 'Repetitive tasks', 'Managing people', 'Technical work', 'Being on camera', 'Writing lots of text'],
  },
]

type Answers = Record<string, string | string[]>

// ─── Component ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [textValue, setTextValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const q = QUESTIONS[current]
  const progress = ((current) / QUESTIONS.length) * 100

  // Restore text value when navigating back to a text question
  useEffect(() => {
    if (q.type === 'text') {
      setTextValue((answers[q.id] as string) ?? '')
      setTimeout(() => inputRef.current?.focus(), 320)
    }
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  function canAdvance() {
    if (q.type === 'text' && q.optional) return true
    if (q.type === 'text') return textValue.trim().length > 0
    if (q.type === 'single') return !!answers[q.id]
    if (q.type === 'multi') return ((answers[q.id] as string[]) ?? []).length > 0
    return false
  }

  function navigate(dir: 'forward' | 'back') {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      if (dir === 'forward') {
        // Commit text answer before moving
        if (q.type === 'text') {
          setAnswers(prev => ({ ...prev, [q.id]: textValue.trim() }))
        }
        setCurrent(c => c + 1)
      } else {
        setCurrent(c => c - 1)
      }
      setAnimating(false)
    }, 260)
  }

  function handleSingle(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }))
    // Auto-advance after a short delay
    if (animating) return
    setTimeout(() => navigate('forward'), 180)
  }

  function handleMultiToggle(id: string, value: string) {
    setAnswers(prev => {
      const current = (prev[id] as string[]) ?? []
      if (current.includes(value)) {
        return { ...prev, [id]: current.filter(v => v !== value) }
      }
      return { ...prev, [id]: [...current, value] }
    })
  }

  async function handleFinish() {
    // Commit last question's text if needed
    const finalAnswers = q.type === 'text'
      ? { ...answers, [q.id]: textValue.trim() }
      : answers

    setAnalyzing(true)

    // Wait 2 seconds on the loading screen
    await new Promise(r => setTimeout(r, 2000))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        hours_available: finalAnswers.hours_available as string ?? null,
        income_timeline: finalAnswers.income_timeline as string ?? null,
        budget: finalAnswers.budget as string ?? null,
        location: finalAnswers.location as string ?? null,
        skills: (finalAnswers.skills as string[]) ?? [],
        tried_before: finalAnswers.tried_before as string ?? null,
        preferences: finalAnswers.preferences as string ?? null,
        hates: (finalAnswers.hates as string[]) ?? [],
        updated_at: new Date().toISOString(),
      })
    }

    router.push('/results')
  }

  function handleNext() {
    if (current === QUESTIONS.length - 1) {
      handleFinish()
    } else {
      navigate('forward')
    }
  }

  // ─── Analyzing screen ───────────────────────────────────────────────────
  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Analyzing your profile...</h2>
          <p className="text-slate-400">Finding the perfect hustle path for you</p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Quiz screen ────────────────────────────────────────────────────────
  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 -translate-x-8'
      : 'opacity-0 translate-x-8'
    : 'opacity-100 translate-x-0'

  return (
    <div className="min-h-screen bg-[#070d1a] flex flex-col">

      {/* Top bar */}
      <div className="px-6 pt-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-black text-white tracking-tight">
            Hustle<span className="text-emerald-400">Guide</span>
          </span>
          <span className="text-slate-400 text-sm font-medium">
            {current + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress + (100 / QUESTIONS.length)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div
          className={`w-full max-w-2xl transition-all duration-250 ease-in-out ${slideClass}`}
        >
          {/* Question label */}
          <div className="mb-8">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Question {current + 1}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
              {q.question}
            </h2>
            {q.type === 'multi' && (
              <p className="text-slate-400 text-sm mt-2">Select all that apply</p>
            )}
            {q.type === 'text' && q.optional && (
              <p className="text-slate-400 text-sm mt-2">Optional — skip if you prefer</p>
            )}
          </div>

          {/* Single choice */}
          {q.type === 'single' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map(opt => {
                const selected = answers[q.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSingle(q.id, opt)}
                    className={`text-left px-5 py-4 rounded-xl border font-semibold text-sm transition-all duration-150
                      ${selected
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* Multi choice */}
          {q.type === 'multi' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {q.options.map(opt => {
                const selected = ((answers[q.id] as string[]) ?? []).includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => handleMultiToggle(q.id, opt)}
                    className={`text-left px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all duration-150 flex items-center gap-2
                      ${selected
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                      ${selected ? 'bg-white border-white' : 'border-slate-500'}`}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 10 8">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* Text input */}
          {q.type === 'text' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && canAdvance()) handleNext() }}
                placeholder={q.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav — hidden for single choice (auto-advances), shown for multi/text */}
      <div className="px-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* Back button */}
          {current > 0 && (
            <button
              onClick={() => navigate('back')}
              disabled={animating}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-colors px-4 py-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          )}

          {/* Next / Finish — only shown for multi and text questions */}
          {(q.type === 'multi' || q.type === 'text') && (
            <button
              onClick={handleNext}
              disabled={!canAdvance() || animating}
              className={`ml-auto flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all
                ${canAdvance()
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
            >
              {current === QUESTIONS.length - 1 ? 'See My Results' : 'Next'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* For single choice on last question — show explicit button */}
          {q.type === 'single' && current === QUESTIONS.length - 1 && answers[q.id] && (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all"
            >
              See My Results
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
