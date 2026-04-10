'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
  trigger?: string
}

export default function UpgradeModal({ onClose, trigger }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
      }
    } catch {
      setError('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl leading-none"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white mb-2">Upgrade to Pro</h2>
          {trigger && (
            <p className="text-slate-400 text-sm mb-1">{trigger}</p>
          )}
          <p className="text-slate-400 text-sm">
            Unlock all 12 weeks and unlimited AI coaching.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
              plan === 'monthly'
                ? 'bg-white/10 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan('annual')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all relative ${
              plan === 'annual'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              Save €45
            </span>
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-5">
          {plan === 'monthly' ? (
            <>
              <span className="text-4xl font-black text-white">€12</span>
              <span className="text-slate-400 text-sm"> / month</span>
              <p className="text-slate-500 text-xs mt-1">€144 per year</p>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-white">€99</span>
              <span className="text-slate-400 text-sm"> / year</span>
              <p className="text-emerald-400 text-xs mt-1 font-semibold">That's €8.25/mo — save €45 vs monthly</p>
            </>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
          {[
            'Up to 3 guides per month',
            'All 12 weeks per guide',
            'Unlimited AI coach messages',
            'Progress-adapted weekly plans',
            'Priority support',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-slate-200 text-sm">
              <span className="text-emerald-400 font-bold">✓</span>
              {f}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
        >
          {loading ? 'Redirecting...' : `Get Pro ${plan === 'annual' ? '— €99/yr' : '— €12/mo'} →`}
        </button>

        <p className="text-center text-slate-500 text-xs mt-3">
          {plan === 'annual' ? 'Renews yearly. Cancel anytime.' : 'Cancel anytime. No hidden fees.'}
        </p>
      </div>
    </div>
  )
}
