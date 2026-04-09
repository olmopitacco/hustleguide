import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* Nav */}
      <header className="border-b border-white/8 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-white tracking-tight">
            Hustle<span className="text-emerald-400">Guide</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: April 2026</p>
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. What data we collect</h2>
            <p className="mb-3">When you use HustleGuide, we collect the following data:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-white">Account information</strong> — your name and email address when you sign up.</li>
              <li><strong className="text-white">Quiz answers</strong> — your available hours, budget, skills, location, income goals, and work preferences. This is used exclusively to generate your personalized guide.</li>
              <li><strong className="text-white">Progress data</strong> — which weeks you've completed, your check-in responses, and task completions within your guide.</li>
              <li><strong className="text-white">Payment information</strong> — if you upgrade to Pro, Stripe processes your payment. We never see or store your card details.</li>
              <li><strong className="text-white">Usage data</strong> — basic information like last login time, used to send you relevant emails (e.g. a nudge if you haven't opened your guide in a while).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>To generate your personalized income path guide using AI.</li>
              <li>To send you transactional emails (welcome, guide ready, weekly progress summaries).</li>
              <li>To manage your subscription if you're on a Pro plan.</li>
              <li>To improve the service (anonymized, aggregated analytics only).</li>
            </ul>
            <p className="mt-3 text-slate-400">We do not use your data for advertising. We do not build ad profiles. We do not sell your data to anyone — full stop.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Third-party services</h2>
            <div className="space-y-4 text-slate-400">
              <div>
                <p className="font-semibold text-white">Supabase</p>
                <p>We use Supabase to store your account, profile, and guide data. Data is stored on secure servers in the EU. See <a href="https://supabase.com/privacy" className="text-emerald-400 hover:underline" target="_blank">Supabase's Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Stripe</p>
                <p>Payments are processed by Stripe. We never see your full card number or CVV. Stripe is PCI-DSS compliant. See <a href="https://stripe.com/privacy" className="text-emerald-400 hover:underline" target="_blank">Stripe's Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Anthropic (Claude AI)</p>
                <p>We send anonymized profile data (your quiz answers, without your email or name) to Anthropic's API to generate your personalized guide content. This data is not used to train their models. See <a href="https://www.anthropic.com/privacy" className="text-emerald-400 hover:underline" target="_blank">Anthropic's Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Resend</p>
                <p>We use Resend to send transactional emails. Your email address is shared with Resend for this purpose only.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p className="text-slate-400">We use only essential cookies required for authentication (to keep you logged in). We do not use tracking cookies, advertising cookies, or any third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data retention</h2>
            <p className="text-slate-400">We keep your data for as long as your account is active. If you delete your account, all your personal data, quiz answers, and guide content will be permanently deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your rights</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-white">Access</strong> — you can request a copy of all data we hold about you.</li>
              <li><strong className="text-white">Deletion</strong> — you can delete your account and all associated data at any time from the Settings page.</li>
              <li><strong className="text-white">Correction</strong> — you can update your profile information at any time.</li>
              <li><strong className="text-white">Opt-out</strong> — you can unsubscribe from emails at any time using the link at the bottom of any email we send.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p className="text-slate-400">
              For any privacy-related questions or requests, email us at{' '}
              <a href="mailto:privacy@hustleguide.app" className="text-emerald-400 hover:underline">privacy@hustleguide.app</a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 items-center justify-between text-sm text-slate-500">
          <span>© 2026 HustleGuide</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-emerald-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:support@hustleguide.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
