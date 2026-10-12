import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Home, SearchX, ServerCrash, ShieldX } from 'lucide-react'
import Button from '../../components/ui/Button'

const CONFIG = {
  403: { icon: ShieldX, titleKey: 'errors.403Title', textKey: 'errors.403Text', tone: 'text-amber-500 bg-amber-50 dark:bg-amber-600/15 dark:text-amber-400' },
  404: { icon: SearchX, titleKey: 'errors.404Title', textKey: 'errors.404Text', tone: 'text-primary-600 bg-primary-50 dark:bg-primary-600/15 dark:text-primary-400' },
  500: { icon: ServerCrash, titleKey: 'errors.500Title', textKey: 'errors.500Text', tone: 'text-red-500 bg-red-50 dark:bg-red-600/15 dark:text-red-400' },
}

export default function ErrorPage({ status = 404 }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = CONFIG[status] || CONFIG[404]
  const Icon = config.icon

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className={`flex size-20 items-center justify-center rounded-3xl ${config.tone}`}>
        <Icon className="size-10" />
      </div>
      <p className="font-display gradient-text mt-6 text-5xl font-bold">{status}</p>
      <h1 className="font-display mt-3 text-2xl font-bold text-slate-900 dark:text-slate-50">
        {t(config.titleKey)}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t(config.textKey)}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to="/" icon={Home}>
          {t('errors.backHome')}
        </Button>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </div>
    </div>
  )
}
