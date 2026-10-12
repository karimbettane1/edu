import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CircleCheck,
  Clock,
  Download,
  Eye,
  FileText,
  PlusCircle,
  TrendingUp,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { contributorService } from '../../services/contributorService'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ResourceStatusBadge from '../../components/dashboard/ResourceStatusBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { formatDate } from '../../utils/format'
import { resourceTypeLabel } from '../../utils/resourceMeta'

export default function ContributorDashboardPage() {
  const { t, i18n } = useTranslation()
  const { data, loading, error, reload } = useApi(() => contributorService.stats(), [])

  const latest = data?.latest?.data ?? data?.latest ?? []
  const byType = data?.by_type || {}

  return (
    <div>
      <PageHeader
        title={t('contributor.title')}
        description={t('contributor.subtitle')}
        actions={
          <Button as={Link} to="/contributeur/ressources/nouvelle" size="sm" icon={PlusCircle}>
            {t('contributor.addResource')}
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FileText} label={t('contributor.myResources')} value={data?.total ?? 0} tone="primary" />
            <StatCard icon={CircleCheck} label={t('common.published')} value={data?.published ?? 0} tone="green" />
            <StatCard
              icon={Clock}
              label={t('common.pendingReview')}
              value={data?.pending ?? 0}
              tone="amber"
              hint={data?.rejected > 0 ? t('contributor.rejectedHint', { count: data.rejected }) : undefined}
            />
            <StatCard
              icon={Download}
              label={t('contributor.totalDownloads')}
              value={data?.downloads ?? 0}
              tone="sky"
              hint={t('contributor.averageHint', { count: data?.average_downloads ?? 0 })}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('contributor.recentSubmissions')}
                </h2>
                <Link to="/contributeur/ressources" className="link text-sm font-medium">
                  {t('common.viewAll')}
                </Link>
              </div>

              {latest.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('contributor.emptyResourcesDesc')}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {latest.map((resource) => (
                    <li key={resource.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {resource.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          {resourceTypeLabel(resource.type, t)}
                          {resource.filiere?.code && ` · ${resource.filiere.code}`}
                          {' · '}
                          {formatDate(resource.updated_at || resource.created_at, i18n.language)}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Download className="size-3.5" />
                        {resource.downloads_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Eye className="size-3.5" />
                        {resource.views_count ?? 0}
                      </span>
                      <ResourceStatusBadge status={resource.status} />
                      {resource.can_manage && (
                        <Link
                          to={`/contributeur/ressources/${resource.id}/modifier`}
                          className="link text-xs font-medium"
                        >
                          {t('common.edit')}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="p-5">
                <h2 className="font-display mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t('admin.byType')}
                </h2>
                {Object.keys(byType).length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">{t('common.none')}</p>
                ) : (
                  <ul className="space-y-2.5">
                    {Object.entries(byType).map(([type, count]) => (
                      <li key={type} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{resourceTypeLabel(type, t)}</span>
                        <Badge tone="primary">{count}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-600/15 dark:text-emerald-400">
                    <TrendingUp className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('contributor.totalViews')}</p>
                    <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                      {data?.views ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-600/15 dark:text-amber-400">
                    <FileText className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.draft')}</p>
                    <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                      {data?.drafts ?? 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
