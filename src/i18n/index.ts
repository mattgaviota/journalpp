import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import es from './locales/es'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'ES', nativeLabel: 'Español', flag: '🇪🇸' },
] as const

export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'jrnl_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
