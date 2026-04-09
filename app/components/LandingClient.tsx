'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── Sticky nav ───────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0f1e]/95 backdrop-blur border-b border-white/8 shadow-xl' : 'bg-transparent'
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          Hustle<span className="text-emerald-400">Guide</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">How it works</a>
          <a href="#pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</a>
          <Link href="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Login</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            Find My Path — Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0f1e]/98 border-t border-white/8 px-6 py-5 flex flex-col gap-4">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white text-sm font-medium">How it works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white text-sm font-medium">Pricing</a>
          <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium">Login</Link>
          <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all text-center">
            Find My Path — Free
          </Link>
        </div>
      )}
    </header>
  )
}

// ─── Guide mockup ─────────────────────────────────────────────────────────────

function GuideMockup() {
  return (
    <div className="relative mx-auto max-w-md mt-12 md:mt-0">
      {/* Glow */}
      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-3xl scale-110" />
      <div className="relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* App chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#0d1421]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 bg-white/5 rounded-md h-5 mx-4 flex items-center px-3">
            <span className="text-slate-600 text-xs">hustleguide.app/guide</span>
          </div>
        </div>

        <div className="flex text-xs">
          {/* Sidebar */}
          <div className="w-32 bg-[#0d1421] border-r border-white/8 p-3 space-y-1 shrink-0">
            <div className="text-emerald-400 font-bold text-xs px-2 py-1 mb-2 truncate">Freelance Writing</div>
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => (
              <div key={w} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                i === 0 ? 'bg-emerald-600 text-white' :
                i === 1 ? 'text-slate-400' : 'text-slate-700'
              }`}>
                <span className="w-3 text-center">{i < 1 ? '✓' : i === 1 ? '2' : '🔒'}</span>
                <span className="truncate">{w}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 space-y-3 min-w-0">
            <div>
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Week 2</div>
              <div className="text-white font-bold text-sm mt-0.5">Land Your First Client</div>
              <div className="text-slate-500 text-xs mt-1">Find and pitch 5 qualified prospects using cold email outreach.</div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Week progress</span><span>2/4</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-1.5">
              {[
                { done: true, label: 'Write cold email template' },
                { done: true, label: 'Find 10 prospects on LinkedIn' },
                { done: false, label: 'Send first 5 pitches' },
                { done: false, label: 'Follow up with responses' },
              ].map((t, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${t.done ? 'text-slate-600' : 'text-slate-300'}`}>
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    t.done ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'
                  }`}>
                    {t.done && <span className="text-white text-xs leading-none">✓</span>}
                  </div>
                  <span className={t.done ? 'line-through' : ''}>{t.label}</span>
                </div>
              ))}
            </div>

            {/* Chat bubble */}
            <div className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-xl rounded-bl-sm inline-block">
              Your pitch response rate is 22% — above average. Keep going! 🔥
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <span className="text-white font-semibold text-sm pr-4">{q}</span>
        <span className={`text-emerald-400 text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Main landing page client ─────────────────────────────────────────────────

