'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-[#070d1a] flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="text-2xl font-black text-white tracking-tight mb-12">
        Hustle<span className="text-emerald-400">Guide</span>
      </Link>

      <div className="text-8xl font-black text-emerald-400 mb-4 leading-none">404</div>

      <h1 className="text-2xl font-bold text-white mb-3">{t('not_found.title')}</h1>
      <p className="text-slate-500 text-sm mb-10 max-w-xs">
        {t('not_found.body')}
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
      >
        {t('not_found.back')}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  )
}
