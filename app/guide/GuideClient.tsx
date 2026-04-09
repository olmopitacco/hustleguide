'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import UpgradeModal from '@/app/components/UpgradeModal'
import type { GuideContent, GuideWeek, DetailedTask, ChatMessage } from '@/lib/guideTypes'

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  pathName: string
  guideId: string
  userId: string
  userName: string
  existingContent: GuideContent | null
  checkedInWeeks: number[]
  subscriptionStatus: string
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

const STEPS = [
  { at: 0,  label: 'Analysing your profile…' },
  { at: 5,  label: 'Planning your first week…' },
  { at: 15, label: 'Writing your daily breakdown…' },
  { at: 25, label: 'Building step-by-step tasks…' },
  { at: 35, label: 'Adding scripts & templates…' },
  { at: 45, label: 'Finding the right tools…' },
  { at: 55, label: 'Writing insider tips…' },
  { at: 65, label: 'Adding common mistakes…' },
  { at: 75, label: 'Setting completion criteria…' },
]

function LoadingScreen({ pathName, elapsed, label }: { pathName: string; elapsed: number; label?: string }) {
  const pct = Math.min(95, Math.round((elapsed / 45) * 95))
  const step = [...STEPS].reverse().find(s => elapsed >= s.at) ?? STEPS[0]
  const displayLabel = label ?? step.label

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-400 animate-spin" style={{ animationDuration: '2.5s' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Building your <span className="text-emerald-400">{pathName}</span> Week 1
      </h2>
      <p className="text-gray-500 text-sm mb-10 text-center max-w-xs">
        Personalised tasks, scripts, and tools — takes about 20–30 seconds.
      </p>

      <div className="w-full max-w-sm mb-3">
        <div className="w-full bg-gray-800/80 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between w-full max-w-sm mb-10">
        <p className="text-xs text-gray-400">{displayLabel}</p>
        <p className="text-xs text-gray-600 tabular-nums">{elapsed}s</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {STEPS.slice(0, -1).map((s, i) => {
          const done = elapsed > s.at + 8
          const active = step.at === s.at && !done
          return (
            <div key={i} className={`flex items-center gap-3 text-xs transition-colors duration-500 ${
              done ? 'text-gray-600' : active ? 'text-white' : 'text-gray-700'
            }`}>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-500 ${
                done ? 'border-emerald-800 bg-emerald-950' : active ? 'border-emerald-500' : 'border-gray-800'
              }`}>
                {done && <span className="text-emerald-600 text-xs leading-none">✓</span>}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />}
              </div>
              {s.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center text-2xl">⚠️</div>
      <div>
        <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-red-400 text-sm max-w-sm">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// ─── Task Drawer ──────────────────────────────────────────────────────────────

function TaskDrawer({ task, onClose }: { task: DetailedTask; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h3 className="font-bold text-white text-base leading-tight pr-4">{task.task_name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none shrink-0">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-3">Step-by-step</h4>
            <ol className="space-y-2.5">
              {task.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="bg-emerald-900/60 text-emerald-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tool</p>
            <p className="text-sm font-semibold text-white">{task.tool}</p>
          </div>

          {task.example_script && (
            <div>
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-3">Example Script / Template</h4>
              <pre className="text-sm text-gray-300 bg-gray-800/60 rounded-xl p-4 whitespace-pre-wrap font-mono leading-relaxed text-xs">
                {task.example_script}
              </pre>
            </div>
          )}

          <div className="bg-emerald-950/40 border border-emerald-900/40 rounded-xl p-4">
            <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2">What good looks like</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{task.what_good_looks_like}</p>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-4">
            <h4 className="text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">If it doesn&apos;t work</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{task.if_it_doesnt_work}</p>
          </div>

          <p className="text-xs text-gray-600">Time estimate: {task.time_estimate}</p>
        </div>
      </div>
    </>
  )
}

// ─── Check-in Modal ───────────────────────────────────────────────────────────

type CheckinFormState = {
  accomplished: string
  harder_than_expected: string
  wins: string
  concerns: string
  actual_hours: string
}

function CheckinModal({
  weekNumber, pathName, guideId, onClose, onSuccess,
}: {
  weekNumber: number; pathName: string; guideId: string
  onClose: () => void; onSuccess: (newWeek: GuideWeek) => void
}) {
  const [form, setForm] = useState<CheckinFormState>({
    accomplished: '', harder_than_expected: '', wins: '', concerns: '', actual_hours: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof CheckinFormState) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.accomplished.trim() || !form.harder_than_expected.trim()) {
      setError('Please fill in the required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId, pathName, weekNumber,
          checkin: { ...form, actual_hours: Number(form.actual_hours) || 0 },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate next week')
      onSuccess(data.week)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          {submitting ? (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <svg className="w-8 h-8 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-white font-semibold">Personalising your Week {weekNumber + 1}…</p>
              <p className="text-gray-500 text-sm">Based on your progress, takes ~20 seconds</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Week {weekNumber} done — how did it go?</h3>
                <p className="text-gray-500 text-sm mt-1">Your answers shape your personalised Week {weekNumber + 1}</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    What did you actually get done? <span className="text-red-400">*</span>
                  </label>
                  <textarea value={form.accomplished} onChange={set('accomplished')} rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500"
                    placeholder="Be specific — what exactly did you complete?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    What was harder than expected? <span className="text-red-400">*</span>
                  </label>
                  <textarea value={form.harder_than_expected} onChange={set('harder_than_expected')} rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500"
                    placeholder="What got you stuck or took longer?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Any wins?</label>
                    <textarea value={form.wins} onChange={set('wins')} rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500"
                      placeholder="Highlight of the week?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">What are you most unsure about?</label>
                    <textarea value={form.concerns} onChange={set('concerns')} rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500"
                      placeholder="Biggest worry?" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">Hours actually spent</label>
                  <input type="number" value={form.actual_hours} onChange={set('actual_hours')} min="0" step="0.5"
                    className="w-32 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 8" />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors text-sm">
                    Generate Week {weekNumber + 1} →
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  pathName, onConfirm, onCancel, deleting,
}: {
  pathName: string; onConfirm: () => void; onCancel: () => void; deleting: boolean
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-gray-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center mx-auto mb-3"><svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></div>
            <h3 className="text-lg font-bold text-white mb-2">Delete this guide?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              You&apos;re about to delete your <span className="text-white font-semibold">{pathName}</span> guide.
              All weekly progress, check-ins, and plans will be permanently lost.
            </p>
          </div>
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-5">
            <p className="text-red-400 text-xs text-center font-medium">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
            >
              Keep Guide
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
            >
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  guideId, pathName, currentWeekNumber, onClose,
}: {
  guideId: string; pathName: string; currentWeekNumber: number; onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  async function send() {
    const text = input.trim()
    if (!text || typing) return
    const updated: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setInput('')
    setTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, guideId, pathName, currentWeekNumber }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply ?? data.error ?? 'Something went wrong.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Try again.' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-30 flex flex-col" style={{ maxHeight: '28rem' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <p className="font-semibold text-white text-sm">Ask your coach</p>
          <p className="text-xs text-gray-500">{pathName}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center pt-6">Ask anything about your plan, tasks, or strategy.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] text-sm px-3 py-2 rounded-xl leading-relaxed ${
              m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-200'
            }`}>{m.content}</div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-3 py-2 rounded-xl text-gray-400 text-sm flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="animate-bounce inline-block" style={{ animationDelay: `${d}ms` }}>·</span>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-800 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask a question…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500" />
        <button onClick={send} disabled={typing || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          ↑
        </button>
      </div>
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  week, checkedCriteria, onCriteriaToggle, onTaskClick,
}: {
  week: GuideWeek; checkedCriteria: Set<number>
  onCriteriaToggle: (i: number) => void; onTaskClick: (task: DetailedTask) => void
}) {
  const days = [
    { key: 'day_1' as const, label: 'Day 1' },
    { key: 'day_2_3' as const, label: 'Days 2–3' },
    { key: 'day_4_5' as const, label: 'Days 4–5' },
    { key: 'day_6_7' as const, label: 'Days 6–7' },
  ]

  const totalCriteria = week.completion_criteria?.length ?? 0
  const tickedCount = checkedCriteria.size
  const pct = totalCriteria > 0 ? Math.round((tickedCount / totalCriteria) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Week {week.week_number}</span>
        <h2 className="text-3xl font-bold text-white mt-1 mb-2">{week.theme}</h2>
        <p className="text-gray-400 leading-relaxed">{week.goal}</p>
        {week.based_on_your_progress && (
          <div className="mt-4 bg-blue-950/40 border border-blue-900/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Personalised for your progress</p>
            <p className="text-sm text-gray-300 leading-relaxed">{week.based_on_your_progress}</p>
          </div>
        )}
      </div>

      {/* Week completion progress bar */}
      {totalCriteria > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Week Progress</span>
            <span className="text-xs font-bold text-emerald-400">{tickedCount}/{totalCriteria} criteria</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {tickedCount === totalCriteria && totalCriteria > 0 && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">All done! Your check-in form will appear shortly.</p>
          )}
        </div>
      )}

      {/* Mindset + Why */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mindset this week</p>
          <p className="text-sm text-gray-200 leading-relaxed">{week.mindset}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Why it matters</p>
          <p className="text-sm text-gray-200 leading-relaxed">{week.why_it_matters}</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Daily Breakdown</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {days.map(({ key, label }) => {
            const day = week.daily_breakdown[key]
            if (!day) return null
            return (
              <div key={key} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-400">{label}</span>
                  <span className="text-xs text-gray-500">{day.hours}h</span>
                </div>
                <p className="text-sm font-medium text-gray-200 mb-2">{day.focus}</p>
                <ul className="space-y-1">
                  {day.tasks.map((t, i) => (
                    <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                      <span className="text-emerald-700 shrink-0">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Tasks — click for full detail</h3>
        <div className="space-y-2">
          {week.detailed_tasks.map((task, i) => (
            <button key={i} onClick={() => onTaskClick(task)}
              className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-emerald-600/40 rounded-xl p-4 transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border border-gray-600 shrink-0 mt-0.5 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                  <span className="text-gray-600 group-hover:text-emerald-500 text-xs transition-colors">→</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{task.task_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{task.time_estimate}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">{task.tool}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 shrink-0 group-hover:text-gray-400 transition-colors">Full detail →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      {week.tools?.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">Tools This Week</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {week.tools.map((tool, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm">{tool.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    /free/i.test(tool.cost) ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-700 text-gray-300'
                  }`}>{tool.cost}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{tool.purpose}</p>
                <p className="text-xs text-gray-500 italic">💡 {tool.pro_tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insider Tips */}
      {week.insider_tips?.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-5">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Insider Tips</h3>
          <ul className="space-y-2">
            {week.insider_tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2 leading-relaxed">
                <span className="text-amber-600 shrink-0">→</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {week.common_mistakes?.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">Common Mistakes</h3>
          <div className="space-y-2">
            {week.common_mistakes.map((m, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">✗ {m.mistake}</p>
                <p className="text-xs text-gray-400 leading-relaxed">Fix: {m.how_to_avoid}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Criteria */}
      {week.completion_criteria?.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Week Complete When…</h3>
          <p className="text-xs text-gray-500 mb-4">Tick all of these to unlock your Week {week.week_number + 1} check-in</p>
          <ul className="space-y-3">
            {week.completion_criteria.map((c, i) => {
              const checked = checkedCriteria.has(i)
              return (
                <li key={i}>
                  <button
                    onClick={() => onCriteriaToggle(i)}
                    className="flex items-start gap-3 w-full text-left group"
                  >
                    <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 group-hover:border-emerald-500'
                    }`}>
                      {checked && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-sm leading-relaxed transition-colors ${
                      checked ? 'line-through text-gray-600' : 'text-gray-300'
                    }`}>{c}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GuideClient({
  pathName, guideId, userId, userName, existingContent, checkedInWeeks: initialCheckedInWeeks,
  subscriptionStatus,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const isPro = subscriptionStatus === 'pro'
  const FREE_WEEK_LIMIT = 2

  const [guide, setGuide] = useState<GuideContent | null>(existingContent)
  const [loading, setLoading] = useState(!existingContent)
  const [elapsed, setElapsed] = useState(0)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')
  const [activeWeek, setActiveWeek] = useState(1)

  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, Set<number>>>({})
  const [checkedInWeeks, setCheckedInWeeks] = useState<Set<number>>(new Set(initialCheckedInWeeks))

  const [selectedTask, setSelectedTask] = useState<DetailedTask | null>(null)
  const [showCheckin, setShowCheckin] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const nudgeShownRef = useRef(false)

  // Elapsed timer during loading
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [loading])

  const generatingRef = useRef(false)

  const generateGuide = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    setLoading(true)
    setError('')
    setElapsed(0)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 150_000)
    try {
      const res = await fetch('/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, pathName }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      let data: { content?: GuideContent; error?: string }
      try { data = await res.json() } catch { throw new Error('Failed to read server response.') }
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`)
      if (!data.content) throw new Error('No content returned. Please try again.')
      setGuide(data.content)
      setActiveWeek(1)
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('Request timed out. Please try again — generation usually takes 20–30 seconds.')
      } else {
        setError((err as Error).message)
      }
    } finally {
      setLoading(false)
      generatingRef.current = false
    }
  }, [guideId, pathName])

  useEffect(() => {
    if (!existingContent) generateGuide()
  }, [existingContent, generateGuide])

  // Coach nudge — pops up after 45s on first visit, then every 3 min
  const NUDGES = [
    'Stuck on something? Ask your coach 💬',
    'Need help with a task? I\'m here 👋',
    'Not sure where to start? Ask me anything →',
    'Your coach is online — ask anything',
    'Questions about this week? Let\'s talk 💡',
  ]
  useEffect(() => {
    if (showChat) return
    if (nudgeShownRef.current) return
    const t = setTimeout(() => {
      if (showChat) return
      const msg = NUDGES[Math.floor(Math.random() * NUDGES.length)]
      setNudge(msg)
      nudgeShownRef.current = true
      setTimeout(() => setNudge(null), 6000)
    }, 45_000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChat])

  useEffect(() => {
    if (nudgeShownRef.current) {
      const interval = setInterval(() => {
        if (showChat) return
        const msg = NUDGES[Math.floor(Math.random() * NUDGES.length)]
        setNudge(msg)
        setTimeout(() => setNudge(null), 6000)
      }, 3 * 60_000)
      return () => clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudgeShownRef.current, showChat])

  function toggleCriteria(weekNum: number, idx: number) {
    setCheckedCriteria(prev => {
      const set = new Set(prev[weekNum] ?? [])
      set.has(idx) ? set.delete(idx) : set.add(idx)
      return { ...prev, [weekNum]: set }
    })
  }

  // Auto-show check-in when all criteria ticked
  useEffect(() => {
    const week = guide?.weeks.find(w => w.week_number === activeWeek)
    if (!week?.completion_criteria?.length) return
    if (checkedInWeeks.has(activeWeek)) return
    const ticked = checkedCriteria[activeWeek]
    if (ticked && ticked.size >= week.completion_criteria.length) {
      setTimeout(() => setShowCheckin(true), 400)
    }
  }, [checkedCriteria, activeWeek, guide, checkedInWeeks])

  function handleCheckinSuccess(newWeek: GuideWeek) {
    setGuide(prev => {
      if (!prev) return prev
      const weeks = prev.weeks.filter(w => w.week_number !== newWeek.week_number)
      weeks.push(newWeek)
      weeks.sort((a, b) => a.week_number - b.week_number)
      return { ...prev, weeks }
    })
    setCheckedInWeeks(prev => new Set([...prev, activeWeek]))
    setShowCheckin(false)
    setActiveWeek(newWeek.week_number)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/guides/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed to delete guide')
        setDeleting(false)
        setShowDelete(false)
      }
    } catch {
      alert('Failed to delete guide')
      setDeleting(false)
      setShowDelete(false)
    }
  }

  if (loading) return <LoadingScreen pathName={pathName} elapsed={elapsed} label={loadingLabel} />
  if (error) return <ErrorScreen error={error} onRetry={generateGuide} />
  if (!guide) return null

  const currentWeek = guide.weeks.find(w => w.week_number === activeWeek)
  const allWeekNums = Array.from({ length: 12 }, (_, i) => i + 1)
  const totalCriteriaAll = guide.weeks.reduce((sum, w) => sum + (w.completion_criteria?.length ?? 0), 0)
  const totalTickedAll = Object.values(checkedCriteria).reduce((sum, s) => sum + s.size, 0)
  const overallPct = totalCriteriaAll > 0 ? Math.round((totalTickedAll / totalCriteriaAll) * 100) : 0

  function isUnlocked(n: number): boolean {
    if (n === 1) return true
    return checkedInWeeks.has(n - 1)
  }

  function isPlanLocked(n: number): boolean {
    return !isPro && n > FREE_WEEK_LIMIT
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-300 flex items-center gap-1 mb-3">← Dashboard</Link>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide truncate">{pathName}</p>
          <p className="text-xs text-gray-600 mt-0.5">Hey, {userName}</p>

          {/* Overall progress */}
          {totalCriteriaAll > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Overall</span>
                <span>{overallPct}%</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-gray-800/60 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">{checkedInWeeks.size}</div>
              <div className="text-xs text-gray-600">weeks done</div>
            </div>
            <div className="flex-1 bg-gray-800/60 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">{guide.weeks.length}</div>
              <div className="text-xs text-gray-600">generated</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {allWeekNums.map(n => {
            const exists = guide.weeks.some(w => w.week_number === n)
            const unlocked = isUnlocked(n)
            const planLocked = isPlanLocked(n)
            const week = guide.weeks.find(w => w.week_number === n)
            const allCriteriaDone = week
              ? (checkedCriteria[n]?.size ?? 0) >= week.completion_criteria.length && week.completion_criteria.length > 0
              : false
            const canAccess = exists && unlocked && !planLocked

            return (
              <button key={n}
                onClick={() => {
                  if (planLocked) { setShowUpgrade(true); return }
                  if (canAccess) setActiveWeek(n)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  n === activeWeek ? 'bg-emerald-600 text-white' :
                  canAccess ? 'text-gray-300 hover:bg-gray-800 hover:text-white' :
                  planLocked ? 'text-gray-600 hover:bg-gray-800/30 cursor-pointer' :
                  'text-gray-700 cursor-not-allowed'
                }`}>
                <span className="shrink-0 w-4 text-center text-xs">
                  {allCriteriaDone ? '✓' : planLocked ? '★' : !canAccess ? '·' : n}
                </span>
                <span className="truncate flex-1">{week ? week.theme : `Week ${n}`}</span>
                {planLocked && <span className="text-xs text-emerald-500 shrink-0">Pro</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          {!isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              ↑ Unlock all weeks
            </button>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-xs text-gray-600 hover:text-red-400 hover:bg-red-950/20 px-3 py-2 rounded-lg transition-colors text-left"
          >
            Delete this guide
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-3 z-10 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {guide.weeks.length} week{guide.weeks.length !== 1 ? 's' : ''} generated
            {!isPro && <span className="ml-2 text-emerald-500">· Free plan: weeks 1–{FREE_WEEK_LIMIT}</span>}
          </span>
          {checkedInWeeks.size > 0 && (
            <span className="text-xs text-emerald-500 font-medium">
              {checkedInWeeks.size} week{checkedInWeeks.size !== 1 ? 's' : ''} completed ✓
            </span>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          {currentWeek ? (
            <WeekView
              week={currentWeek}
              checkedCriteria={checkedCriteria[activeWeek] ?? new Set()}
              onCriteriaToggle={i => toggleCriteria(activeWeek, i)}
              onTaskClick={setSelectedTask}
            />
          ) : (
            <div className="text-center py-24">
              {isPlanLocked(activeWeek) ? (
                <div>
                  <div className="flex justify-center mb-4"><svg className="w-10 h-10 text-emerald-400/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                  <p className="text-white font-semibold mb-2">Week {activeWeek} is a Pro feature</p>
                  <p className="text-gray-500 text-sm mb-5">Free plan includes weeks 1–{FREE_WEEK_LIMIT}. Upgrade to unlock all 12 weeks.</p>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                  >
                    Upgrade to Pro →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-center mb-4"><svg className="w-10 h-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <p className="text-gray-500 text-sm">Complete Week {activeWeek - 1} and submit your check-in to unlock this week.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedTask && <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {showCheckin && (
        <CheckinModal
          weekNumber={activeWeek}
          pathName={pathName}
          guideId={guideId}
          onClose={() => setShowCheckin(false)}
          onSuccess={handleCheckinSuccess}
        />
      )}

      {showDelete && (
        <DeleteConfirmModal
          pathName={pathName}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          deleting={deleting}
        />
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} trigger="Weeks 3–12 require a Pro plan." />}

      {showChat && (
        <ChatPanel
          guideId={guideId}
          pathName={pathName}
          currentWeekNumber={activeWeek}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Coach nudge bubble */}
      {nudge && !showChat && (
        <div
          className="fixed bottom-20 right-4 z-20 max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <button
            onClick={() => { setNudge(null); setShowChat(true) }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-2xl rounded-br-sm shadow-xl text-left leading-snug transition-colors"
          >
            {nudge}
          </button>
          <button
            onClick={() => setNudge(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 text-xs flex items-center justify-center leading-none transition-colors"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat bubble */}
      <button
        onClick={() => { setShowChat(s => !s); setNudge(null) }}
        className={`fixed bottom-4 right-4 z-20 transition-all duration-300 ${
          showChat
            ? 'w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-lg shadow-lg flex items-center justify-center'
            : 'flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-xl'
        }`}
        title="Ask your coach"
      >
        {showChat ? (
          '×'
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Ask your coach
          </>
        )}
      </button>
    </div>
  )
}
