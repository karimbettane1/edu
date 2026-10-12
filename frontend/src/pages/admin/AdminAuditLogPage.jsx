import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ScrollText } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import SearchBar from '../../components/ui/SearchBar'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/format'

const ACTION_PREFIXES = ['auth', 'resource', 'comment', 'report', 'user', 'filiere', 'annee', 'module', 'settings']

const ACTION_TONES = {
  auth: 'sky',
  resource: 'primary',
  comment: 'secondary',
  report: 'amber',
  user: 'primary',
  filiere: 'secondary',
  annee: 'secondary',
  module: 'secondary',
  settings: 'slate',
}

export default function AdminAuditLogPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const debouncedSearch = useDebounce(search, 350)

  const page = Number(params.get('page')) || 1
  const action = params.get('action') || ''

  const updateParams = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setParams(next, { replace: true })
  }

  useEffect(() => {
    updateParams({ q: debouncedSearch, page: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const { data, loading, error, reload } = useApi(
    () =>
      adminService.auditLogs({
        search: debouncedSearch || undefined,
        action: action || undefined,
        page,
        per_page: 20,
      }),
    [debouncedSearch, action, page],
  )

  const logs = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    if (meta && meta.last_page >= 1 && page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  return (
    <div>
      <PageHeader title={t('admin.auditLogs')} description={t('admin.auditLogsDesc')} />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <SearchBar value={search} onChange={setSearch} placeholder={t('admin.searchLog')} />
          <Select value={action} onChange={(event) => updateParams({ action: event.target.value, page: '' })}>
            <option value="">{t('admin.allActions')}</option>
            {ACTION_PREFIXES.map((prefix) => (
              <option key={prefix} value={prefix}>
                {t(`admin.actions.${prefix}`)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-14 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !logs.length ? (
        <Card>
          <EmptyState icon={ScrollText} title={t('admin.noLogsFound')} />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-start gap-3 px-4 py-3.5 sm:flex-nowrap">
                  <Badge tone={ACTION_TONES[log.action?.split('.')[0]] || 'slate'} className="mt-0.5 shrink-0">
                    {log.action}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{log.description}</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {log.user?.name || t('admin.system')}
                      {log.ip_address ? ` · ${log.ip_address}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(log.created_at, i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.resultsCount', { count: meta?.total ?? logs.length })}
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
