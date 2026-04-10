import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let subscriptionStatus = 'free'
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single()
    subscriptionStatus = data?.subscription_status ?? 'free'
  }

  return (
    <div className="min-h-screen bg-[#070d1a]">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-white/10">
        <Link href="/" className="text-2xl font-black text-white tracking-tight">
          Hustle<span className="text-emerald-400">Guide</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
              Dashboard →
            </Link>
          ) : (
            <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-black text-white mb-4">Simple Pricing</h1>
        <p className="text-slate-400 text-lg mb-16">Start free. Upgrade when you&apos;re ready to go all in.</p>

        <div className="grid md:grid-cols-2 gap-6 text-left">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Free</div>
            <div className="text-4xl font-black text-white mb-1">$0</div>
            <div className="text-slate-500 text-sm mb-8">Forever free</div>
            <ul className="space-y-3 mb-8">
              {[
                '1 guide per month',
                'Weeks 1–2 only',
                'Limited AI coach messages',
                'Week-by-week daily plans',
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-emerald-400 font-bold">✓</span> {f}
                </li>
              ))}
              {[
                'Weeks 3–12',
                'Up to 3 guides/month',
                'Unlimited AI coaching',
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-600 text-sm line-through">
                  <span>✕</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href={user ? '/dashboard' : '/login'}
              className="block text-center bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-all"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-emerald-500/8 border border-emerald-500/40 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </div>
            <div className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3">Pro</div>
            <ul className="space-y-3 mb-8 mt-2">
              {[
                'Up to 3 guides per month',
                'All 12 weeks per guide',
                'Unlimited AI coach messages',
                'Progress-adapted weekly plans',
                'Priority support',
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-200 text-sm">
                  <span className="text-emerald-400 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <PricingClient isPro={subscriptionStatus === 'pro'} isLoggedIn={!!user} />
          </div>
        </div>

        <p className="text-slate-600 text-sm mt-10">
          Questions? Email us at support@hustleguide.app
        </p>
      </main>
    </div>
  )
}
