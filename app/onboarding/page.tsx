'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from 'react-i18next'

// ─── English values (always stored in Supabase) ───────────────────────────────
const HOURS_VALUES   = ['2–5 hrs', '5–10 hrs', '10–20 hrs', '20+ hrs']
const TIMELINE_VALUES = ['Within 30 days', '1–3 months', '3–6 months', 'Building long term']
const BUDGET_VALUES  = ['€0 — no budget at all', 'Under €100', '€100–500', '€500+']
const SKILLS_VALUES  = ['Writing', 'Design', 'Coding', 'Marketing', 'Teaching', 'Sales', 'Cooking', 'Fitness', 'Languages', 'None of these']
const PREF_VALUES    = ['Creative work', 'Analytical work', 'Working with people', 'Working alone']
const HATES_VALUES   = ['Cold outreach', 'Repetitive tasks', 'Managing people', 'Technical work', 'Being on camera', 'Writing lots of text']

type Answers = Record<string, string | string[]>

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [textValue, setTextValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Questions built from translations ──────────────────────────────────────
  // Each question pairs a displayed label with the English value stored in DB.
  // Single/multi options are { label: translated, value: english }
  type SingleQuestion = { id: string; type: 'single'; question: string; options: { label: string; value: string }[] }
  type MultiQuestion  = { id: string; type: 'multi';  question: string; options: { label: string; value: string }[] }
  type TextQuestion   = { id: string; type: 'text';   question: string; placeholder: string; optional?: boolean }
  type Question = SingleQuestion | MultiQuestion | TextQuestion

  const QUESTIONS: Question[] = [
    {
      id: 'hours_available', type: 'single',
      question: t('quiz.q_hours'),
      options: [
        { label: t('quiz.hours_1'), value: HOURS_VALUES[0] },
        { label: t('quiz.hours_2'), value: HOURS_VALUES[1] },
        { label: t('quiz.hours_3'), value: HOURS_VALUES[2] },
        { label: t('quiz.hours_4'), value: HOURS_VALUES[3] },
      ],
    },
    {
      id: 'income_timeline', type: 'single',
      question: t('quiz.q_timeline'),
      options: [
        { label: t('quiz.timeline_1'), value: TIMELINE_VALUES[0] },
        { label: t('quiz.timeline_2'), value: TIMELINE_VALUES[1] },
        { label: t('quiz.timeline_3'), value: TIMELINE_VALUES[2] },
        { label: t('quiz.timeline_4'), value: TIMELINE_VALUES[3] },
      ],
    },
    {
      id: 'budget', type: 'single',
      question: t('quiz.q_budget'),
      options: [
        { label: t('quiz.budget_1'), value: BUDGET_VALUES[0] },
        { label: t('quiz.budget_2'), value: BUDGET_VALUES[1] },
        { label: t('quiz.budget_3'), value: BUDGET_VALUES[2] },
        { label: t('quiz.budget_4'), value: BUDGET_VALUES[3] },
      ],
    },
    {
      id: 'location', type: 'text',
      question: t('quiz.q_location'),
      placeholder: t('quiz.location_ph'),
    },
    {
      id: 'skills', type: 'multi',
      question: t('quiz.q_skills'),
      options: [
        { label: t('quiz.skill_writing'),   value: SKILLS_VALUES[0] },
        { label: t('quiz.skill_design'),    value: SKILLS_VALUES[1] },
        { label: t('quiz.skill_coding'),    value: SKILLS_VALUES[2] },
        { label: t('quiz.skill_marketing'), value: SKILLS_VALUES[3] },
        { label: t('quiz.skill_teaching'),  value: SKILLS_VALUES[4] },
        { label: t('quiz.skill_sales'),     value: SKILLS_VALUES[5] },
        { label: t('quiz.skill_cooking'),   value: SKILLS_VALUES[6] },
        { label: t('quiz.skill_fitness'),   value: SKILLS_VALUES[7] },
        { label: t('quiz.skill_languages'), value: SKILLS_VALUES[8] },
        { label: t('quiz.skill_none'),      value: SKILLS_VALUES[9] },
      ],
    },
    {
      id: 'tried_before', type: 'text',
      question: t('quiz.q_tried'),
      placeholder: t('quiz.tried_ph'),
      optional: true,
    },
    {
      id: 'preferences', type: 'single',
      question: t('quiz.q_preferences'),
      options: [
        { label: t('quiz.pref_creative'),   value: PREF_VALUES[0] },
        { label: t('quiz.pref_analytical'), value: PREF_VALUES[1] },
        { label: t('quiz.pref_people'),     value: PREF_VALUES[2] },
        { label: t('quiz.pref_alone'),      value: PREF_VALUES[3] },
      ],
    },
    {
      id: 'hates', type: 'multi',
      question: t('quiz.q_hates'),
      options: [
        { label: t('quiz.hate_outreach'),   value: HATES_VALUES[0] },
        { label: t('quiz.hate_repetitive'), value: HATES_VALUES[1] },
        { label: t('quiz.hate_managing'),   value: HATES_VALUES[2] },
        { label: t('quiz.hate_technical'),  value: HATES_VALUES[3] },
        { label: t('quiz.hate_camera'),     value: HATES_VALUES[4] },
        { label: t('quiz.hate_writing'),    value: HATES_VALUES[5] },
      ],
    },
  ]

  const q = QUESTIONS[current]
  const progress = ((current) / QUESTIONS.length) * 100

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
    if (animating) return
    setTimeout(() => navigate('forward'), 180)
  }

  function handleMultiToggle(id: string, value: string) {
    setAnswers(prev => {
      const cur = (prev[id] as string[]) ?? []
      if (cur.includes(value)) return { ...prev, [id]: cur.filter(v => v !== value) }
      return { ...prev, [id]: [...cur, value] }
    })
  }

  async function handleFinish() {
    const finalAnswers = q.type === 'text'
      ? { ...answers, [q.id]: textValue.trim() }
      : answers
    setAnalyzing(true)
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
    if (current === QUESTIONS.length - 1) handleFinish()
    else navigate('forward')
  }

  // ─── Analyzing screen ────────────────────────────────────────────────────────
  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
          </div>
          <h2 className="text-3xl font-black text-white mb-3">{t('quiz.analyzing')}</h2>
          <p className="text-slate-400">{t('quiz.analyzing_sub')}</p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Quiz screen ─────────────────────────────────────────────────────────────
  const slideClass = animating
    ? direction === 'forward' ? 'opacity-0 -translate-x-8' : 'opacity-0 translate-x-8'
    : 'opacity-100 translate-x-0'

  return (
    <div className="min-h-screen bg-[#070d1a] flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-black text-white tracking-tight">
            Hustle<span className="text-emerald-400">Guide</span>
          </span>
          <span className="text-slate-400 text-sm font-medium">{current + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress + (100 / QUESTIONS.length)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className={`w-full max-w-2xl transition-all duration-250 ease-in-out ${slideClass}`}>
          <div className="mb-8">
            <div className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
              {t('quiz.label', { n: current + 1 })}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">{q.question}</h2>
            {q.type === 'multi' && <p className="text-slate-400 text-sm mt-2">{t('quiz.select_all')}</p>}
            {q.type === 'text' && q.optional && <p className="text-slate-400 text-sm mt-2">{t('quiz.optional')}</p>}
          </div>

          {/* Single choice */}
          {q.type === 'single' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingle(q.id, opt.value)}
                    className={`text-left px-5 py-4 min-h-[52px] rounded-xl border font-semibold text-sm transition-all duration-150
                      ${selected
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Multi choice */}
          {q.type === 'multi' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {q.options.map(opt => {
                const selected = ((answers[q.id] as string[]) ?? []).includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiToggle(q.id, opt.value)}
                    className={`text-left px-4 py-3.5 min-h-[52px] rounded-xl border font-semibold text-sm transition-all duration-150 flex items-center gap-2
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
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Text input */}
          {q.type === 'text' && (
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canAdvance()) handleNext() }}
              placeholder={q.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {current > 0 && (
            <button
              onClick={() => navigate('back')}
              disabled={animating}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-colors px-3 sm:px-4 py-3"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 16 16">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">{t('quiz.back')}</span>
            </button>
          )}

          {(q.type === 'multi' || q.type === 'text') && (
            <button
              onClick={handleNext}
              disabled={!canAdvance() || animating}
              className={`flex-1 sm:flex-none ml-auto flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all
                ${canAdvance()
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
            >
              {current === QUESTIONS.length - 1 ? t('quiz.see_results') : t('quiz.next')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {q.type === 'single' && current === QUESTIONS.length - 1 && answers[q.id] && (
            <button
              onClick={handleNext}
              className="flex-1 sm:flex-none ml-auto flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all"
            >
              {t('quiz.see_results')}
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
