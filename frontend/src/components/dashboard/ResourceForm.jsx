import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Upload } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { RESOURCE_TYPES } from '../../utils/resourceMeta'
import { formatFileSize } from '../../utils/format'

const EMPTY = {
  title: '',
  description: '',
  type: 'cours',
  filiere_id: '',
  annee_formation_id: '',
  module_id: '',
  keywords: '',
  visibility: 'public',
}

export default function ResourceForm({ initial = null, busy = false, serverErrors = {}, onSubmit, allowPublish = false }) {
  const { t } = useTranslation()
  const [values, setValues] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setErrors(serverErrors || {})
  }, [serverErrors])

  useEffect(() => {
    if (!initial) return
    setValues({
      title: initial.title || '',
      description: initial.description || '',
      type: initial.type || 'cours',
      filiere_id: initial.filiere?.id ? String(initial.filiere.id) : '',
      annee_formation_id: initial.annee_formation?.id ? String(initial.annee_formation.id) : '',
      module_id: initial.module?.id ? String(initial.module.id) : '',
      keywords: initial.keywords || '',
      visibility: initial.visibility || 'public',
    })
  }, [initial])

  const { data: filieres } = useApi(() => catalogService.filieres(), [])
  const { data: annees } = useApi(
    () => catalogService.annees(values.filiere_id || undefined),
    [values.filiere_id],
  )
  const { data: modules } = useApi(
    () =>
      catalogService.modules({
        filiere_id: values.filiere_id || undefined,
        annee_id: values.annee_formation_id || undefined,
      }),
    [values.filiere_id, values.annee_formation_id],
  )

  const moduleOptions = useMemo(() => {
    const list = modules || []
    if (values.filiere_id && values.annee_formation_id) {
      return list.filter((module) => String(module.annee_formation_id) === String(values.annee_formation_id))
    }
    return list
  }, [modules, values.filiere_id, values.annee_formation_id])

  const update = (field) => (event) => {
    const value = event.target.value
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'filiere_id' ? { annee_formation_id: '', module_id: '' } : {}),
      ...(field === 'annee_formation_id' ? { module_id: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const buildFormData = (status) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('description', values.description)
    formData.append('type', values.type)
    formData.append('visibility', values.visibility)
    if (values.filiere_id) formData.append('filiere_id', values.filiere_id)
    if (values.annee_formation_id) formData.append('annee_formation_id', values.annee_formation_id)
    if (values.module_id) formData.append('module_id', values.module_id)
    if (values.keywords) formData.append('keywords', values.keywords)
    if (status) formData.append('status', status)
    if (file) formData.append('file', file)
    return formData
  }

  const handleSubmit = (status) => () => {
    if (!values.title.trim()) {
      setErrors((current) => ({ ...current, title: t('contributor.errors.titleRequired') }))
      return
    }
    if (!values.filiere_id) {
      setErrors((current) => ({ ...current, filiere_id: t('contributor.errors.filiereRequired') }))
      return
    }
    if (!initial && !file) {
      setErrors((current) => ({ ...current, file: t('contributor.errors.fileRequired') }))
      return
    }
    onSubmit(buildFormData(status))
  }

  return (
    <div className="space-y-5">
      <Input
        label={t('admin.resourceFormTitle')}
        name="title"
        required
        value={values.title}
        onChange={update('title')}
        error={errors.title}
      />

      <Textarea
        label={t('admin.resourceFormDesc')}
        name="description"
        rows={5}
        value={values.description}
        onChange={update('description')}
        error={errors.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label={t('common.type')} name="type" required value={values.type} onChange={update('type')} error={errors.type}>
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`resourceTypes.${type}`)}
            </option>
          ))}
        </Select>

        <Select
          label={t('common.visibility')}
          name="visibility"
          value={values.visibility}
          onChange={update('visibility')}
          error={errors.visibility}
        >
          <option value="public">{t('common.public')}</option>
          <option value="private">{t('common.private')}</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label={t('common.filiere')}
          name="filiere_id"
          required
          value={values.filiere_id}
          onChange={update('filiere_id')}
          error={errors.filiere_id}
        >
          <option value="">{t('admin.selectFiliere')}</option>
          {(filieres || []).map((filiere) => (
            <option key={filiere.id} value={filiere.id}>
              {filiere.name}
            </option>
          ))}
        </Select>

        <Select
          label={t('admin.assignYear')}
          name="annee_formation_id"
          value={values.annee_formation_id}
          onChange={update('annee_formation_id')}
          error={errors.annee_formation_id}
          disabled={!values.filiere_id}
        >
          <option value="">{t('common.none')}</option>
          {(annees || []).map((annee) => (
            <option key={annee.id} value={annee.id}>
              {annee.label}
            </option>
          ))}
        </Select>

        <Select
          label={t('common.module')}
          name="module_id"
          value={values.module_id}
          onChange={update('module_id')}
          error={errors.module_id}
        >
          <option value="">{t('common.none')}</option>
          {moduleOptions.map((module) => (
            <option key={module.id} value={module.id}>
              {module.code ? `${module.code} · ` : ''}
              {module.name}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label={t('resources.keywords')}
        name="keywords"
        value={values.keywords}
        onChange={update('keywords')}
        error={errors.keywords}
        hint={t('resources.keywordsHint')}
      />

      <div>
        <label className="label" htmlFor="resource-file">
          {t('admin.chooseFile')}
          {!initial && <span className="ms-0.5 text-red-500">*</span>}
        </label>

        {initial?.primary_file && !file && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/60">
            <FileText className="size-4 shrink-0 text-red-500" />
            <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
              {initial.primary_file.original_name}
            </span>
            {initial.primary_file.size != null && (
              <span className="text-xs text-slate-400">{formatFileSize(initial.primary_file.size)}</span>
            )}
          </div>
        )}

        <label
          htmlFor="resource-file"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-500"
        >
          <Upload className="size-4.5" />
          {file ? file.name : initial?.primary_file ? t('admin.replaceFile') : t('admin.chooseFile')}
        </label>
        <input
          id="resource-file"
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.ods,.odp,.txt,.md,.zip"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null)
            setErrors((current) => ({ ...current, file: undefined }))
          }}
        />
        {file && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
        )}
        {errors.file ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.file}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('contributor.fileHint')}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit('draft')}
          loading={busy}
          disabled={busy}
        >
          {t('admin.saveDraft')}
        </Button>
        <Button type="button" onClick={handleSubmit('pending_review')} loading={busy} disabled={busy}>
          {t('contributor.submitForReview')}
        </Button>
        {allowPublish && (
          <Button type="button" variant="secondary" onClick={handleSubmit('published')} loading={busy} disabled={busy}>
            {t('admin.publishNow')}
          </Button>
        )}
      </div>
    </div>
  )
}
