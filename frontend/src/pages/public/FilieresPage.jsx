import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BookOpen, Calendar, Layers, Target } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorMessage from '../../components/ui/ErrorMessage'

const FILIERE_STYLES = {
  DD: { icon: Target, gradient: 'from-primary-600 to-sky-500' },
  ID: { icon: Layers, gradient: 'from-secondary-600 to-fuchsia-500' },
}

export default function FilieresPage() {
  const { t } = useTranslation()
  const { data: filieres, loading, error, reload } = useApi(() => catalogService.filieres(), [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {t('filieres.title')}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('filieres.subtitle')}</p>
      </header>

      {loading ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {(filieres || []).map((filiere) => {
            const style = FILIERE_STYLES[filiere.code] || FILIERE_STYLES.DD
            const Icon = style.icon
            const annes = filiere.annees_formation || []
            return (
              <Card key={filiere.id} hover className="flex flex-col overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${style.gradient}`} />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}>
                      <Icon className="size-7" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                      {filiere.code}
                    </span>
                  </div>

                  <h2 className="font-display mt-5 text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {filiere.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {filiere.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-50 px-2 py-3 dark:bg-slate-800/60">
                      <Calendar className="mx-auto size-4.5 text-primary-600 dark:text-primary-400" />
                      <p className="font-display mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-50">
                        {filiere.annees_count ?? annes.length}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('filieres.years')}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-2 py-3 dark:bg-slate-800/60">
                      <Layers className="mx-auto size-4.5 text-secondary-600 dark:text-secondary-400" />
                      <p className="font-display mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-50">
                        {filiere.modules_count ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.modules')}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-2 py-3 dark:bg-slate-800/60">
                      <BookOpen className="mx-auto size-4.5 text-emerald-600 dark:text-emerald-400" />
                      <p className="font-display mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-50">
                        {filiere.resources_count ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('nav.resources')}</p>
                    </div>
                  </div>

                  {annes.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {annes.map((annee) => (
                        <li key={annee.id}>
                          <Link
                            to={`/filieres/${filiere.slug}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-700 dark:hover:border-primary-600/40 dark:hover:bg-primary-600/10"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {annee.label}
                              {annee.option_name ? ` — ${annee.option_name}` : ''}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {t('filieres.modulesCount', { count: annee.modules_count ?? 0 })}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    <Button as={Link} to={`/filieres/${filiere.slug}`} size="sm" iconRight={ArrowRight}>
                      {t('filieres.viewModules')}
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
      )}

      <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">{t('filieres.moduleListNote')}</p>
    </div>
  )
}
