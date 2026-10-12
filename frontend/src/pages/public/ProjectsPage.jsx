import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Code2, ExternalLink, Plus, Trash, User as UserIcon } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { projectService } from '../../services/projectService'
import { catalogService } from '../../services/catalogService'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Pagination from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/format'
import { confirmDialog, errorToast, infoToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const EMPTY_FORM = {
  title: '',
  description: '',
  technologies: '',
  demo_url: '',
  repo_url: '',
  screenshots: '',
  filiere_id: '',
}

export default function ProjectsPage() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useApi(
    () => projectService.list({ page, per_page: 9 }),
    [page],
  )
  const { data: filieres } = useApi(() => catalogService.filieres(), [])

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [formBusy, setFormBusy] = useState(false)

  const projects = data?.data || []
  const meta = data?.meta || {}

  const openForm = () => {
    if (!isAuthenticated) {
      infoToast(t('projects.loginToSubmit'))
      navigate('/connexion', { state: { from: location.pathname + location.search } })
      return
    }
    setForm(EMPTY_FORM)
    setFormErrors({})
    setFormOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    const errors = {}
    if (!form.title.trim()) errors.title = t('auth.fieldRequired')
    if (form.description.trim().length < 20) errors.description = t('common.error')
    setFormErrors(errors)
    if (Object.keys(errors).length) return

    setFormBusy(true)
    try {
      await projectService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        technologies: form.technologies
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        screenshots: form.screenshots
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        demo_url: form.demo_url.trim() || null,
        repo_url: form.repo_url.trim() || null,
        filiere_id: form.filiere_id || null,
      })
      setFormOpen(false)
      successToast(t('projects.publishedSuccess'))
      reload()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setFormErrors(
          Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, value[0]])),
        )
      }
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setFormBusy(false)
    }
  }

  const removeProject = async (project) => {
    const confirmed = await confirmDialog({
      title: t('common.deleteConfirmTitle'),
      text: t('common.deleteConfirmText'),
      confirmText: t('common.yesDelete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    try {
      await projectService.remove(project.id)
      successToast(t('common.deletedSuccess'))
      reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
            {t('projects.title')}
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">{t('projects.subtitle')}</p>
        </div>
        <Button onClick={openForm} icon={Plus}>
          {t('projects.submitProject')}
        </Button>
      </header>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={t('projects.empty')}
          description={t('projects.emptyDesc')}
          action={
            <Button onClick={openForm} size="sm" icon={Plus}>
              {t('projects.submitProject')}
            </Button>
          }
        />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const cover = project.screenshots?.[0]
            const canManage = project.can_manage || user?.role === 'admin'
            return (
              <Card key={project.id} hover className="flex flex-col overflow-hidden">
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-600/20 dark:to-secondary-600/20">
                  {cover ? (
                    <img
                      src={cover}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-2xl font-bold text-primary-600/40 dark:text-primary-300/40">
                      {project.title?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  {project.filiere && (
                    <span className="absolute start-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
                      {project.filiere.code}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                    {project.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                    {project.description}
                  </p>

                  {project.technologies?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="size-3.5" />
                      {project.user?.name || '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDate(project.published_at || project.created_at, i18n.language)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-600/15"
                        >
                          <ExternalLink className="size-3.5" />
                          {t('projects.demoLink').split('/')[0].trim()}
                        </a>
                      )}
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                        >
                          <Code2 className="size-3.5" />
                          GitHub
                        </a>
                      )}
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => removeProject(project)}
                        aria-label={t('common.delete')}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-600/15"
                      >
                        <Trash className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} className="mt-10" />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('projects.submitProject')}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submit} loading={formBusy}>
              {t('common.submit')}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Input
            label={t('projects.projectTitle')}
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            error={formErrors.title}
            required
            maxLength={160}
          />
          <Textarea
            label={t('projects.projectDescription')}
            rows={4}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            error={formErrors.description}
            required
          />
          <Input
            label={t('projects.technologies')}
            hint={t('projects.technologiesHint')}
            value={form.technologies}
            onChange={(event) => setForm((current) => ({ ...current, technologies: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`${t('projects.demoLink')} (demo)`}
              type="url"
              placeholder="https://…"
              value={form.demo_url}
              onChange={(event) => setForm((current) => ({ ...current, demo_url: event.target.value }))}
              error={formErrors.demo_url}
            />
            <Input
              label={`${t('projects.demoLink')} (GitHub)`}
              type="url"
              placeholder="https://github.com/…"
              value={form.repo_url}
              onChange={(event) => setForm((current) => ({ ...current, repo_url: event.target.value }))}
              error={formErrors.repo_url}
            />
          </div>
          <Textarea
            label={t('projects.screenshots')}
            hint={t('projects.screenshotsHint')}
            rows={3}
            value={form.screenshots}
            onChange={(event) => setForm((current) => ({ ...current, screenshots: event.target.value }))}
          />
          <Select
            label={t('common.filiere')}
            value={form.filiere_id}
            onChange={(event) => setForm((current) => ({ ...current, filiere_id: event.target.value }))}
          >
            <option value="">{t('common.optional')}</option>
            {(filieres || []).map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.name}
              </option>
            ))}
          </Select>
        </form>
      </Modal>
    </div>
  )
}
