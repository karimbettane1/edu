import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleX, Flag } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/format'

const STATUS_TONES = { pending: 'amber', resolved: 'green', rejected: 'slate' }

export default function AdminReportsPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [actionId, setActionId] = useState(null)

  const page = Number(params.get('page')) || 1
  const status = params.get('status') || ''

  const updateParams = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setParams(next, { replace: true })
  }

  const { data, loading, error, reload } = useApi(
    () => adminService.reports({ status: status || undefined, page, per_page: 15 }),
    [status, page],
  )

  const reports = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    if (meta && meta.last_page >= 1 && page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  const handleResolve = (report, nextStatus) => async () => {
    setActionId(report.id)
    try {
      const result = await adminService.resolveReport(report.id, { status: nextStatus })
      successToast(result.message || t('common.updatedSuccess'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <PageHeader title={t('admin.reports')} description={t('admin.reportsDesc')} />

      <Card className="mb-5 p-4">
        <Select
          value={status}
          onChange={(event) => updateParams({ status: event.target.value, page: '' })}
          className="w-full sm:w-72"
        >
          <option value="">{t('admin.allStatuses')}</option>
          <option value="pending">{t('admin.reportPending')}</option>
          <option value="resolved">{t('admin.reportResolved')}</option>
          <option value="rejected">{t('admin.reportRejected')}</option>
        </Select>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !reports.length ? (
        <Card>
          <EmptyState icon={Flag} title={t('admin.noReports')} description={t('admin.noReportsFound')} />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS_TONES[report.status] || 'slate'}>
                        {t(`admin.report${report.status.charAt(0).toUpperCase()}${report.status.slice(1)}`)}
                      </Badge>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{report.reason}</p>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(report.created_at, i18n.language)}
                      </span>
                    </div>
                    {report.message && (
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                        {report.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {t('admin.reportedBy')}: {report.user?.name || '—'}
                      {report.resource && (
                        <>
                          {' · '}
                          <Link to={`/ressources/${report.resource.id}`} className="link font-medium">
                            {report.resource.title}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="success"
                        size="sm"
                        icon={CircleCheck}
                        loading={actionId === report.id}
                        onClick={handleResolve(report, 'resolved')}
                      >
                        {t('admin.resolve')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CircleX}
                        disabled={actionId === report.id}
                        onClick={handleResolve(report, 'rejected')}
                      >
                        {t('admin.dismiss')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.resultsCount', { count: meta?.total ?? reports.length })}
            </p>
            <Pagination
              currentPage={page}
              lastPage={meta?.last_page ?? 1}
              onChange={(next) => updateParams({ page: next === 1 ? '' : next })}
            />
          </div>
        </>
      )}
    </div>
  )
}
