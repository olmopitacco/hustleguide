'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  isPro: boolean
  isLoggedIn: boolean
}

export default function PricingClient({ isPro, isLoggedIn }: Props) {
  const router = useRouter()
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (isPro) return

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

  if (isPro) {
    return (
      <div className="w-full text-center bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-3 rounded-xl">
        ✓ You&apos;re on Pro
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Plan toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/10">
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
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
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

      {/* Price */}
      <div>
        {plan === 'monthly' ? (
          <div>
            <span className="text-3xl font-black text-white">€12</span>
            <span className="text-slate-400 text-sm"> / month</span>
          </div>
        ) : (
          <div>
            <span className="text-3xl font-black text-white">€99</span>
            <span className="text-slate-400 text-sm"> / year</span>
            <p className="text-emerald-400 text-xs mt-0.5 font-semibold">€8.25/mo — save €45</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
      >
        {loading
          ? 'Redirecting...'
          : isLoggedIn
            ? `Upgrade — ${plan === 'annual' ? '€99/yr' : '€12/mo'} →`
            : 'Get Started →'}
      </button>

      <p className="text-center text-slate-600 text-xs">
        {plan === 'annual' ? 'Renews yearly. Cancel anytime.' : 'Cancel anytime. No hidden fees.'}
      </p>
    </div>
  )
}
