import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  BookOpen,
  Compass,
  Download,
  GraduationCap,
  Layers,
  Rocket,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import { resourceService } from '../../services/resourceService'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import ResourceCard from '../../components/resources/ResourceCard'
import { ResourceGridSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { formatNumber } from '../../utils/format'

const FILIERE_STYLES = {
  DD: {
    icon: Target,
    gradient: 'from-primary-600 to-sky-500',
    badge: 'bg-primary-50 text-primary-700 dark:bg-primary-600/15 dark:text-primary-300',
  },
  ID: {
    icon: Layers,
    gradient: 'from-secondary-600 to-fuchsia-500',
    badge: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-600/15 dark:text-secondary-300',
  },
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()

  const { data: stats, loading: statsLoading } = useApi(() => catalogService.stats(), [])
  const { data: filieres, loading: filieresLoading } = useApi(() => catalogService.filieres(), [])
  const { data: recent, loading: recentLoading } = useApi(() => resourceService.recent(6), [])
  const { data: popular, loading: popularLoading } = useApi(() => resourceService.popular(3), [])

  const statCards = [
    { icon: BookOpen, label: t('home.statResources'), value: stats?.resources_count, tone: 'primary' },
    { icon: Layers, label: t('home.statModules'), value: stats?.modules_count, tone: 'secondary' },
    { icon: Download, label: t('home.statDownloads'), value: stats?.downloads_count, tone: 'green' },
    { icon: Users, label: t('home.statStudents'), value: stats?.students_count, tone: 'sky' },
  ]

  const steps = [
    { icon: Compass, title: t('home.howStep1Title'), desc: t('home.howStep1Desc') },
    { icon: Layers, title: t('home.howStep2Title'), desc: t('home.howStep2Desc') },
    { icon: Rocket, title: t('home.howStep3Title'), desc: t('home.howStep3Desc') },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-surface-dark dark:to-slate-900"
          aria-hidden="true"
        />
        <div className="absolute -top-32 -end-32 size-96 rounded-full bg-primary-600/10 blur-3xl" aria-hidden="true" />
        <div className="absolute top-40 -start-24 size-80 rounded-full bg-secondary-600/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-24 lg:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary-700 backdrop-blur dark:border-primary-600/30 dark:bg-primary-600/10 dark:text-primary-300">
              <Sparkles className="size-3.5" />
              {t('home.heroBadge')}
            </span>
            <h1 className="font-display mt-6 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-50">
              {t('home.heroTitle')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button as={Link} to="/ressources" size="lg" icon={BookOpen}>
                {t('home.exploreCourses')}
              </Button>
              {!isAuthenticated && (
                <Button as={Link} to="/inscription" size="lg" variant="outline" iconRight={ArrowRight}>
                  {t('home.joinPlatform')}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading
              ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)
              : statCards.map((card) => (
                  <StatCard
                    key={card.label}
                    icon={card.icon}
                    label={card.label}
                    tone={card.tone}
                    value={formatNumber(card.value ?? 0, i18n.language)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Filières */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {t('home.filieresTitle')}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">{t('home.filieresSubtitle')}</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {filieresLoading
            ? Array.from({ length: 2 }, (_, index) => <Skeleton key={index} className="h-72 rounded-2xl" />)
            : (filieres || []).map((filiere) => {
                const style = FILIERE_STYLES[filiere.code] || FILIERE_STYLES.DD
                const Icon = style.icon
                return (
                  <Card key={filiere.id} hover className="overflow-hidden">
                    <div className={`h-1.5 bg-gradient-to-r ${style.gradient}`} />
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}>
                          <Icon className="size-7" />
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                          {filiere.code}
                        </span>
                      </div>
                      <h3 className="font-display mt-5 text-xl font-bold text-slate-900 dark:text-slate-50">
                        {filiere.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {filiere.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                          {t('filieres.modulesCount', { count: filiere.modules_count ?? 0 })}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                          {t('filieres.resourcesCount', { count: filiere.resources_count ?? 0 })}
                        </span>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button as={Link} to={`/filieres/${filiere.slug}`} size="sm">
                          {t('home.discoverFiliere')}
                        </Button>
                        <Button as={Link} to={`/ressources?filiere_id=${filiere.id}`} size="sm" variant="outline">
                          {t('filieres.viewResources')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
        </div>
      </section>

      {/* Recent resources */}
      <section className="bg-white py-14 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                {t('home.recentTitle')}
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{t('home.recentSubtitle')}</p>
            </div>
            <Button as={Link} to="/ressources" variant="ghost" size="sm" iconRight={ArrowRight}>
              {t('common.viewAll')}
            </Button>
          </div>

          <div className="mt-8">
            {recentLoading ? (
              <ResourceGridSkeleton count={6} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(recent || []).map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {t('home.popularTitle')}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">{t('home.popularSubtitle')}</p>
        </div>
        <div className="mt-10">
          {popularLoading ? (
            <ResourceGridSkeleton count={3} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(popular || []).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              {t('home.howTitle')}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{t('home.howSubtitle')}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }, index) => (
              <Card key={title} hover className="relative p-6">
                <span className="font-display absolute top-5 end-6 text-4xl font-bold text-slate-100 dark:text-slate-700/60">
                  {index + 1}
                </span>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12">
          <div className="absolute -top-20 -end-16 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -start-12 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <GraduationCap className="relative mx-auto size-10" />
          <h2 className="font-display relative mt-4 text-2xl font-bold sm:text-3xl">{t('home.ctaTitle')}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            {t('home.ctaSubtitle')}
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button as={Link} to="/ressources" size="lg" variant="white" icon={BookOpen}>
                {t('home.exploreResources')}
              </Button>
            ) : (
              <>
                <Button as={Link} to="/inscription" size="lg" variant="white" icon={Rocket}>
                  {t('home.ctaButton')}
                </Button>
                <Button
                  as={Link}
                  to="/ressources"
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
                >
                  {t('home.exploreResources')}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
