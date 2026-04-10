import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en.json'
import it from '../locales/it.json'
import es from '../locales/es.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'
import pt from '../locales/pt.json'
import nl from '../locales/nl.json'
import pl from '../locales/pl.json'

// ─── Supported languages ──────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
  { code: 'es', name: 'Español',    flag: '🇪🇸' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', name: 'Português',  flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski',     flag: '🇵🇱' },
]

// ─── Currency by country code ─────────────────────────────────────────────────
export const CURRENCY_MAP: Record<string, { symbol: string; code: string }> = {
  IT: { symbol: '€', code: 'EUR' }, ES: { symbol: '€', code: 'EUR' },
  FR: { symbol: '€', code: 'EUR' }, DE: { symbol: '€', code: 'EUR' },
  PT: { symbol: '€', code: 'EUR' }, NL: { symbol: '€', code: 'EUR' },
  BE: { symbol: '€', code: 'EUR' }, AT: { symbol: '€', code: 'EUR' },
  FI: { symbol: '€', code: 'EUR' }, GR: { symbol: '€', code: 'EUR' },
  PL: { symbol: 'zł', code: 'PLN' },
  GB: { symbol: '£', code: 'GBP' },
  US: { symbol: '$', code: 'USD' },
  CA: { symbol: 'CA$', code: 'CAD' },
  AU: { symbol: 'A$', code: 'AUD' },
}

export function getCurrency(countryCode?: string | null) {
  return CURRENCY_MAP[countryCode?.toUpperCase() ?? ''] ?? { symbol: '€', code: 'EUR' }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initI18n() {
  if (i18n.isInitialized) return i18n

  const resources = {
    en: { common: en }, it: { common: it }, es: { common: es },
    fr: { common: fr }, de: { common: de }, pt: { common: pt },
    nl: { common: nl }, pl: { common: pl },
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
      defaultNS: 'common',
      ns: ['common'],
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'hg_language',
      },
      interpolation: { escapeValue: false },
    })

  return i18n
}

export default i18n
