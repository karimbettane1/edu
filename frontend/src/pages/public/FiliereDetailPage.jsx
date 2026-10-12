import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Layers, Target } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Loader from '../../components/ui/Loader'

const FILIERE_STYLES = {
  DD: { icon: Target, gradient: 'from-primary-600 to-sky-500' },
  ID: { icon: Layers, gradient: 'from-secondary-600 to-fuchsia-500' },
}

export default function FiliereDetailPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { data: filiere, loading, error, reload } = useApi(() => catalogService.filiere(slug), [slug])

  if (loading) return <Loader className="py-24" />
  if (error || !filiere) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorMessage
          title={t('common.notFound')}
          message={t('errors.404Text')}
          onRetry={reload}
        />
        <div className="text-center">
          <Button as={Link} to="/filieres" variant="outline" size="sm" icon={ArrowLeft}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    )
  }

  const style = FILIERE_STYLES[filiere.code] || FILIERE_STYLES.DD
  const Icon = style.icon

  return (
    <div>
      <section className={`bg-gradient-to-br ${style.gradient} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to="/filieres"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4 flip-rtl" />
            {t('filieres.title')}
          </Link>
          <div className="mt-6 flex flex-wrap items-start gap-5">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Icon className="size-8" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{filiere.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
                {filiere.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur">
              <Calendar className="size-4" />
              {t('filieres.years')} : {filiere.annees_count ?? (filiere.annees_formation || []).length}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur">
              <Layers className="size-4" />
              {t('common.modules')} : {filiere.modules_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur">
              <BookOpen className="size-4" />
              {t('home.statResources')} : {filiere.resources_count ?? 0}
            </span>
            <Button
              as={Link}
              to={`/ressources?filiere_id=${filiere.id}`}
              size="sm"
              variant="white"
              className="ms-auto"
            >
              {t('filieres.viewResources')}
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {(filiere.annees_formation || []).map((annee) => (
          <section key={annee.id} className="mb-12 last:mb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="gradient-brand flex size-10 items-center justify-center rounded-xl text-white">
                  <GraduationCap className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                    {annee.label}
                    {annee.option_name ? ` — ${annee.option_name}` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('filieres.modulesCount', { count: (annee.modules || []).length })} ·{' '}
                    {t('filieres.resourcesCount', { count: annee.resources_count ?? 0 })}
                  </p>
                </div>
              </div>
              <Button
                as={Link}
                to={`/ressources?filiere_id=${filiere.id}&annee_id=${annee.id}`}
                variant="outline"
                size="sm"
              >
                {t('filieres.viewResources')}
              </Button>
            </div>

            {(annee.modules || []).length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t('filieres.noModules')}
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(annee.modules || []).map((module) => (
                  <Card key={module.id} hover className="flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-600/15 dark:text-primary-300">
                        {module.code}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {t('filieres.resourcesCount', { count: module.resources_count ?? 0 })}
                      </span>
                    </div>
                    <h3 className="font-display mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">
                      {module.name}
                    </h3>
                    {module.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {module.description}
                      </p>
                    )}
                    <div className="mt-auto pt-4">
                      <Link
                        to={`/ressources?filiere_id=${filiere.id}&annee_id=${annee.id}&module_id=${module.id}`}
                        className="link inline-flex items-center gap-1.5 text-sm font-medium"
                      >
                        <BookOpen className="size-4" />
                        {t('filieres.viewResources')}
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ))}

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">{t('filieres.moduleListNote')}</p>
      </div>
    </div>
  )
}