export default function LandingClient() {
  useScrollReveal()

  const TESTIMONIALS = [
    {
      avatar: 'M',
      name: 'Marco, 24',
      location: 'Italy',
      color: 'bg-orange-500',
      quote: 'I tried dropshipping twice and failed. HustleGuide matched me to freelance video editing and I made my first €300 in week 3.',
    },
    {
      avatar: 'S',
      name: 'Sofia, 31',
      location: 'Spain',
      color: 'bg-purple-500',
      quote: 'I had no idea where to start. The quiz took 2 minutes and the guide was genuinely specific to my situation — not generic advice.',
    },
    {
      avatar: 'J',
      name: 'James, 27',
      location: 'UK',
      color: 'bg-blue-500',
      quote: 'Week 4 of my SEO consulting path. Already have two retainer clients. The AI coach is what makes it — I ask questions every day.',
    },
  ]

  const FEATURES = [
    {
      icon: '🎯',
      title: 'Matched to you',
      desc: '40+ paths scored against your exact skills, hours, budget, and goals. No guessing.',
    },
    {
      icon: '📅',
      title: 'Week by week',
      desc: 'Specific daily tasks, scripts, and tools — not "build an audience" type advice.',
    },
    {
      icon: '🔄',
      title: 'Adapts as you go',
      desc: 'Every new week is generated from your actual progress report. It grows with you.',
    },
    {
      icon: '💬',
      title: 'AI coach included',
      desc: 'Ask anything, anytime. Your coach knows your path, your week, and your situation.',
    },
  ]

  const FAQS = [
    {
      q: 'Is this actually free?',
      a: 'Yes. You can take the quiz, get matched, and complete one full guide for free. Pro unlocks all three of your matched paths and unlimited AI coaching.',
    },
    {
      q: 'How is this different from just asking ChatGPT?',
      a: 'ChatGPT gives generic advice. HustleGuide builds a plan around your specific hours, budget, location, and skills — and updates it every week based on your actual progress. It\'s a living roadmap, not a chat.',
    },
    {
      q: 'What if I pick the wrong path?',
      a: 'You can retake the quiz anytime and generate a new set of matches. Your situation changes — your plan should too.',
    },
    {
      q: 'How long until I make money?',
      a: 'It depends on the path and how much time you put in. We give honest, conservative estimates — not hype. Most paths show first results between week 3 and week 8.',
    },
    {
      q: 'Can I cancel Pro anytime?',
      a: 'Yes. Cancel in one click from your settings. No questions asked, no awkward retention flows.',
    },
  ]

  return (
    <div className="bg-[#070d1a] text-white overflow-x-hidden">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/8 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/6 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Free to start — no credit card
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6">
              Stop Googling.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Start Earning.
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Answer 8 questions and get a personalized week-by-week roadmap to your first income online — built around your skills, schedule, and situation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-emerald-500/30 text-center"
              >
                Find My Path — It&apos;s Free →
              </Link>
            </div>
            <p className="text-slate-600 text-sm mt-3">No credit card. 2 minutes.</p>
          </div>

          <div className="hidden md:block">
            <GuideMockup />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="border-y border-white/6 bg-white/2 py-12 px-6 scroll-reveal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-white font-bold text-lg">Join 1,000+ people building income on their own terms</p>
            <p className="text-slate-500 text-sm mt-1">Rated 4.9/5 by early users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 scroll-reveal-stagger visible">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white/4 border border-white/8 rounded-2xl p-5">
                <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Everyone tells you to &ldquo;just start&rdquo;.<br />
              <span className="text-slate-400">Nobody tells you what to actually do.</span>
            </h2>
            <p className="text-slate-500 text-lg mb-14">You&apos;ve seen the YouTube videos. You&apos;ve read the threads. You&apos;re still not earning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 scroll-reveal-stagger">
            {[
              { icon: '😤', title: 'Generic advice that ignores your situation', desc: 'Every guide assumes you have 40 hours a week, €5,000 to invest, and live in the US.' },
              { icon: '🗺️', title: 'No clear starting point or step-by-step plan', desc: '"Build an audience" is not a plan. You need specific tasks for specific days.' },
              { icon: '⏳', title: 'Wasted months on the wrong thing', desc: 'Most people try 3 different paths before finding one that actually fits their life.' },
            ].map(p => (
              <div key={p.title} className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 text-left">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-white font-bold text-sm mb-2">{p.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white/2 border-y border-white/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Your personal roadmap in 3 steps</h2>
            <p className="text-slate-400">From zero to a personalized plan in under 2 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 scroll-reveal-stagger">
            {[
              {
                n: '01', icon: '🧠',
                title: 'Answer 8 honest questions',
                desc: 'Tell us your available time, budget, skills, and income goal. No fluff — just what we need to match you accurately.',
              },
              {
                n: '02', icon: '🎯',
                title: 'Get matched to your best paths',
                desc: 'We score 40+ hustle paths against your exact profile and show you the top 3 with realistic income estimates.',
              },
              {
                n: '03', icon: '📈',
                title: 'Follow a guide that grows with you',
                desc: 'Each week\'s plan is generated based on your check-in from the previous week. It adapts to your real progress.',
              },
            ].map(s => (
              <div key={s.n} className="relative bg-[#0d1421] border border-white/8 rounded-2xl p-6">
                <div className="text-emerald-400 font-black text-4xl font-mono mb-4 opacity-30 absolute top-5 right-5">{s.n}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-white font-bold text-base mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Not a course. Not a PDF.<br />
              <span className="text-emerald-400">A living roadmap.</span>
            </h2>
            <p className="text-slate-400">Built for your situation. Updated from your real progress.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 scroll-reveal-stagger">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4 bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                <div className="text-3xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="text-white font-bold mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 bg-white/2 border-y border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Start free. Upgrade when ready.</h2>
            <p className="text-slate-400">No tricks. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 scroll-reveal-stagger">
            {/* Free */}
            <div className="bg-[#0d1421] border border-white/10 rounded-2xl p-8">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Free</div>
              <div className="text-5xl font-black text-white mb-1">€0</div>
              <div className="text-slate-500 text-sm mb-8">Forever free</div>
              <ul className="space-y-3 mb-8">
                {['Quiz & path matching', '1 full guide (12 weeks)', 'AI coach (5 messages/day)', 'Week-by-week daily plans'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="text-emerald-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-gradient-to-b from-emerald-500/15 to-cyan-500/5 border border-emerald-500/40 rounded-2xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Pro</div>
              <div className="text-5xl font-black text-white mb-1">€12</div>
              <div className="text-slate-500 text-sm mb-8">per month, cancel anytime</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'All 3 matched path guides',
                  'Unlimited AI coach messages',
                  'Progress-adapted weekly plans',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-200 text-sm">
                    <span className="text-emerald-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/25"
              >
                Go Pro →
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6">Cancel anytime. No questions asked.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl font-black mb-3">Common questions</h2>
          </div>
          <div className="space-y-3 scroll-reveal">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/6 blur-3xl" />
        <div className="relative max-w-2xl mx-auto scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Your roadmap is<br />
            <span className="text-emerald-400">2 minutes away.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Find out exactly what to focus on and how to start — for free.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-2xl shadow-emerald-500/30"
          >
            Find My Path Now →
          </Link>
          <p className="text-slate-600 text-sm mt-4">No credit card. No spam. Takes 2 minutes.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-lg font-black text-white mb-1">
              Hustle<span className="text-emerald-400">Guide</span>
            </div>
            <p className="text-slate-600 text-xs">Made for people who are ready to start.</p>
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@hustleguide.app" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-slate-700 text-xs">© 2026 HustleGuide</p>
        </div>
      </footer>
    </div>
  )
}
