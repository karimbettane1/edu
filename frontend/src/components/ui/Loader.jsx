import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Spinner({ className = 'size-5' }) {
  return <LoaderCircle className={`animate-spin text-primary-600 dark:text-primary-400 ${className}`} />
}

export default function Loader({ label, className = '' }) {
  const { t } = useTranslation()
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`} role="status">
      <Spinner className="size-8" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label || t('common.loading')}</p>
    </div>
  )
}
