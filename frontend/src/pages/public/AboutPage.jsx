import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Heart, Rocket, ShieldCheck, Sparkles, Target } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import { formatNumber } from '../../utils/format'

const VALUES = [
  { icon: Heart, titleKey: 'about.value1Title', textKey: 'about.value1Text', tone: 'text-rose-500 bg-rose-50 dark:bg-rose-600/15 dark:text-rose-400' },
  { icon: ShieldCheck, titleKey: 'about.value2Title', textKey: 'about.value2Text', tone: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-600/15 dark:text-emerald-400' },
  { icon: Sparkles, titleKey: 'about.value3Title', textKey: 'about.value3Text', tone: 'text-amber-500 bg-amber-50 dark:bg-amber-600/15 dark:text-amber-400' },
]

export default function AboutPage() {
  const { t, i18n } = useTranslation()
  const { data: stats } = useApi(() => catalogService.stats(), [])

  const statItems = [
    { label: t('home.statResources'), value: stats?.resources_count },
    { label: t('home.statModules'), value: stats?.modules_count },
    { label: t('home.statDownloads'), value: stats?.downloads_count },
    { label: t('home.statStudents'), value: stats?.students_count },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {t('about.title')}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('about.subtitle')}</p>
      </header>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.label} className="card p-5 text-center">
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatNumber(item.value ?? 0, i18n.language)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="p-7">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400">
            <Target className="size-6" />
          </div>
          <h2 className="font-display mt-4 text-xl font-bold text-slate-900 dark:text-slate-50">
            {t('about.missionTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('about.missionText')}</p>
        </Card>

        <Card className="p-7">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600 dark:bg-secondary-600/15 dark:text-secondary-400">
            <Eye className="size-6" />
          </div>
          <h2 className="font-display mt-4 text-xl font-bold text-slate-900 dark:text-slate-50">
            {t('about.visionTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('about.visionText')}</p>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
          {t('about.valuesTitle')}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, titleKey, textKey, tone }) => (
            <Card key={titleKey} hover className="p-6 text-center">
              <div className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="size-6" />
              </div>
              <h3 className="font-display mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
                {t(titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t(textKey)}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="gradient-brand relative mt-12 overflow-hidden border-0 px-6 py-10 text-center text-white sm:px-12">
        <div className="absolute -top-16 -end-12 size-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <Rocket className="relative mx-auto size-9" />
        <h2 className="font-display relative mt-4 text-xl font-bold sm:text-2xl">{t('about.teamTitle')}</h2>
        <p className="relative mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85">{t('about.teamText')}</p>
        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/contact" variant="white" size="sm">
            {t('nav.contact')}
          </Button>
          <Button
            as={Link}
            to="/filieres"
            variant="outline"
            size="sm"
            className="border-white/40 text-white hover:bg-white/10 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
          >
            {t('nav.filieres')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
