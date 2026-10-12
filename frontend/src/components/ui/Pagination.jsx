import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function buildPages(current, last) {
  const pages = new Set([1, last, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)
  const result = []
  let previous = 0
  for (const page of sorted) {
    if (page - previous > 1) result.push('…')
    result.push(page)
    previous = page
  }
  return result
}

export default function Pagination({ currentPage = 1, lastPage = 1, onChange, className = '' }) {
  const { t } = useTranslation()
  if (lastPage <= 1) return null

  return (
    <nav className={`flex items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
      >
        <ChevronLeft className="size-4 flip-rtl" />
        <span className="hidden sm:inline">{t('common.previous')}</span>
      </button>

      {buildPages(currentPage, lastPage).map((page, index) =>
        page === '…' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-9 cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
              page === currentPage
                ? 'gradient-brand text-white shadow-sm'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
      >
        <span className="hidden sm:inline">{t('common.next')}</span>
        <ChevronRight className="size-4 flip-rtl" />
      </button>
    </nav>
  )
}
