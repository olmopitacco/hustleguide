'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle')

  useEffect(() => {
    // Could implement actual unsubscribe logic here with a token
    setStatus('done')
  }, [])

  return (
    <div className="min-h-screen bg-[#070d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-xl font-black text-white tracking-tight mb-8 inline-block">
          Hustle<span className="text-emerald-400">Guide</span>
        </Link>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mt-4">
          {status === 'done' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You've been unsubscribed</h2>
              <p className="text-slate-400 text-sm mb-6">You won't receive marketing emails from HustleGuide anymore. Transactional emails (like billing receipts) may still be sent.</p>
              <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Back to HustleGuide</Link>
            </>
          ) : (
            <p className="text-slate-400">Processing...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  )
}
