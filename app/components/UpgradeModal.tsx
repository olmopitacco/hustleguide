'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
  trigger?: string
}

export default function UpgradeModal({ onClose, trigger }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
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
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-2xl font-black text-white mb-2">Upgrade to Pro</h2>
          {trigger && (
            <p className="text-slate-400 text-sm mb-2">{trigger}</p>
          )}
          <p className="text-slate-400 text-sm">
            Unlock unlimited guides and AI coaching.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
          {[
            'Unlimited hustle guides',
            'Unlimited AI coach messages',
            'Personalized week-by-week plans',
            'Priority support',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-slate-200 text-sm">
              <span className="text-green-400 font-bold">✓</span>
              {f}
            </div>
          ))}
        </div>

        <div className="text-center mb-5">
          <span className="text-4xl font-black text-white">$12</span>
          <span className="text-slate-400 text-sm"> / month</span>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
        >
          {loading ? 'Redirecting...' : 'Upgrade Now →'}
        </button>

        <p className="text-center text-slate-500 text-xs mt-3">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  )
}
