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

// NAV_ITEMS labels are set dynamically via t() in the component
const NAV_SECTIONS = [
  { icon: '🗺️', section: 'guide',    tKey: 'dashboard.tab_guide' },
  { icon: '🎯', section: 'matches',  tKey: 'dashboard.tab_matches' },
  { icon: '📈', section: 'progress', tKey: 'dashboard.tab_progress' },
  { icon: '⚙️', section: 'settings', tKey: 'dashboard.tab_settings' },
]

/** Convert English path name to i18n slug key */
function pathSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function activityIcon(type: string) {
  if (type === 'guide_started') return '🚀'
  if (type === 'week_completed') return '✅'
  if (type === 'checkin_submitted') return '📝'
  return '⭐'
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
        alert(data.error ?? t('common.error'))
      }
    } catch {
      alert(t('common.error'))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  // Motivational message — rotate daily, fully translated
  const motivationalIndex = Math.floor(Date.now() / 86400000) % 5
  const motivational = t(`dashboard.motivational_${motivationalIndex}`)

  // Translated path name helper
  function tPathName(name: string): string {
    const key = `paths.${pathSlug(name)}.name`
    const translated = t(key)
    // Fall back to original name if key not found (returns the key itself)
    return translated === key ? name : translated
  }

  function tPathDesc(name: string): string {
    const key = `paths.${pathSlug(name)}.desc`
    const translated = t(key)
    return translated === key ? '' : translated
  }

  // Translated activity label
  function activityLabel(activity: Activity): string {
    if (activity.type === 'guide_started') return t('dashboard.activity_guide_started', { path: String(activity.payload.path_name ?? '') })
    if (activity.type === 'week_completed') return t('dashboard.activity_week_completed', { week: String(activity.payload.week_number ?? ''), path: String(activity.payload.path_name ?? '') })
    if (activity.type === 'checkin_submitted') return t('dashboard.activity_checkin', { week: String(activity.payload.week_number ?? '') })
    return t('common.loading')
  }

  // Translated time-ago
  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor(diff / 60000)
    if (days > 0) return t('dashboard.time_ago_days', { n: days })
    if (hours > 0) return t('dashboard.time_ago_hours', { n: hours })
    return t('dashboard.time_ago_mins', { n: mins })
  }

  async function handleCancel() {
    if (!confirm(t('dashboard.cancel_sub_confirm'))) return
    setCancelLoading(true)
    setCancelMsg('')
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.cancelled) {
        const end = data.end_date ? new Date(data.end_date).toLocaleDateString() : ''
        setCancelMsg(t('dashboard.cancel_success_date', { date: end }))
      } else {
        setCancelMsg(data.error ?? t('common.error'))
      }
    } catch {
      setCancelMsg(t('dashboard.cancel_failed'))
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
          {NAV_SECTIONS.map(item => (
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
              {t(item.tKey)}
            </button>
          ))}
        </nav>

        <div className="space-y-3 mt-auto pt-6 border-t border-white/10">
          {!isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-bold px-3 py-2.5 rounded-xl transition-all text-left flex items-center gap-2"
            >
              <span>⚡</span> {t('settings.upgrade_btn')}
            </button>
          )}
          {isPro && (
            <div className="px-3 py-2 text-xs text-green-400 font-medium flex items-center gap-2">
              <span>✓</span> {t('dashboard.pro_member')}
            </div>
          )}
          <div className="px-2">
            <span className="text-slate-500 text-xs block truncate">{userName}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-slate-500 hover:text-slate-300 text-xs px-2 transition-colors">
              {t('dashboard.sign_out')}
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
            <span className="font-medium">{t('dashboard.upgraded_title')} {t('dashboard.upgraded_msg')}</span>
          </div>
        )}

        {/* ── GUIDE SECTION ── */}
        {section === 'guide' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{t('dashboard.welcome', { name: userName.split(' ')[0] })}</h1>
              <p className="text-slate-400 text-sm italic">{motivational}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t('dashboard.active_guide'), value: `${guides.length}/${guideLimit}`, icon: '📋', sub: isPro ? t('dashboard.pro_badge') : t('dashboard.free_badge') },
                { label: t('dashboard.tab_progress'), value: totalWeeksCompleted, icon: '✅', sub: t('dashboard.weeks_completed') },
                { label: t('dashboard.check_ins'), value: totalCheckIns, icon: '📝', sub: t('dashboard.check_ins') },
                { label: '%', value: guides.length > 0 ? `${Math.round((totalWeeksCompleted / (guides.length * 12)) * 100)}%` : '—', icon: '🎯', sub: t('dashboard.12_wks_label') },
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
                  {isPro
                    ? t('dashboard.plan_limit_pro', { n: PRO_GUIDE_LIMIT })
                    : t('dashboard.plan_limit_free')}
                </span>
                {!isPro && (
                  <button onClick={() => setShowUpgrade(true)} className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1.5 rounded-lg transition-colors">
                    {t('dashboard.upgrade_btn_short')}
                  </button>
                )}
              </div>
            )}

            {/* Active guide card */}
            {activeGuide ? (
              <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">{t('dashboard.active_guide')}</div>
                    <h2 className="text-xl font-black text-white">{tPathName(activeGuide.path_name)}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {t('dashboard.week_in_progress', { n: activeGuide.weeks_unlocked })}
                    </p>
                  </div>
                  <div className="text-3xl">🗺️</div>
                </div>
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{t('dashboard.progress_label')}</span>
                    <span>{t('dashboard.progress_of_12', { n: activeGuide.weeks_unlocked })}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${(activeGuide.weeks_unlocked / 12) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-5">
                  {t('dashboard.percent_complete', { pct: Math.round((activeGuide.weeks_unlocked / 12) * 100) })}
                  {!isPro && activeGuide.weeks_unlocked > 2 && ` ${t('dashboard.pro_weeks_note')}`}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/guide?path=${encodeURIComponent(activeGuide.path_name)}&id=${activeGuide.id}`}
                    className="inline-block bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                  >
                    {t('dashboard.continue_week', { n: activeGuide.weeks_unlocked })}
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(activeGuide.id)}
                    className="text-slate-600 hover:text-red-400 text-sm transition-colors"
                    title={t('dashboard.delete_guide')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h2 className="text-xl font-bold text-white mb-2">{t('dashboard.no_guide')}</h2>
                <p className="text-slate-400 text-sm mb-5">
                  {t('dashboard.start_guide')}
                </p>
                <Link
                  href="/onboarding"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                >
                  {t('dashboard.start_guide')} →
                </Link>
              </div>
            )}

            {/* All guides list with multi-select */}
            {guides.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold">{t('dashboard.active_guide')}</h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {selected.size === guides.length ? t('dashboard.deselect_all') : t('dashboard.select_all')}
                    </button>
                  </div>
                  {selected.size > 0 && (
                    <button
                      onClick={() => setShowMassConfirm(true)}
                      className="flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      🗑️ {t('dashboard.delete_n_selected', { n: selected.size })}
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
                          <div className="text-white text-sm font-medium">{tPathName(g.path_name)}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(g.weeks_unlocked / 12) * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-500 text-xs">{t('dashboard.week_n_slash_12', { n: g.weeks_unlocked })}</span>
                          </div>
                        </div>

                        <Link
                          href={`/guide?path=${encodeURIComponent(g.path_name)}&id=${g.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-emerald-400 hover:text-emerald-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          {t('dashboard.open_guide')}
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
                <h3 className="text-white font-bold mb-3">{t('dashboard.recent_activity')}</h3>
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
              <span className="text-slate-500 text-sm">{t('dashboard.explore_prompt')}</span>
              {isPro || guides.length === 0 ? (
                <Link
                  href="/onboarding"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  {t('dashboard.new_guide_btn')}
                </Link>
              ) : (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  {t('dashboard.new_guide_pro_btn')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── MATCHES SECTION ── */}
        {section === 'matches' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{t('dashboard.tab_matches')}</h1>
              <p className="text-slate-400 text-sm">{t('dashboard.other_paths_sub')}</p>
            </div>

            {otherPaths.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {otherPaths.map(p => (
                  <div key={p.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-white font-bold text-sm">{tPathName(p.name)}</span>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">{p.matchPercent}%</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{tPathDesc(p.name) || p.description}</p>
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
                <p className="text-slate-400">{t('dashboard.complete_questionnaire')}</p>
                <Link href="/onboarding" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                  {t('dashboard.take_questionnaire')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS SECTION ── */}
        {section === 'progress' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{t('dashboard.tab_progress')}</h1>
              <p className="text-slate-400 text-sm">{t('dashboard.weeks_completed')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('dashboard.total_guides_label'), value: guides.length, icon: '📋' },
                { label: t('dashboard.weeks_completed'), value: totalWeeksCompleted, icon: '✅' },
                { label: t('dashboard.checkins_submitted_label'), value: totalCheckIns, icon: '📝' },
                { label: t('dashboard.weeks_remaining_label'), value: Math.max(0, guides.length * 12 - totalWeeksCompleted), icon: '🎯' },
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
                <h3 className="text-white font-bold">{t('dashboard.guide_progress_label')}</h3>
                {guides.map(g => (
                  <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">{tPathName(g.path_name)}</span>
                      <span className="text-slate-400 text-sm">{t('dashboard.progress_of_12', { n: g.weeks_unlocked })}</span>
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
              <h1 className="text-3xl font-black text-white mb-1">{t('settings.headline')}</h1>
              <p className="text-slate-400 text-sm">{t('settings.plan_section')}</p>
            </div>

            {/* Subscription status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">{t('settings.plan_section')}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      isPro
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                      {isPro ? t('landing_pricing.pro_label') : t('landing_pricing.free_label')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {isPro ? t('settings.plan_pro_desc') : t('settings.plan_free_desc')}
                  </p>
                </div>
                {!isPro && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                  >
                    {t('dashboard.upgrade_btn_short')}
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
                      {cancelLoading ? t('settings.cancelling') : t('settings.cancel_btn')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Your Path Matching */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">{t('settings.quiz_section')}</h3>
              {otherPaths.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {otherPaths.slice(0, 3).map(p => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-200 text-sm font-medium truncate">{tPathName(p.name)}</span>
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
                <p className="text-slate-500 text-sm mb-5">{t('dashboard.no_matches_yet')}</p>
              )}
              <button
                onClick={() => setShowRetakeConfirm(true)}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 px-4 py-2 rounded-xl transition-all"
              >
                {t('settings.retake_quiz')}
              </button>
            </div>

            {/* Account */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">{t('dashboard.account_section')}</h3>
              <form action="/auth/signout" method="post">
                <button className="text-slate-400 hover:text-white text-sm transition-colors">
                  {t('dashboard.sign_out_arrow')}
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
              <h3 className="text-white font-bold mb-2">{t('settings.danger_section')}</h3>
              <p className="text-slate-500 text-sm mb-4">{t('settings.delete_desc')}</p>
              <button
                onClick={() => { setShowDeleteAccount(true); setDeleteConfirmText('') }}
                className="text-red-400 hover:text-red-300 border border-red-700/40 hover:border-red-600/60 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              >
                {t('settings.delete_account')}
              </button>
            </div>

            {/* Legal links */}
            <div className="flex gap-4 pt-2">
              <Link href="/privacy" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{t('dashboard.privacy_policy')}</Link>
              <Link href="/terms" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{t('dashboard.terms_of_service')}</Link>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1a] border-t border-white/10 flex">
        {NAV_SECTIONS.map(item => (
          <button
            key={item.section}
            onClick={() => setSection(item.section)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              section === item.section ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{t(item.tKey)}</span>
          </button>
        ))}
      </nav>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          trigger={!isPro ? t('dashboard.upgrade_trigger') : undefined}
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
                <h3 className="text-lg font-bold text-white mb-2">{t('dashboard.retake_title')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t('dashboard.retake_body')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRetakeConfirm(false)}
                  disabled={retaking}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleRetakeQuiz}
                  disabled={retaking}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                >
                  {retaking ? t('dashboard.loading_label') : t('dashboard.retake_yes')}
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
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center text-2xl mx-auto mb-3">🗑️</div>
                <h3 className="text-lg font-bold text-white mb-2">{t('dashboard.delete_account_title')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t('dashboard.delete_account_body')}
                </p>
              </div>
              <div className="mb-4">
                <label className="text-xs text-slate-500 block mb-1.5">{t('dashboard.delete_type_label')}</label>
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
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm"
                >
                  {deletingAccount ? t('dashboard.deleting_label') : t('dashboard.delete_everything_btn')}
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
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/60 flex items-center justify-center text-2xl mx-auto mb-3">🗑️</div>
                <h3 className="text-lg font-bold text-white mb-2">{t('dashboard.mass_delete_title', { n: selected.size })}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t('dashboard.mass_delete_body')}
                </p>
              </div>
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-5">
                <p className="text-red-400 text-xs text-center font-medium">{t('dashboard.cannot_be_undone')}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMassConfirm(false)}
                  disabled={massDeleting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleMassDelete}
                  disabled={massDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                >
                  {massDeleting ? t('dashboard.deleting_label') : t('dashboard.delete_n_btn', { n: selected.size })}
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
                  <h3 className="text-lg font-bold text-white mb-2">{t('dashboard.delete_guide_title')}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('dashboard.delete_guide_body', { path: tPathName(g.path_name), n: g.weeks_unlocked })}
                  </p>
                </div>
                <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-5">
                  <p className="text-red-400 text-xs text-center font-medium">{t('dashboard.cannot_be_undone')}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === confirmDeleteId}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                  >
                    {t('dashboard.keep_guide_btn')}
                  </button>
                  <button
                    onClick={() => handleDeleteGuide(confirmDeleteId)}
                    disabled={deletingId === confirmDeleteId}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition-colors text-sm"
                  >
                    {deletingId === confirmDeleteId ? t('dashboard.deleting_label') : t('dashboard.yes_delete_btn')}
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
