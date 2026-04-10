'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import UpgradeModal from '@/app/components/UpgradeModal'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import { useLanguage } from '@/app/components/I18nProvider'
import { createClient } from '@/lib/supabase/client'

type Guide = {
  id: string
  path_name: string
  created_at: string
  weeks_unlocked: number
}

type MatchedPath = {
  name: string
  emoji: string
  matchPercent: number
  description: string
}

type Activity = {
  id: string
  type: string
  payload: Record<string, unknown>
  created_at: string
}

type Props = {
  userName: string
  subscriptionStatus: string
  guides: Guide[]
  activeGuide: Guide | null
  otherPaths: MatchedPath[]
  recentActivity: Activity[]
  totalWeeksCompleted: number
  totalCheckIns: number
  upgradedParam: boolean
}

const NAV_ITEMS = [
  { label: 'My Guide', icon: '▣', href: null, section: 'guide' },
  { label: 'My Matches', icon: '◎', href: null, section: 'matches' },
  { label: 'Progress', icon: '↗', href: null, section: 'progress' },
  { label: 'Settings', icon: '◌', href: null, section: 'settings' },
]

const MOTIVATIONAL = [
  "Every expert was once a beginner. Your first $100 online is closer than you think.",
  "The hustle you start today is the income stream you'll thank yourself for next year.",
  "Most people quit at week 2. You're still here — that's already the edge.",
  "Your skills have value. You just need to find the right buyers.",
  "Small consistent actions compound into big results. Keep going.",
]

function activityIcon(type: string) {
  if (type === 'guide_started') return '→'
  if (type === 'week_completed') return '✓'
  if (type === 'checkin_submitted') return '↺'
  return '★'
}

