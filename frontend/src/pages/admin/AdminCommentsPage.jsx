import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleX, Trash } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import SearchBar from '../../components/ui/SearchBar'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { confirmDialog, errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { timeAgo } from '../../utils/format'

export default function AdminCommentsPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const debouncedSearch = useDebounce(search, 350)
  const [actionId, setActionId] = useState(null)

  const page = Number(params.get('page')) || 1
  const approved = params.get('approved') ?? ''

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
      adminService.pendingComments({
        search: debouncedSearch || undefined,
        ...(approved === '' ? {} : { is_approved: approved }),
        page,
        per_page: 15,
      }),
    [debouncedSearch, approved, page],
  )

  const comments = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    if (meta && meta.last_page >= 1 && page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  const moderate = (comment, isApproved) => async () => {
    setActionId(comment.id)
    try {
      const result = await adminService.approveComment(comment.id, isApproved)
      successToast(result.message || t('common.updatedSuccess'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (comment) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteComment'),
      text: t('admin.deleteCommentText'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    setActionId(comment.id)
    try {
      const result = await adminService.deleteComment(comment.id)
      successToast(result.message || t('common.deletedSuccess'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <PageHeader title={t('comments.title')} description={t('admin.commentsSubtitle')} />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <SearchBar value={search} onChange={setSearch} placeholder={t('admin.searchComment')} />
          <Select value={approved} onChange={(event) => updateParams({ approved: event.target.value, page: '' })}>
            <option value="">{t('comments.allComments')}</option>
            <option value="1">{t('comments.approved')}</option>
            <option value="0">{t('comments.pending')}</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !comments.length ? (
        <Card>
          <EmptyState title={t('comments.empty')} description={t('admin.noCommentsFound')} />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="gradient-brand flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {comment.user?.name || '—'}
                        </p>
                        <Badge tone={comment.is_approved ? 'green' : 'amber'}>
                          {comment.is_approved ? t('comments.approved') : t('comments.pending')}
                        </Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {timeAgo(comment.created_at, i18n.language)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                        {comment.body}
                      </p>
                      {comment.resource && (
                        <Link
                          to={`/ressources/${comment.resource.id}`}
                          className="link mt-2 inline-block text-xs font-medium"
                        >
                          {t('comments.onResource')} « {comment.resource.title} »
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!comment.is_approved ? (
                      <Button
                        variant="success"
                        size="sm"
                        icon={CircleCheck}
                        loading={actionId === comment.id}
                        onClick={moderate(comment, true)}
                      >
                        {t('comments.approve')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CircleX}
                        disabled={actionId === comment.id}
                        onClick={moderate(comment, false)}
                      >
                        {t('comments.hide')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash}
                      disabled={actionId === comment.id}
                      onClick={() => handleDelete(comment)}
                      aria-label={t('common.delete')}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.resultsCount', { count: meta?.total ?? comments.length })}
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
