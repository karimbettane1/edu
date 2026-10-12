import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Eye, FolderX, PlusCircle, SquarePen, Trash } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { contributorService } from '../../services/contributorService'
import PageHeader from '../../components/dashboard/PageHeader'
import ResourceStatusBadge from '../../components/dashboard/ResourceStatusBadge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import SearchBar from '../../components/ui/SearchBar'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { confirmDialog, errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/format'
import { resourceTypeLabel } from '../../utils/resourceMeta'

const PER_PAGE = 12
const STATUSES = ['draft', 'pending_review', 'published', 'rejected', 'archived']

export default function ContributorResourcesPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [busyId, setBusyId] = useState(null)

  const filters = useMemo(
    () => ({
      search: searchParams.get('q') || '',
      status: searchParams.get('status') || '',
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams],
  )

  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 400)

  const query = useMemo(() => {
    const params = { per_page: PER_PAGE, page: filters.page }
    if (filters.status) params.status = filters.status
    if (debouncedSearch) params.search = debouncedSearch
    return params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.page, debouncedSearch])

  const { data, loading, error, reload } = useApi(
    () => contributorService.resources(query),
    [JSON.stringify(query)],
  )

  const resources = data?.data || []
  const meta = data?.meta || {}

  const updateParams = (patch) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) next.delete(key)
          else next.set(key, String(value))
        })
        return next
      },
      { replace: true },
    )
  }

  const handleDelete = async (resource) => {
    const confirmed = await confirmDialog({
      title: t('common.deleteConfirmTitle'),
      text: t('contributor.deleteResourceText', { title: resource.title }),
      confirmText: t('common.yesDelete'),
    })
    if (!confirmed) return

    setBusyId(resource.id)
    try {
      await contributorService.deleteResource(resource.id)
      successToast(t('common.deletedSuccess'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title={t('contributor.myResources')}
        description={t('contributor.myResourcesSubtitle')}
        actions={
          <Button as={Link} to="/contributeur/ressources/nouvelle" size="sm" icon={PlusCircle}>
            {t('contributor.addResource')}
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <SearchBar value={searchInput} onChange={setSearchInput} placeholder={t('contributor.searchMyResources')} />
        <Select
          value={filters.status}
          onChange={(event) => updateParams({ status: event.target.value, page: '' })}
          aria-label={t('admin.filterStatus')}
        >
          <option value="">{t('admin.allStatuses')}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`common.${status === 'pending_review' ? 'pendingReview' : status}`)}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title={t('contributor.emptyResources')}
          description={t('contributor.emptyResourcesDesc')}
          action={
            <Button as={Link} to="/contributeur/ressources/nouvelle" size="sm">
              {t('contributor.addResource')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {resources.map((resource) => (
              <Card key={resource.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">{resource.title}</h3>
                      <ResourceStatusBadge status={resource.status} />
                      <Badge tone="primary">{resourceTypeLabel(resource.type, t)}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {resource.excerpt}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(resource.updated_at || resource.created_at, i18n.language)}
                      {resource.filiere?.code && ` · ${resource.filiere.code}`}
                      {resource.module?.code && ` · ${resource.module.code}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Download className="size-3.5" />
                      {resource.downloads_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Eye className="size-3.5" />
                      {resource.views_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                  {resource.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busyId === resource.id}
                      onClick={async () => {
                        setBusyId(resource.id)
                        try {
                          const formData = new FormData()
                          formData.append('status', 'pending_review')
                          await contributorService.updateResource(resource.id, formData)
                          successToast(t('contributor.submittedForReview'))
                          await reload()
                        } catch (err) {
                          errorToast(getApiErrorMessage(err, t('common.error')))
                        } finally {
                          setBusyId(null)
                        }
                      }}
                    >
                      {t('contributor.submitForReview')}
                    </Button>
                  )}

                  {resource.can_manage && (
                    <Link
                      to={`/contributeur/ressources/${resource.id}/modifier`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    >
                      <SquarePen className="size-4" />
                      {t('common.edit')}
                    </Link>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
                    icon={Trash}
                    loading={busyId === resource.id}
                    onClick={() => handleDelete(resource)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onChange={(page) => updateParams({ page: page === 1 ? '' : page })}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  )
}
