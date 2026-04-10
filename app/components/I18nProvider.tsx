'use client'

import { useEffect, createContext, useContext, useState, useCallback } from 'react'
import { I18nextProvider } from 'react-i18next'
import { initI18n, SUPPORTED_LANGUAGES, getCurrency } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

// ─── Context ──────────────────────────────────────────────────────────────────
type LangContext = {
  language: string
  country: string | null
  currency: { symbol: string; code: string }
  setLanguage: (code: string) => void
}

const LanguageContext = createContext<LangContext>({
  language: 'en',
  country: null,
  currency: { symbol: '€', code: 'EUR' },
  setLanguage: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const i18n = initI18n()
  const [language, setLangState] = useState(i18n.language?.slice(0, 2) || 'en')
  const [country, setCountry] = useState<string | null>(null)
  const [currency, setCurrency] = useState(getCurrency(null))

  // Detect country via ipapi.co, resolve currency, and optionally update language
  useEffect(() => {
    const savedLang = localStorage.getItem('hg_language')
    const savedCountry = localStorage.getItem('hg_country')

    if (savedCountry) {
      setCountry(savedCountry)
      setCurrency(getCurrency(savedCountry))
    }

    // If user has manually set a language, respect it
    if (savedLang) {
      applyLanguage(savedLang)
      return
    }

    // Otherwise detect from IP (non-blocking)
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then((data: { country_code?: string; languages?: string }) => {
        const cc = data.country_code ?? null
        if (cc) {
          localStorage.setItem('hg_country', cc)
          setCountry(cc)
          setCurrency(getCurrency(cc))
        }

        // Auto-detect language from IP country if browser doesn't give a supported lang
        const browserLang = navigator.language?.slice(0, 2)
        const supported = SUPPORTED_LANGUAGES.map(l => l.code)
        if (!supported.includes(browserLang)) {
          // Try to pick from country's primary language
          const countryLangMap: Record<string, string> = {
            IT: 'it', ES: 'es', MX: 'es', AR: 'es', CO: 'es',
            FR: 'fr', BE: 'fr', DE: 'de', AT: 'de', CH: 'de',
            PT: 'pt', BR: 'pt', NL: 'nl', PL: 'pl',
          }
          const guessed = countryLangMap[cc ?? '']
          if (guessed) applyLanguage(guessed)
        }
      })
      .catch(() => { /* silently fail */ })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const applyLanguage = useCallback((code: string) => {
    const supported = SUPPORTED_LANGUAGES.map(l => l.code)
    const lang = supported.includes(code) ? code : 'en'
    i18n.changeLanguage(lang)
    setLangState(lang)
    localStorage.setItem('hg_language', lang)
  }, [i18n])

  const setLanguage = useCallback(async (code: string) => {
    applyLanguage(code)

    // Persist to Supabase if logged in
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ preferred_language: code })
          .eq('user_id', user.id)
      }
    } catch { /* ignore */ }
  }, [applyLanguage])

  return (
    <LanguageContext.Provider value={{ language, country, currency, setLanguage }}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  )
}
