'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import type { ScoredPath } from '@/lib/hustlePaths'
import UpgradeModal from '@/app/components/UpgradeModal'

type Props = {
  top3: ScoredPath[]
  rest: ScoredPath[]
  userId: string
  userName: string
  subscriptionStatus: string
  monthlyGuideCount: number
}

function MatchBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm font-bold text-white tabular-nums w-10 text-right">{percent}%</span>
    </div>
  )
}

export default function ResultsClient({ top3, rest, userId, userName, subscriptionStatus, monthlyGuideCount }: Props) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [confirmPath, setConfirmPath] = useState<string | null>(null)

  const isPro = subscriptionStatus === 'pro'
  const MONTHLY_LIMIT = isPro ? 3 : 1
  const atLimit = monthlyGuideCount >= MONTHLY_LIMIT

  function confirmMessage(): string {
    const remaining = MONTHLY_LIMIT - monthlyGuideCount
    if (MONTHLY_LIMIT === 1) {
      return t('results.confirm_use')
    }
    if (remaining === 1) {
      return t('results.confirm_last', { n: monthlyGuideCount + 1, max: MONTHLY_LIMIT })
    }
    return t('results.confirm_nth', { n: monthlyGuideCount + 1, max: MONTHLY_LIMIT })
  }

  async function doGenerate(pathName: string) {
    setConfirmPath(null)
    setLoading(pathName)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('generated_guides')
      .insert({ user_id: userId, path_name: pathName, content: {} })
      .select('id')
      .single()

    if (error || !data) {
      console.error(error)
      setLoading(null)
      return
    }

    router.push(`/guide?path=${encodeURIComponent(pathName)}&id=${data.id}`)
  }

  function handleGenerate(pathName: string) {
    if (atLimit) {
      setShowUpgrade(true)
      return
    }
    setConfirmPath(pathName)
  }

  return (
    <div className="min-h-screen bg-[#070d1a]">
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          trigger={isPro
            ? t('results.limit_hit_pro')
            : t('results.upgrade_prompt')
          }
        />
      )}

      {/* Generation confirmation modal */}
      {confirmPath && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setConfirmPath(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
              <div className="text-center mb-5">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t('results.confirm_title', { path: confirmPath })}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{confirmMessage()}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">{t('results.monthly_usage')}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: MONTHLY_LIMIT }).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full border ${
                        i < monthlyGuideCount
                          ? 'bg-slate-600 border-slate-600'
                          : i === monthlyGuideCount
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-700'
                      }`} />
                    ))}
                  </div>
                  <span className="text-white text-xs font-bold tabular-nums">{monthlyGuideCount + 1}/{MONTHLY_LIMIT}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmPath(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
                >
                  {t('results.cancel')}
                </button>
                <button
                  onClick={() => doGenerate(confirmPath)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all text-sm"
                >
                  {t('results.confirm_btn')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Monthly quota banner */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: MONTHLY_LIMIT }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${
                  i < monthlyGuideCount ? 'bg-slate-600' : 'bg-emerald-500'
                }`} />
              ))}
            </div>
            <span className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{monthlyGuideCount}/{MONTHLY_LIMIT}</span> {t('results.guides_label')}
              {atLimit && <span className="text-red-400 ml-2 font-medium">· {t('results.limit_reached')}</span>}
            </span>
          </div>
          {!isPro && (
            <button onClick={() => setShowUpgrade(true)} className="shrink-0 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('results.upgrade_for_more')}
            </button>
          )}
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            {t('results.analysis_complete')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            {t('results.top_matches_headline')}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('results.top_matches_sub', { name: userName })}
          </p>
        </div>

        {/* Top 3 cards */}
        <div className="space-y-5 mb-14">
          {top3.map((path, i) => (
            <div
              key={path.name}
              className={`relative rounded-2xl border overflow-hidden transition-all
                ${i === 0
                  ? 'border-emerald-500/40 bg-emerald-500/8'
                  : 'border-white/10 bg-white/5'
                }`}
            >
              {/* Rank badge */}
              {i === 0 && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  {t('results.best_match')}
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`text-4xl md:text-5xl leading-none ${i === 0 ? '' : 'opacity-90'}`}>
                    {path.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-black text-white">{path.name}</h2>
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full
                        ${i === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <MatchBar percent={path.matchPercent} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-3">
                  {path.description}
                </p>

                {/* Explanation */}
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-5">
                  {path.explanation}
                </p>

                {/* Income + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">
                      {t('results.realistic_income')}
                    </div>
                    <div className="text-white font-bold text-sm">{path.incomeRange}</div>
                  </div>

                  <button
                    onClick={() => handleGenerate(path.name)}
                    disabled={loading !== null}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all
                      ${i === 0
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                      } disabled:opacity-50`}
                  >
                    {loading === path.name ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        {t('results.building_guide')}
                      </>
                    ) : atLimit ? (
                      <>{t('results.upgrade_for_guides')}</>
                    ) : (
                      <>
                        {t('results.generate_btn')}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of the paths */}
        <div>
          <h2 className="text-xl font-black text-white mb-2">{t('results.all_other_paths')}</h2>
          <p className="text-slate-500 text-sm mb-5">{t('results.all_other_paths_sub')}</p>

          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {rest.map((path) => (
              <div
                key={path.name}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors group"
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{path.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-slate-200 font-semibold text-sm block">{path.name}</span>
                  <span className="text-slate-500 text-xs leading-snug hidden group-hover:block mt-0.5">{path.description}</span>
                </span>
                <div className="hidden sm:flex items-center gap-2 w-28">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/60 rounded-full"
                      style={{ width: `${path.matchPercent}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs font-semibold tabular-nums w-8 text-right">{path.matchPercent}%</span>
                </div>
                <span className="sm:hidden text-slate-400 text-xs font-semibold">{path.matchPercent}%</span>
                <button
                  onClick={() => handleGenerate(path.name)}
                  disabled={loading !== null}
                  className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-30"
                >
                  {t('results.generate_btn_short')}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
