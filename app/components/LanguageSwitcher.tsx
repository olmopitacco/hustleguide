'use client'

import { useState, useRef, useEffect } from 'react'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { useLanguage } from './I18nProvider'

type Props = {
  variant?: 'navbar' | 'settings'
}

export default function LanguageSwitcher({ variant = 'navbar' }: Props) {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = SUPPORTED_LANGUAGES.find(l => l.code === language) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (variant === 'settings') {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white hover:border-white/20 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm">
            <span>{current.flag}</span>
            <span>{current.name}</span>
          </span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 16 16">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors ${
                  lang.code === language ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {lang.code === language && <span className="ml-auto text-emerald-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // navbar variant
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${
                lang.code === language ? 'text-emerald-400 font-semibold' : 'text-slate-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.code === language && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
