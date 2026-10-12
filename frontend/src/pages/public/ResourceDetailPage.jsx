import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Heart,
  Lock,
  MessageSquare,
  Send,
  Trash,
  User as UserIcon,
  Eye,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { resourceService } from '../../services/resourceService'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'
import ErrorMessage from '../../components/ui/ErrorMessage'
import EmptyState from '../../components/ui/EmptyState'
import FileTypeIcon from '../../components/resources/FileTypeIcon'
import ResourceCard from '../../components/resources/ResourceCard'
import { STATUS_TONES, TYPE_TONES } from '../../utils/resourceMeta'
import { formatDate, formatFileSize, formatNumber } from '../../utils/format'
import { errorToast, infoToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const REPORT_REASONS = [
  'Fichier incorrect ou illisible',
  'Contenu inapproprié',
  'Lien de téléchargement cassé',
  'Document en doublon',
  'Autre problème',
]

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: resource, loading, error, reload, setData } = useApi(
    () => resourceService.detail(id),
    [id],
  )

  const [downloadBusy, setDownloadBusy] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewBusy, setPreviewBusy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportForm, setReportForm] = useState({ reason: REPORT_REASONS[0], message: '' })
  const [reportBusy, setReportBusy] = useState(false)

  const [comments, setComments] = useState(null)
  const [commentBody, setCommentBody] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)

  const [related, setRelated] = useState([])

  useEffect(() => {
    let active = true
    resourceService
      .comments(id)
      .then((result) => {
        if (active) setComments(result)
      })
      .catch(() => {
        if (active) setComments({ data: [] })
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!resource) return undefined
    let active = true
    const params = { per_page: 4, sort: 'recent' }
    if (resource.module?.id) params.module_id = resource.module.id
    else if (resource.filiere?.id) params.filiere_id = resource.filiere.id
    else return undefined
    resourceService
      .list(params)
      .then((result) => {
        if (active) setRelated((result.data || []).filter((item) => item.id !== resource.id).slice(0, 3))
      })
      .catch(() => {
        if (active) setRelated([])
      })
    return () => {
      active = false
    }
  }, [resource])

  useEffect(() => () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (loading) return <Loader className="py-24" />
  if (error || !resource) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorMessage title={t('common.notFound')} message={t('errors.404Text')} onRetry={reload} />
        <div className="text-center">
          <Button as={Link} to="/ressources" variant="outline" size="sm" icon={ArrowLeft}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    )
  }

  const file = resource.primary_file
  const typeTone = TYPE_TONES[resource.type] || 'slate'
  const isPdf = (file?.extension || '').toLowerCase() === 'pdf'
  const isPrivate = resource.visibility === 'private'

  const requireAuth = () => {
    infoToast(t('auth.loginRequiredText'))
    navigate('/connexion', { state: { from: location.pathname + location.search } })
  }

  const handleDownload = async () => {
    if (!isAuthenticated && isPrivate) {
      requireAuth()
      return
    }
    setDownloadBusy(true)
    try {
      await resourceService.download(resource.id)
      successToast(t('resources.downloadStarted'))
      setData((current) => (current ? { ...current, downloads_count: (current.downloads_count || 0) + 1 } : current))
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        if (!isAuthenticated) requireAuth()
        else errorToast(getApiErrorMessage(err, t('common.error')))
      } else {
        errorToast(getApiErrorMessage(err, t('errors.networkError')))
      }
    } finally {
      setDownloadBusy(false)
    }
  }

  const handlePreview = async () => {
    if (!isPdf) {
      infoToast(t('resources.previewUnavailable'))
      return
    }
    if (!isAuthenticated && isPrivate) {
      requireAuth()
      return
    }
    setPreviewBusy(true)
    try {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl)
      const url = await resourceService.preview(resource.id)
      setPreviewUrl(url)
      setPreviewOpen(true)
    } catch {
      infoToast(t('resources.previewUnavailable'))
    } finally {
      setPreviewBusy(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    setFavoriteBusy(true)
    try {
      const result = await resourceService.toggleFavorite(resource.id)
      const favorited = result.favorited ?? !resource.is_favorited
      setData((current) => (current ? { ...current, is_favorited: favorited } : current))
      successToast(favorited ? t('resources.addedToFavorites') : t('resources.removedFromFavorites'))
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setFavoriteBusy(false)
    }
  }

  const openReport = () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    setReportForm({ reason: REPORT_REASONS[0], message: '' })
    setReportOpen(true)
  }

  const submitReport = async () => {
    setReportBusy(true)
    try {
      await resourceService.report(resource.id, reportForm)
      setReportOpen(false)
      successToast(t('resources.reportSent'))
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setReportBusy(false)
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (commentBody.trim().length < 3) return
    setCommentBusy(true)
    try {
      const result = await resourceService.addComment(resource.id, { body: commentBody.trim() })
      setCommentBody('')
      successToast(result.message || t('comments.posted'))
      const refreshed = await resourceService.comments(resource.id)
      setComments(refreshed)
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setCommentBusy(false)
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await resourceService.deleteComment(commentId)
      setComments((current) => ({
        ...current,
        data: (current?.data || []).filter((comment) => comment.id !== commentId),
      }))
      successToast(t('common.deletedSuccess'))
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const commentList = comments?.data || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/ressources"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="size-4 flip-rtl" />
          {t('resources.title')}
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={typeTone}>{t(`resourceTypes.${resource.type}`, resource.type_label || resource.type)}</Badge>
            {resource.status !== 'published' && (
              <Badge tone={STATUS_TONES[resource.status] || 'slate'}>
                {t(`common.${resource.status === 'pending_review' ? 'pendingReview' : resource.status}`, resource.status)}
              </Badge>
            )}
            {isPrivate && (
              <Badge tone="amber">
                <Lock className="size-3" />
                {t('common.private')}
              </Badge>
            )}
          </div>

          <h1 className="font-display mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {resource.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {resource.author?.name && (
              <span className="flex items-center gap-1.5">
                <UserIcon className="size-4" />
                {resource.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(resource.published_at || resource.created_at, i18n.language)}
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="size-4" />
              {formatNumber(resource.downloads_count, i18n.language)} {t('common.downloads').toLowerCase()}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-4" />
              {formatNumber(resource.views_count, i18n.language)}
            </span>
          </div>

          <Card className="mt-6 p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('resources.description')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
              {resource.description || '—'}
            </p>

            {resource.keywords && (
              <div className="mt-5">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
                  {t('resources.keywords')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {String(resource.keywords)
                    .split(',')
                    .map((keyword) => keyword.trim())
                    .filter(Boolean)
                    .map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                <MessageSquare className="size-4.5 text-primary-600 dark:text-primary-400" />
                {t('comments.title')}
                {comments?.meta?.total ? (
                  <span className="text-sm font-normal text-slate-400">({comments.meta.total})</span>
                ) : null}
              </h2>
            </div>

            {isAuthenticated ? (
              <form onSubmit={submitComment} className="mt-4">
                <Textarea
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder={t('comments.placeholder')}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    icon={Send}
                    loading={commentBusy}
                    disabled={commentBody.trim().length < 3}
                  >
                    {t('comments.post')}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <Link
                  to="/connexion"
                  state={{ from: location.pathname + location.search }}
                  className="link font-medium"
                >
                  {t('common.login')}
                </Link>{' '}
                — {t('comments.loginToComment')}
              </p>
            )}

            <div className="mt-6 space-y-4">
              {comments === null ? (
                <Loader className="py-6" />
              ) : commentList.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title={t('comments.empty')}
                  description={t('comments.emptyDesc')}
                  className="py-8"
                />
              ) : (
                commentList.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="gradient-brand flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {comment.user?.name}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDate(comment.created_at, i18n.language)}
                          </p>
                        </div>
                      </div>
                      {(user?.id === comment.user?.id || user?.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => deleteComment(comment.id)}
                          aria-label={t('comments.delete')}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-600/15"
                        >
                          <Trash className="size-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Card className="p-6">
            {file ? (
              <>
                <div className="flex items-center gap-3">
                  <FileTypeIcon extension={file.extension} className="size-12" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={file.original_name}>
                      {file.original_name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {(file.extension || '').toUpperCase()} · {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <Button
                    onClick={handleDownload}
                    loading={downloadBusy}
                    icon={Download}
                    className="w-full"
                  >
                    {t('resources.downloadFile')}
                  </Button>
                  {file.is_previewable && (
                    <Button
                      onClick={handlePreview}
                      loading={previewBusy}
                      variant="outline"
                      icon={FileText}
                      className="w-full"
                    >
                      {t('common.preview')}
                    </Button>
                  )}
                  <Button
                    onClick={handleToggleFavorite}
                    loading={favoriteBusy}
                    variant={resource.is_favorited ? 'danger' : 'outline'}
                    icon={Heart}
                    className="w-full"
                  >
                    {resource.is_favorited ? t('resources.removeFromFavorites') : t('resources.addToFavorites')}
                  </Button>
                </div>

                {isPrivate && !isAuthenticated && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-600/15 dark:text-amber-300">
                    {t('resources.downloadLoginRequired')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.notFound')}</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('resources.informations')}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('common.filiere')}</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {resource.filiere ? (
                    <Link to={`/filieres/${resource.filiere.slug}`} className="link">
                      {resource.filiere.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('common.annee')}</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {resource.annee_formation?.label || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('common.module')}</dt>
                <dd className="max-w-[60%] text-end font-medium text-slate-700 dark:text-slate-200">
                  {resource.module ? (
                    <Link
                      to={`/ressources?module_id=${resource.module.id}`}
                      className="link"
                    >
                      {resource.module.code} · {resource.module.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t('resources.fileType')}</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{resource.type_label}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
              <Button onClick={openReport} variant="ghost" size="sm" icon={AlertTriangle} className="w-full text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-600/15">
                {t('common.report')}
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            {t('resources.relatedResources')}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        </section>
      )}

      {/* Preview modal */}
      <Modal open={previewOpen} onClose={closePreview} title={resource.title} size="xl">
        {previewUrl && (
          <iframe
            src={previewUrl}
            title={resource.title}
            className="h-[70vh] w-full rounded-lg border border-slate-200 dark:border-slate-700"
          />
        )}
      </Modal>

      {/* Report modal */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t('resources.reportTitle')}
        footer={
          <>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitReport} loading={reportBusy} variant="danger">
              {t('common.send')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('resources.reportDescription')}</p>
        <div className="mt-4 space-y-4">
          <Input
            label={t('resources.reportReason')}
            list="report-reasons"
            value={reportForm.reason}
            onChange={(event) => setReportForm((current) => ({ ...current, reason: event.target.value }))}
            required
          />
          <datalist id="report-reasons">
            {REPORT_REASONS.map((reason) => (
              <option key={reason} value={reason} />
            ))}
          </datalist>
          <Textarea
            label={t('common.optional')}
            rows={3}
            value={reportForm.message}
            onChange={(event) => setReportForm((current) => ({ ...current, message: event.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}
