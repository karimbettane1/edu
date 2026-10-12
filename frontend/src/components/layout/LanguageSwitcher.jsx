import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../i18n'

export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const current = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0]

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('common.language')}
        aria-expanded={open}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
      >
        <Globe className="size-4.5" />
        <span className="text-xs font-semibold uppercase">{current.code}</span>
      </button>

      {open && (
        <div className="absolute end-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setOpen(false)
              }}
              className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
            >
              {lang.label}
              {lang.code === current.code && <Check className="size-4 text-primary-600 dark:text-primary-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
