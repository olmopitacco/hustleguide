'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  isPro: boolean
  isLoggedIn: boolean
}

export default function PricingClient({ isPro, isLoggedIn }: Props) {
  const router = useRouter()
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

  if (isPro) {
    return (
      <div className="w-full text-center bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-3 rounded-xl">
        ✓ You&apos;re on Pro
      </div>
    )
  }

  return (
    <>
      {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
      >
        {loading ? 'Redirecting...' : isLoggedIn ? 'Upgrade to Pro →' : 'Get Started →'}
      </button>
    </>
  )
}