function activityLabel(activity: Activity) {
  if (activity.type === 'guide_started') return `Started "${activity.payload.path_name}" guide`
  if (activity.type === 'week_completed') return `Completed Week ${activity.payload.week_number} of "${activity.payload.path_name}"`
  if (activity.type === 'checkin_submitted') return `Submitted Week ${activity.payload.week_number} check-in`
  return 'Activity'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

export default function DashboardClient({
  userName,
  subscriptionStatus,
  guides,
  activeGuide,
  otherPaths,
  recentActivity,
  totalWeeksCompleted,
  totalCheckIns,
  upgradedParam,
}: Props) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { language, setLanguage } = useLanguage()
  const [langSaved, setLangSaved] = useState(false)
  const [section, setSection] = useState('guide')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [massDeleting, setMassDeleting] = useState(false)
  const [showMassConfirm, setShowMassConfirm] = useState(false)
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false)
  const [retaking, setRetaking] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(prev => prev.size === guides.length ? new Set() : new Set(guides.map(g => g.id)))
  }

  async function handleMassDelete() {
    setMassDeleting(true)
    const ids = Array.from(selected)
    await Promise.all(ids.map(guideId =>
      fetch('/api/guides/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      })
    ))
    setSelected(new Set())
    setShowMassConfirm(false)
    setMassDeleting(false)
    router.refresh()
  }
  async function handleRetakeQuiz() {
    setRetaking(true)
    try {
      await fetch('/api/quiz/retake', { method: 'POST' })
    } catch { /* ignore */ }
    router.push('/onboarding')
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    setDeletingAccount(true)
    try {
      await fetch('/api/account/delete', { method: 'POST' })
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* ignore */ }
    router.push('/')
  }

  const isPro = subscriptionStatus === 'pro'
  const FREE_GUIDE_LIMIT = 1
  const PRO_GUIDE_LIMIT = 3
  const guideLimit = isPro ? PRO_GUIDE_LIMIT : FREE_GUIDE_LIMIT
  const atGuideLimit = guides.length >= guideLimit

  async function handleDeleteGuide(guideId: string) {
    setDeletingId(guideId)
    try {
      const res = await fetch('/api/guides/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed to delete guide')
      }
    } catch {
      alert('Failed to delete guide')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const motivational = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length]

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You\'ll keep access until the end of your billing period.')) return
    setCancelLoading(true)
    setCancelMsg('')
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.cancelled) {
        const end = data.end_date ? new Date(data.end_date).toLocaleDateString() : 'end of period'
        setCancelMsg(`Subscription cancelled. You have Pro access until ${end}.`)
      } else {
        setCancelMsg(data.error ?? 'Something went wrong')
      }
    } catch {
      setCancelMsg('Failed to cancel. Try again.')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#070d1a]">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-white/10 flex-col py-8 px-4">
        <Link href="/" className="text-xl font-black text-white tracking-tight px-2 mb-10">
          Hustle<span className="text-emerald-400">Guide</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.section}
              onClick={() => setSection(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                section === item.section
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-3 mt-auto pt-6 border-t border-white/10">
          {!isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-bold px-3 py-2.5 rounded-xl transition-all text-left flex items-center gap-2"
            >
              <span>⚡</span> Upgrade to Pro
            </button>
          )}
          {isPro && (
            <div className="px-3 py-2 text-xs text-green-400 font-medium flex items-center gap-2">
              <span>✓</span> Pro Member
            </div>
          )}
          <div className="px-2">
            <span className="text-slate-500 text-xs block truncate">{userName}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-slate-500 hover:text-slate-300 text-xs px-2 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto pb-24 md:pb-8">
        {/* Upgrade success banner */}
        {upgradedParam && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <span>🎉</span>
            <span className="font-medium">Welcome to Pro! You now have unlimited access.</span>
          </div>
        )}

        {/* ── GUIDE SECTION ── */}
        {section === 'guide' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Hey, {userName.split(' ')[0]}!</h1>
              <p className="text-slate-400 text-sm italic">{motivational}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Guides', value: `${guides.length}/${guideLimit}`, icon: '▣', sub: isPro ? 'Pro limit' : 'Free limit' },
                { label: 'Weeks Done', value: totalWeeksCompleted, icon: '✓', sub: 'check-ins submitted' },
                { label: 'Check-Ins', value: totalCheckIns, icon: '↺', sub: 'total reflections' },
                { label: 'Completion', value: guides.length > 0 ? `${Math.round((totalWeeksCompleted / (guides.length * 12)) * 100)}%` : '—', icon: '◎', sub: 'towards 12 weeks' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-slate-500 text-xs">{s.label}</div>
                  <div className="text-slate-700 text-xs mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Plan banner */}
            {atGuideLimit && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-emerald-300 text-sm">
                  {isPro ? `Max ${PRO_GUIDE_LIMIT} guides on Pro.` : 'Free plan: 1 guide max.'} Delete a guide to create another.
                </span>
                {!isPro && (
                  <button onClick={() => setShowUpgrade(true)} className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1.5 rounded-lg transition-colors">
                    Upgrade
                  </button>
                )}
              </div>
            )}

            {/* Active guide card */}
            {activeGuide ? (
              <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Active Guide</div>
                    <h2 className="text-xl font-black text-white">{activeGuide.path_name}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Week {activeGuide.weeks_unlocked} of 12 in progress
                    </p>
                  </div>
                  <div className="text-3xl">🗺️</div>
                </div>
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span>{activeGuide.weeks_unlocked} / 12 weeks</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${(activeGuide.weeks_unlocked / 12) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-5">
                  {Math.round((activeGuide.weeks_unlocked / 12) * 100)}% complete
                  {!isPro && activeGuide.weeks_unlocked > 2 && ' · Pro required for weeks 3+'}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/guide?path=${encodeURIComponent(activeGuide.path_name)}&id=${activeGuide.id}`}
                    className="inline-block bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                  >
                    Continue Week {activeGuide.weeks_unlocked} →
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(activeGuide.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                    title="Delete guide"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-3"><svg className="w-10 h-10 text-emerald-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
                <h2 className="text-xl font-bold text-white mb-2">No guide yet</h2>
                <p className="text-slate-400 text-sm mb-5">
                  Take the questionnaire to get your personalized hustle roadmap.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                >
                  Start Questionnaire →
                </Link>
              </div>
            )}

            {/* All guides list with multi-select */}
            {guides.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold">All Guides</h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {selected.size === guides.length ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  {selected.size > 0 && (
                    <button
                      onClick={() => setShowMassConfirm(true)}
                      className="flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ✕ Delete {selected.size} selected
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {guides.map(g => {
                    const isSelected = selected.has(g.id)
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-red-500/10 border-red-500/40'
                            : 'bg-white/5 hover:bg-white/8 border-white/10'
                        }`}
                        onClick={() => toggleSelect(g.id)}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-red-500 border-red-500' : 'border-slate-600 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <span className="text-white text-xs font-bold leading-none">✓</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{g.path_name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(g.weeks_unlocked / 12) * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-500 text-xs">Week {g.weeks_unlocked}/12</span>
                          </div>
                        </div>

                        <Link
                          href={`/guide?path=${encodeURIComponent(g.path_name)}&id=${g.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-emerald-400 hover:text-emerald-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          Open →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {recentActivity.map(a => (
                    <div key={a.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <span className="text-lg">{activityIcon(a.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-300 text-sm">{activityLabel(a)}</div>
                      </div>
                      <span className="text-slate-600 text-xs shrink-0">{timeAgo(a.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start new guide */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 text-sm">Want to explore a different path?</span>
              {isPro || guides.length === 0 ? (
                <Link
                  href="/onboarding"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  + New Guide
                </Link>
              ) : (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  + New Guide (Pro)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── MATCHES SECTION ── */}
        {section === 'matches' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Your Matches</h1>
              <p className="text-slate-400 text-sm">Other hustle paths that fit your profile.</p>
            </div>

            {otherPaths.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {otherPaths.map(p => (
                  <div key={p.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-white font-bold text-sm">{p.name}</span>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">{p.matchPercent}%</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{p.description}</p>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${p.matchPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-400">Complete the questionnaire to see your matched paths.</p>
                <Link href="/onboarding" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                  Take Questionnaire →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS SECTION ── */}
        {section === 'progress' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Progress</h1>
              <p className="text-slate-400 text-sm">Your hustle journey so far.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Guides', value: guides.length, icon: '▣', color: 'emerald' },
                { label: 'Weeks Completed', value: totalWeeksCompleted, icon: '✓', color: 'green' },
                { label: 'Check-Ins Submitted', value: totalCheckIns, icon: '↺', color: 'blue' },
                { label: 'Weeks Remaining', value: Math.max(0, guides.length * 12 - totalWeeksCompleted), icon: '◎', color: 'teal' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-slate-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {guides.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-bold">Guide Progress</h3>
                {guides.map(g => (
                  <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">{g.path_name}</span>
                      <span className="text-slate-400 text-sm">{g.weeks_unlocked} / 12 weeks</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${(g.weeks_unlocked / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS SECTION ── */}
        {section === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Settings</h1>
              <p className="text-slate-400 text-sm">Manage your account and subscription.</p>
            </div>

            {/* Subscription status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Subscription</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      isPro
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                      {isPro ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {isPro
                      ? 'Up to 3 guides/month · all 12 weeks · unlimited AI coach'
                      : '1 guide/month · weeks 1–2 only · limited AI coach'}
                  </p>
                </div>
                {!isPro && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                  >
                    Upgrade
                  </button>
                )}
              </div>

              {isPro && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  {cancelMsg ? (
                    <p className="text-slate-300 text-sm">{cancelMsg}</p>
                  ) : (
                    <button
                      onClick={handleCancel}
                      disabled={cancelLoading}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors disabled:opacity-50"
                    >
                      {cancelLoading ? 'Cancelling...' : 'Cancel subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Your Path Matching */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Your Path Matching</h3>
              {otherPaths.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {otherPaths.slice(0, 3).map(p => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-200 text-sm font-medium truncate">{p.name}</span>
                          <span className="text-emerald-400 text-xs font-bold ml-2 shrink-0">{p.matchPercent}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${p.matchPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm mb-5">No matches yet — take the quiz to see your path matches.</p>
              )}
              <button
                onClick={() => setShowRetakeConfirm(true)}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 px-4 py-2 rounded-xl transition-all"
              >
                Retake Quiz
              </button>
            </div>

            {/* Account */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Account</h3>
              <form action="/auth/signout" method="post">
                <button className="text-slate-400 hover:text-white text-sm transition-colors">
                  Sign out →
                </button>
              </form>
            </div>

            {/* Language and Region */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-1">{t('settings.language_section')}</h3>
              <p className="text-slate-500 text-xs mb-4">{t('settings.language_note')}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    {t('settings.language_label')}
                  </label>
                  <LanguageSwitcher variant="settings" />
                </div>
              </div>
              {langSaved && (
                <p className="text-emerald-400 text-sm mt-3">{t('settings.prefs_saved')}</p>
              )}
              <button
                onClick={async () => {
                  await setLanguage(language)
                  setLangSaved(true)
                  setTimeout(() => setLangSaved(false), 2500)
                }}
                className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
              >
                {t('settings.save_prefs')}
              </button>
            </div>

            {/* Delete Account */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-2">Danger Zone</h3>
              <p className="text-slate-500 text-sm mb-4">Permanently delete your account and all data.</p>
              <button
                onClick={() => { setShowDeleteAccount(true); setDeleteConfirmText('') }}
                className="text-red-400 hover:text-red-300 border border-red-700/40 hover:border-red-600/60 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Delete my account
              </button>
            </div>

            {/* Legal links */}
            <div className="flex gap-4 pt-2">
              <Link href="/privacy" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Terms of Service</Link>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1a] border-t border-white/10 flex">
        {NAV_ITEMS.map(item => (
          <button
            key={item.section}
            onClick={() => setSection(item.section)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              section === item.section ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          trigger={!isPro ? 'Free plan is limited to 1 guide. Pro allows up to 3.' : undefined}
        />
      )}

      {/* Retake Quiz Modal */}
      {showRetakeConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowRetakeConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Retake the quiz?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Retaking will generate fresh path matches. Your existing guides and all progress will be kept exactly as they are.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRetakeConfirm(false)}
                  disabled={retaking}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetakeQuiz}
                  disabled={retaking}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                >
                  {retaking ? 'Loading...' : 'Yes, retake'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowDeleteAccount(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Delete your account?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This permanently deletes your account, all guides, check-ins, and progress. This cannot be undone.
                </p>
              </div>
              <div className="mb-4">
                <label className="text-xs text-slate-500 block mb-1.5">Type <span className="text-white font-mono font-bold">DELETE</span> to confirm</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  disabled={deletingAccount}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete everything'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mass delete confirmation modal */}
      {showMassConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowMassConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center mx-auto mb-3"><svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></div>
                <h3 className="text-lg font-bold text-white mb-2">Delete {selected.size} guide{selected.size !== 1 ? 's' : ''}?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All progress, check-ins, and plans for the selected guides will be permanently lost.
                </p>
              </div>
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-5">
                <p className="text-red-400 text-xs text-center font-medium">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMassConfirm(false)}
                  disabled={massDeleting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMassDelete}
                  disabled={massDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                >
                  {massDeleting ? 'Deleting…' : `Delete ${selected.size}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Single delete confirmation modal */}
      {confirmDeleteId && (() => {
        const g = guides.find(x => x.id === confirmDeleteId)
        if (!g) return null
        return (
          <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setConfirmDeleteId(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center mx-auto mb-3"><svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></div>
                  <h3 className="text-lg font-bold text-white mb-2">Delete this guide?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-white font-semibold">{g.path_name}</span> — Week {g.weeks_unlocked} of 12.
                    All progress, check-ins, and plans will be permanently lost.
                  </p>
                </div>
                <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-5">
                  <p className="text-red-400 text-xs text-center font-medium">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === confirmDeleteId}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                  >
                    Keep Guide
                  </button>
                  <button
                    onClick={() => handleDeleteGuide(confirmDeleteId)}
                    disabled={deletingId === confirmDeleteId}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                  >
                    {deletingId === confirmDeleteId ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
