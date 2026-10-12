import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

export const LANGUAGES = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
]

export const LANGUAGE_STORAGE_KEY = 'da_lang'

export function getStoredLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return LANGUAGES.some((l) => l.code === stored) ? stored : 'fr'
}

export function applyDocumentLanguage(lang) {
  const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]
  document.documentElement.lang = meta.code
  document.documentElement.dir = meta.dir
}

const initialLanguage = getStoredLanguage()

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

applyDocumentLanguage(initialLanguage)

i18n.on('languageChanged', (lang) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  applyDocumentLanguage(lang)
})

export default i18n
