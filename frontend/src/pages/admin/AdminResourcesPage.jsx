import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleX, Eye, Pencil, Plus, Trash } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { adminService } from '../../services/adminService'
import { catalogService } from '../../services/catalogService'
import PageHeader from '../../components/dashboard/PageHeader'
import ResourceStatusBadge from '../../components/dashboard/ResourceStatusBadge'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { confirmDialog, errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/format'
import { RESOURCE_TYPES, TYPE_TONES, resourceTypeLabel } from '../../utils/resourceMeta'

const STATUS_OPTIONS = ['pending_review', 'published', 'draft', 'rejected', 'archived']

const STATUS_KEYS = {
  pending_review: 'common.pendingReview',
  published: 'common.published',
  draft: 'common.draft',
  rejected: 'common.rejected',
  archived: 'common.archived',
}

export default function AdminResourcesPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const [actionId, setActionId] = useState(null)
  const debouncedSearch = useDebounce(search, 350)

  const page = Number(params.get('page')) || 1
  const status = params.get('status') || ''
  const type = params.get('type') || ''
  const filiereId = params.get('filiere_id') || ''

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
      adminService.resources({
        search: debouncedSearch || undefined,
        status: status || undefined,
        type: type || undefined,
        filiere_id: filiereId || undefined,
        page,
        per_page: 15,
      }),
    [debouncedSearch, status, type, filiereId, page],
  )

  const { data: filieres } = useApi(() => catalogService.filieres(), [])

  const resources = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    if (meta && meta.last_page >= 1 && page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  const changeStatus = (resource, nextStatus, successKey) => async () => {
    setActionId(resource.id)
    try {
      const formData = new FormData()
      formData.append('status', nextStatus)
      const result = await adminService.updateResource(resource.id, formData)
      successToast(result.message || t(successKey))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (resource) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteResource'),
      text: t('admin.deleteResourceText', { title: resource.title }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      icon: 'warning',
    })
    if (!confirmed) return
    setActionId(resource.id)
    try {
      await adminService.deleteResource(resource.id)
      successToast(t('admin.resourceDeleted'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title={t('admin.manageResources')}
        description={t('admin.manageResourcesDesc')}
        actions={
          <Button as={Link} to="/admin/ressources/nouvelle" icon={Plus}>
            {t('admin.newResource')}
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SearchBar value={search} onChange={setSearch} placeholder={t('admin.searchResource')} />
          <Select value={status} onChange={(event) => updateParams({ status: event.target.value, page: '' })}>
            <option value="">{t('admin.allStatuses')}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(STATUS_KEYS[option])}
              </option>
            ))}
          </Select>
          <Select value={type} onChange={(event) => updateParams({ type: event.target.value, page: '' })}>
            <option value="">{t('admin.allTypes')}</option>
            {RESOURCE_TYPES.map((option) => (
              <option key={option} value={option}>
                {t(`resourceTypes.${option}`)}
              </option>
            ))}
          </Select>
          <Select value={filiereId} onChange={(event) => updateParams({ filiere_id: event.target.value, page: '' })}>
            <option value="">{t('admin.allFilieres')}</option>
            {(filieres || []).map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !resources.length ? (
        <Card>
          <EmptyState
            title={t('admin.noResourcesFound')}
            description={t('admin.noResourcesFoundDesc')}
            action={
              <Button as={Link} to="/admin/ressources/nouvelle" icon={Plus}>
                {t('admin.newResource')}
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="px-4 py-3 text-start">{t('admin.resourceFormTitle')}</th>
                    <th className="px-4 py-3 text-start">{t('common.type')}</th>
                    <th className="px-4 py-3 text-start">{t('common.filiere')}</th>
                    <th className="px-4 py-3 text-start">{t('common.author')}</th>
                    <th className="px-4 py-3 text-start">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start">{t('admin.publishedAt')}</th>
                    <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="max-w-72 px-4 py-3">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">{resource.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          {t('admin.downloadsViews', {
                            downloads: resource.downloads_count ?? 0,
                            views: resource.views_count ?? 0,
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={TYPE_TONES[resource.type] || 'slate'}>
                          {resourceTypeLabel(resource.type, t)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {resource.filiere?.code || '—'}
                        {resource.module?.code ? ` · ${resource.module.code}` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{resource.author?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <ResourceStatusBadge status={resource.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {resource.published_at ? formatDate(resource.published_at, i18n.language) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {resource.status === 'published' && (
                            <Button
                              as={Link}
                              to={`/ressources/${resource.id}`}
                              target="_blank"
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              aria-label={t('common.view')}
                            />
                          )}
                          {resource.status === 'pending_review' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                icon={CircleCheck}
                                loading={actionId === resource.id}
                                onClick={changeStatus(resource, 'published', 'admin.resourcePublished')}
                              >
                                {t('admin.approve')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={CircleX}
                                disabled={actionId === resource.id}
                                onClick={changeStatus(resource, 'rejected', 'admin.resourceRejected')}
                              >
                                {t('admin.reject')}
                              </Button>
                            </>
                          )}
                          <Button
                            as={Link}
                            to={`/admin/ressources/${resource.id}/modifier`}
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            aria-label={t('common.edit')}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash}
                            disabled={actionId === resource.id}
                            onClick={() => handleDelete(resource)}
                            aria-label={t('common.delete')}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.resultsCount', { count: meta?.total ?? resources.length })}
            </p>
            <Pagination currentPage={page} lastPage={meta?.last_page ?? 1} onChange={(next) => updateParams({ page: next === 1 ? '' : next })} />
          </div>
        </>
      )}
    </div>
  )
}
