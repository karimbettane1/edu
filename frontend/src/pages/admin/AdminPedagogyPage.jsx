import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, GraduationCap, Layers, Pencil, Plus, Trash } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminService } from '../../services/adminService'
import { catalogService } from '../../services/catalogService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { confirmDialog, errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const TABS = [
  { key: 'filieres', icon: Layers, labelKey: 'admin.filieresTab' },
  { key: 'annees', icon: GraduationCap, labelKey: 'admin.anneesTab' },
  { key: 'modules', icon: BookOpen, labelKey: 'admin.modulesTab' },
]

function useServerErrors() {
  const [serverErrors, setServerErrors] = useState({})
  const map = (err) => {
    const errors = err?.response?.data?.errors
    if (errors) {
      setServerErrors(Object.fromEntries(Object.entries(errors).map(([key, value]) => [key, value[0]])))
    }
  }
  return { serverErrors, setServerErrors, map }
}

function ActiveBadge({ active }) {
  const { t } = useTranslation()
  return <Badge tone={active ? 'green' : 'slate'}>{active ? t('common.active') : t('common.inactive')}</Badge>
}

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500/40 dark:border-slate-600 dark:bg-slate-800"
      />
      {label}
    </label>
  )
}

function RowActions({ onEdit, onDelete, busy }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button variant="ghost" size="sm" icon={Pencil} onClick={onEdit} disabled={busy} aria-label={t('common.edit')} />
      <Button
        variant="ghost"
        size="sm"
        icon={Trash}
        onClick={onDelete}
        disabled={busy}
        aria-label={t('common.delete')}
        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
      />
    </div>
  )
}

