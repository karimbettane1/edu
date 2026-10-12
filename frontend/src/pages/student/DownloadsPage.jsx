import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, ExternalLink } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/format'
import { resourceTypeLabel } from '../../utils/resourceMeta'

const PER_PAGE = 15

export default function DownloadsPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useApi(
    () => studentService.downloads({ per_page: PER_PAGE, page }),
    [page],
  )

  const downloads = data?.data || []
  const meta = data?.meta || {}

  return (
    <div>
      <PageHeader title={t('student.downloadedHistory')} description={t('student.downloadedHistorySubtitle')} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : downloads.length === 0 ? (
        <EmptyState
          icon={Download}
          title={t('student.emptyHistory')}
          description={t('student.emptyHistoryDesc')}
          action={
            <Button as={Link} to="/ressources" size="sm">
              {t('nav.resources')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {downloads.map((download) => {
              const resource = download.resource
              return (
                <Card key={download.id} className="flex flex-wrap items-center gap-4 p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-600/15 dark:text-emerald-400">
                    <Download className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                      {download.resource_title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(download.created_at, i18n.language)}
                      {resource?.filiere?.code && ` · ${resource.filiere.code}`}
                      {resource?.module?.code && ` · ${resource.module.code}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {resource?.type && <Badge tone="primary">{resourceTypeLabel(resource.type, t)}</Badge>}
                    {download.resource_id && (
                      <Button as={Link} to={`/ressources/${download.resource_id}`} size="sm" variant="outline" icon={ExternalLink}>
                        {t('common.preview')}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} className="mt-8" />
          )}
        </>
      )}
    </div>
  )
}
