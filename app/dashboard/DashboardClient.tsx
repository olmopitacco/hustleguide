'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UpgradeModal from '@/app/components/UpgradeModal'

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
  { label: 'My Guide', icon: '🗺️', href: null, section: 'guide' },
  { label: 'My Matches', icon: '🎯', href: null, section: 'matches' },
  { label: 'Progress', icon: '📈', href: null, section: 'progress' },
  { label: 'Settings', icon: '⚙️', href: null, section: 'settings' },
]

const MOTIVATIONAL = [
  "Every expert was once a beginner. Your first $100 online is closer than you think.",
  "The hustle you start today is the income stream you'll thank yourself for next year.",
  "Most people quit at week 2. You're still here — that's already the edge.",
  "Your skills have value. You just need to find the right buyers.",
  "Small consistent actions compound into big results. Keep going.",
]

function activityIcon(type: string) {
  if (type === 'guide_started') return '🚀'
  if (type === 'week_completed') return '✅'
  if (type === 'checkin_submitted') return '📝'
  return '⭐'
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
  const [section, setSection] = useState('guide')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [massDeleting, setMassDeleting] = useState(false)
  const [showMassConfirm, setShowMassConfirm] = useState(false)

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
    <div className="flex min-h-screen bg-gradient-to-br [#070d1a]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col py-8 px-4">
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
      <main className="flex-1 px-8 py-8 overflow-y-auto">
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
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Guides', value: `${guides.length}/${guideLimit}`, icon: '📋', sub: isPro ? 'Pro limit' : 'Free limit' },
                { label: 'Weeks Done', value: totalWeeksCompleted, icon: '✅', sub: 'check-ins submitted' },
                { label: 'Check-Ins', value: totalCheckIns, icon: '📝', sub: 'total reflections' },
                { label: 'Completion', value: guides.length > 0 ? `${Math.round((totalWeeksCompleted / (guides.length * 12)) * 100)}%` : '—', icon: '🎯', sub: 'towards 12 weeks' },
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
                    className="text-slate-600 hover:text-red-400 text-sm transition-colors"
                    title="Delete guide"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">🚀</div>
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
                      🗑️ Delete {selected.size} selected
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
                { label: 'Total Guides', value: guides.length, icon: '📋', color: 'emerald' },
                { label: 'Weeks Completed', value: totalWeeksCompleted, icon: '✅', color: 'green' },
                { label: 'Check-Ins Submitted', value: totalCheckIns, icon: '📝', color: 'blue' },
                { label: 'Weeks Remaining', value: Math.max(0, guides.length * 12 - totalWeeksCompleted), icon: '🎯', color: 'teal' },
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
                      ? 'Unlimited guides and AI coaching.'
                      : '1 guide, 5 AI messages/day.'}
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

            {/* Account */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Account</h3>
              <form action="/auth/signout" method="post">
                <button className="text-slate-400 hover:text-white text-sm transition-colors">
                  Sign out →
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          trigger={!isPro ? 'Free plan is limited to 1 guide. Pro allows up to 3.' : undefined}
        />
      )}

      {/* Mass delete confirmation modal */}
      {showMassConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowMassConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center text-2xl mx-auto mb-3">🗑️</div>
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
                  <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center text-2xl mx-auto mb-3">🗑️</div>
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
