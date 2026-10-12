import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SearchBar({ value = '', onChange, placeholder, className = '', autoFocus = false }) {
  const { t } = useTranslation()
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || t('common.searchPlaceholder')}
        aria-label={t('common.search')}
        className="input ps-10 pe-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.reset')}
          className="absolute end-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