function FilieresTab({ onChanged }) {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useApi(() => adminService.filieres(), [])
  const [modal, setModal] = useState(null) // {item} | {item: null}
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const { serverErrors, setServerErrors, map } = useServerErrors()

  const filieres = data || []

  const openModal = (item) => {
    setServerErrors({})
    setModal({ item })
    setValues({
      name: item?.name || '',
      code: item?.code || '',
      description: item?.description || '',
      color: item?.color || '',
      position: item?.position ?? 0,
      is_active: item ? Boolean(item.is_active) : true,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setServerErrors({})
    try {
      const payload = { ...values, position: Number(values.position) || 0 }
      const result = modal.item
        ? await adminService.updateFiliere(modal.item.id, payload)
        : await adminService.createFiliere(payload)
      successToast(result.message || t('common.updatedSuccess'))
      setModal(null)
      await reload()
      onChanged?.()
    } catch (err) {
      map(err)
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (filiere) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteFiliere'),
      text: t('admin.deleteFiliereText', { name: filiere.name }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    try {
      const result = await adminService.deleteFiliere(filiere.id)
      successToast(result.message || t('common.deletedSuccess'))
      await reload()
      onChanged?.()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    }
  }

  if (loading) return <Skeleton className="h-64 rounded-2xl" />
  if (error) return <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button icon={Plus} onClick={() => openModal(null)}>
          {t('admin.newFiliere')}
        </Button>
      </div>

      {!filieres.length ? (
        <Card>
          <EmptyState title={t('admin.noFilieres')} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  <th className="px-4 py-3 text-start">{t('admin.filiereName')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.filiereCode')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.anneesTab')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.modulesTab')}</th>
                  <th className="px-4 py-3 text-start">{t('nav.resources')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filieres.map((filiere) => (
                  <tr key={filiere.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: filiere.color || '#2563eb' }}
                        />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{filiere.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">/{filiere.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="primary">{filiere.code}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{filiere.annees_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{filiere.modules_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{filiere.resources_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={filiere.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions onEdit={() => openModal(filiere)} onDelete={() => handleDelete(filiere)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.item ? t('admin.editFiliere') : t('admin.newFiliere')}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('admin.filiereName')}
            name="name"
            required
            value={values.name || ''}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            error={serverErrors.name}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.filiereCode')}
              name="code"
              required
              value={values.code || ''}
              onChange={(event) => setValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              error={serverErrors.code}
              hint={t('admin.filiereCodeHint')}
            />
            <Input
              label={t('admin.color')}
              name="color"
              value={values.color || ''}
              onChange={(event) => setValues((current) => ({ ...current, color: event.target.value }))}
              error={serverErrors.color}
              hint={t('admin.colorHint')}
            />
          </div>
          <Textarea
            label={t('admin.description')}
            name="description"
            rows={3}
            value={values.description || ''}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            error={serverErrors.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.position')}
              name="position"
              type="number"
              min="0"
              value={values.position ?? 0}
              onChange={(event) => setValues((current) => ({ ...current, position: event.target.value }))}
              error={serverErrors.position}
              hint={t('admin.positionHint')}
            />
            <div className="flex items-end pb-2">
              <CheckboxField
                label={t('common.active')}
                name="is_active"
                checked={Boolean(values.is_active)}
                onChange={(checked) => setValues((current) => ({ ...current, is_active: checked }))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

function AnneesTab({ filieres, onChanged }) {
  const { t } = useTranslation()
  const [filiereFilter, setFiliereFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const { serverErrors, setServerErrors, map } = useServerErrors()

  const { data, loading, error, reload } = useApi(
    () => adminService.annees({ filiere_id: filiereFilter || undefined }),
    [filiereFilter],
  )
  const { data: niveaux } = useApi(() => catalogService.niveaux(), [])

  const annees = data || []

  const openModal = (item) => {
    setServerErrors({})
    setModal({ item })
    setValues({
      filiere_id: item?.filiere_id ? String(item.filiere_id) : filiereFilter || '',
      niveau_id: item?.niveau_id ? String(item.niveau_id) : '',
      label: item?.label || '',
      code: item?.code || '',
      option_name: item?.option_name || '',
      position: item?.position ?? 0,
      is_active: item ? Boolean(item.is_active) : true,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setServerErrors({})
    try {
      if (!values.filiere_id) {
        setServerErrors({ filiere_id: t('contributor.errors.filiereRequired') })
        setSaving(false)
        return
      }
      const payload = {
        filiere_id: Number(values.filiere_id),
        niveau_id: values.niveau_id ? Number(values.niveau_id) : null,
        label: values.label,
        code: values.code || null,
        option_name: values.option_name || null,
        position: Number(values.position) || 0,
        is_active: values.is_active,
      }
      const result = modal.item
        ? await adminService.updateAnnee(modal.item.id, payload)
        : await adminService.createAnnee(payload)
      successToast(result.message || t('common.updatedSuccess'))
      setModal(null)
      await reload()
      onChanged?.()
    } catch (err) {
      map(err)
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (annee) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteAnnee'),
      text: t('admin.deleteAnneeText', { name: annee.label }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    try {
      const result = await adminService.deleteAnnee(annee.id)
      successToast(result.message || t('common.deletedSuccess'))
      await reload()
      onChanged?.()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    }
  }

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Select
            label={t('common.filiere')}
            value={filiereFilter}
            onChange={(event) => setFiliereFilter(event.target.value)}
            className="w-full sm:w-72"
          >
            <option value="">{t('admin.allFilieres')}</option>
            {(filieres || []).map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.name}
              </option>
            ))}
          </Select>
          <Button icon={Plus} onClick={() => openModal(null)} disabled={!filieres?.length}>
            {t('admin.addAnnee')}
          </Button>
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !annees.length ? (
        <Card>
          <EmptyState title={t('admin.noAnnees')} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  <th className="px-4 py-3 text-start">{t('admin.anneeLabel')}</th>
                  <th className="px-4 py-3 text-start">{t('common.filiere')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.anneeCode')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.modulesTab')}</th>
                  <th className="px-4 py-3 text-start">{t('nav.resources')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {annees.map((annee) => (
                  <tr key={annee.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{annee.label}</p>
                      {annee.option_name && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">{annee.option_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {filieres?.find((filiere) => filiere.id === annee.filiere_id)?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{annee.code || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{annee.modules_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{annee.resources_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={annee.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions onEdit={() => openModal(annee)} onDelete={() => handleDelete(annee)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.item ? t('admin.editAnnee') : t('admin.addAnnee')}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label={t('common.filiere')}
            name="filiere_id"
            required
            value={values.filiere_id || ''}
            onChange={(event) => setValues((current) => ({ ...current, filiere_id: event.target.value }))}
            error={serverErrors.filiere_id}
          >
            <option value="">{t('admin.selectFiliere')}</option>
            {(filieres || []).map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.anneeLabel')}
              name="label"
              required
              value={values.label || ''}
              onChange={(event) => setValues((current) => ({ ...current, label: event.target.value }))}
              error={serverErrors.label}
            />
            <Input
              label={t('admin.anneeCode')}
              name="code"
              value={values.code || ''}
              onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
              error={serverErrors.code}
              hint={t('admin.anneeCodeHint')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.optionName')}
              name="option_name"
              value={values.option_name || ''}
              onChange={(event) => setValues((current) => ({ ...current, option_name: event.target.value }))}
              error={serverErrors.option_name}
            />
            <Select
              label={t('common.niveau')}
              name="niveau_id"
              value={values.niveau_id || ''}
              onChange={(event) => setValues((current) => ({ ...current, niveau_id: event.target.value }))}
              error={serverErrors.niveau_id}
            >
              <option value="">{t('common.none')}</option>
              {(niveaux || []).map((niveau) => (
                <option key={niveau.id} value={niveau.id}>
                  {niveau.name || niveau.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.position')}
              name="position"
              type="number"
              min="0"
              value={values.position ?? 0}
              onChange={(event) => setValues((current) => ({ ...current, position: event.target.value }))}
              error={serverErrors.position}
            />
            <div className="flex items-end pb-2">
              <CheckboxField
                label={t('common.active')}
                name="is_active"
                checked={Boolean(values.is_active)}
                onChange={(checked) => setValues((current) => ({ ...current, is_active: checked }))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

function ModulesTab({ filieres, onChanged }) {
  const { t } = useTranslation()
  const [filiereFilter, setFiliereFilter] = useState('')
  const [anneeFilter, setAnneeFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const { serverErrors, setServerErrors, map } = useServerErrors()

  const { data: annees } = useApi(
    () => catalogService.annees(filiereFilter || undefined),
    [filiereFilter],
  )

  const { data, loading, error, reload } = useApi(
    () => adminService.modules({ filiere_id: filiereFilter || undefined, annee_id: anneeFilter || undefined }),
    [filiereFilter, anneeFilter],
  )

  const modules = data || []

  const openModal = (item) => {
    setServerErrors({})
    setModal({ item })
    setValues({
      filiere_id: item?.filiere_id ? String(item.filiere_id) : filiereFilter || '',
      annee_formation_id: item?.annee_formation_id ? String(item.annee_formation_id) : anneeFilter || '',
      code: item?.code || '',
      name: item?.name || '',
      description: item?.description || '',
      position: item?.position ?? 0,
      is_active: item ? Boolean(item.is_active) : true,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setServerErrors({})
    try {
      if (!values.filiere_id) {
        setServerErrors({ filiere_id: t('contributor.errors.filiereRequired') })
        setSaving(false)
        return
      }
      const payload = {
        filiere_id: Number(values.filiere_id),
        annee_formation_id: values.annee_formation_id ? Number(values.annee_formation_id) : null,
        code: values.code || null,
        name: values.name,
        description: values.description || null,
        position: Number(values.position) || 0,
        is_active: values.is_active,
      }
      const result = modal.item
        ? await adminService.updateModule(modal.item.id, payload)
        : await adminService.createModule(payload)
      successToast(result.message || t('common.updatedSuccess'))
      setModal(null)
      await reload()
      onChanged?.()
    } catch (err) {
      map(err)
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (module) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteModule'),
      text: t('admin.deleteModuleText', { name: module.name }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    try {
      const result = await adminService.deleteModule(module.id)
      successToast(result.message || t('common.deletedSuccess'))
      await reload()
      onChanged?.()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    }
  }

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label={t('common.filiere')}
              value={filiereFilter}
              onChange={(event) => {
                setFiliereFilter(event.target.value)
                setAnneeFilter('')
              }}
              className="w-full sm:w-60"
            >
              <option value="">{t('admin.allFilieres')}</option>
              {(filieres || []).map((filiere) => (
                <option key={filiere.id} value={filiere.id}>
                  {filiere.name}
                </option>
              ))}
            </Select>
            <Select
              label={t('admin.assignYear')}
              value={anneeFilter}
              onChange={(event) => setAnneeFilter(event.target.value)}
              disabled={!filiereFilter}
              className="w-full sm:w-52"
            >
              <option value="">{t('admin.allAnnees')}</option>
              {(annees || []).map((annee) => (
                <option key={annee.id} value={annee.id}>
                  {annee.label}
                </option>
              ))}
            </Select>
          </div>
          <Button icon={Plus} onClick={() => openModal(null)} disabled={!filieres?.length}>
            {t('admin.newModule')}
          </Button>
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : !modules.length ? (
        <Card>
          <EmptyState title={t('admin.noModules')} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  <th className="px-4 py-3 text-start">{t('admin.moduleName')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.moduleCode')}</th>
                  <th className="px-4 py-3 text-start">{t('common.filiere')}</th>
                  <th className="px-4 py-3 text-start">{t('admin.assignYear')}</th>
                  <th className="px-4 py-3 text-start">{t('nav.resources')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {modules.map((module) => (
                  <tr key={module.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="max-w-72 px-4 py-3">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">{module.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      {module.code ? <Badge tone="secondary">{module.code}</Badge> : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {module.filiere?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {module.annee_formation?.label || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{module.resources_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={module.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions onEdit={() => openModal(module)} onDelete={() => handleDelete(module)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.item ? t('admin.editModule') : t('admin.newModule')}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t('common.filiere')}
              name="filiere_id"
              required
              value={values.filiere_id || ''}
              onChange={(event) =>
                setValues((current) => ({ ...current, filiere_id: event.target.value, annee_formation_id: '' }))
              }
              error={serverErrors.filiere_id}
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
              value={values.annee_formation_id || ''}
              onChange={(event) => setValues((current) => ({ ...current, annee_formation_id: event.target.value }))}
              error={serverErrors.annee_formation_id}
              disabled={!values.filiere_id}
            >
              <option value="">{t('common.none')}</option>
              {(annees || [])
                .filter((annee) => String(annee.filiere_id) === String(values.filiere_id))
                .map((annee) => (
                  <option key={annee.id} value={annee.id}>
                    {annee.label}
                  </option>
                ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.moduleName')}
              name="name"
              required
              value={values.name || ''}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              error={serverErrors.name}
            />
            <Input
              label={t('admin.moduleCode')}
              name="code"
              value={values.code || ''}
              onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
              error={serverErrors.code}
            />
          </div>
          <Textarea
            label={t('admin.description')}
            name="description"
            rows={3}
            value={values.description || ''}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            error={serverErrors.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.position')}
              name="position"
              type="number"
              min="0"
              value={values.position ?? 0}
              onChange={(event) => setValues((current) => ({ ...current, position: event.target.value }))}
              error={serverErrors.position}
            />
            <div className="flex items-end pb-2">
              <CheckboxField
                label={t('common.active')}
                name="is_active"
                checked={Boolean(values.is_active)}
                onChange={(checked) => setValues((current) => ({ ...current, is_active: checked }))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default function AdminPedagogyPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((item) => item.key === params.get('tab')) ? params.get('tab') : 'filieres'
  const [filieresVersion, setFilieresVersion] = useState(0)

  const { data: filieres } = useApi(() => adminService.filieres(), [filieresVersion])

  const setTab = (key) => {
    const next = new URLSearchParams(params)
    if (key === 'filieres') next.delete('tab')
    else next.set('tab', key)
    setParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader title={t('admin.managePedagogy')} description={t('admin.managePedagogyDesc')} />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'gradient-brand text-white shadow-sm shadow-primary-600/25'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60'
            }`}
          >
            <Icon className="size-4" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'filieres' && <FilieresTab onChanged={() => setFilieresVersion((value) => value + 1)} />}
      {tab === 'annees' && <AnneesTab filieres={filieres} onChanged={() => setFilieresVersion((value) => value + 1)} />}
      {tab === 'modules' && <ModulesTab filieres={filieres} onChanged={() => setFilieresVersion((value) => value + 1)} />}
    </div>
  )
}
