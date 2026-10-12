import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

export default function ErrorMessage({ title, message, onRetry, className = '' }) {
  const { t } = useTranslation()
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-600/15 dark:text-red-400">
        <AlertTriangle className="size-7" />
      </div>
      <h3 className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">
        {title || t('common.error')}
      </h3>
      {message && <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-2">
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
