import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, Pencil, Trash } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { adminService } from '../../services/adminService'
import { catalogService } from '../../services/catalogService'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchBar from '../../components/ui/SearchBar'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { confirmDialog, errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/format'

const ROLES = ['student', 'contributor', 'admin']
const ROLE_TONES = { admin: 'red', contributor: 'secondary', student: 'primary' }

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const debouncedSearch = useDebounce(search, 350)
  const [modal, setModal] = useState(null)
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [actionId, setActionId] = useState(null)

  const page = Number(params.get('page')) || 1
  const role = params.get('role') || ''
  const active = params.get('is_active') || ''

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
      adminService.users({
        search: debouncedSearch || undefined,
        role: role || undefined,
        is_active: active || undefined,
        page,
        per_page: 15,
      }),
    [debouncedSearch, role, active, page],
  )

  const { data: filieres } = useApi(() => catalogService.filieres(), [])
  const { data: annees } = useApi(
    () => catalogService.annees(values.filiere_id || undefined),
    [values.filiere_id],
  )

  const users = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    if (meta && meta.last_page >= 1 && page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  const openModal = (user) => {
    setServerErrors({})
    setModal({ user })
    setValues({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      filiere_id: user.filiere_id ? String(user.filiere_id) : '',
      annee_formation_id: user.annee_formation_id ? String(user.annee_formation_id) : '',
      is_active: Boolean(user.is_active),
      password: '',
      password_confirmation: '',
    })
  }

  const isSelf = modal?.user?.id === currentUser?.id

  const handleSave = async () => {
    setSaving(true)
    setServerErrors({})
    try {
      const payload = {
        name: values.name,
        email: values.email,
        filiere_id: values.filiere_id ? Number(values.filiere_id) : null,
        annee_formation_id: values.annee_formation_id ? Number(values.annee_formation_id) : null,
      }
      if (!isSelf) {
        payload.role = values.role
        payload.is_active = values.is_active
      }
      if (values.password) {
        payload.password = values.password
        payload.password_confirmation = values.password_confirmation
      }
      const result = await adminService.updateUser(modal.user.id, payload)
      successToast(result.message || t('common.updatedSuccess'))
      setModal(null)
      await reload()
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) {
        setServerErrors(Object.fromEntries(Object.entries(errors).map(([key, value]) => [key, value[0]])))
      }
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    const confirmed = await confirmDialog({
      title: t('admin.deleteUser'),
      text: t('admin.deleteUserText', { name: user.name }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!confirmed) return
    setActionId(user.id)
    try {
      const result = await adminService.deleteUser(user.id)
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
      <PageHeader title={t('admin.manageUsers')} description={t('admin.manageUsersDesc')} />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchBar value={search} onChange={setSearch} placeholder={t('admin.searchUser')} />
          <Select value={role} onChange={(event) => updateParams({ role: event.target.value, page: '' })}>
            <option value="">{t('admin.allRoles')}</option>
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {t(`common.roles.${option}`)}
              </option>
            ))}
          </Select>
          <Select value={active} onChange={(event) => updateParams({ is_active: event.target.value, page: '' })}>
            <option value="">{t('admin.allAccounts')}</option>
            <option value="1">{t('admin.activeAccounts')}</option>
            <option value="0">{t('admin.inactiveAccounts')}</option>
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
      ) : !users.length ? (
        <Card>
          <EmptyState title={t('admin.noUsersFound')} />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="px-4 py-3 text-start">{t('admin.actor')}</th>
                    <th className="px-4 py-3 text-start">{t('admin.userRole')}</th>
                    <th className="px-4 py-3 text-start">{t('common.filiere')}</th>
                    <th className="px-4 py-3 text-start">{t('nav.resources')}</th>
                    <th className="px-4 py-3 text-start">{t('admin.lastLogin')}</th>
                    <th className="px-4 py-3 text-start">{t('common.status')}</th>
                    <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="gradient-brand flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                              {user.name}
                              {user.id === currentUser?.id && (
                                <span className="ms-2 text-xs text-slate-400">({t('admin.you')})</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ROLE_TONES[user.role] || 'slate'}>{t(`common.roles.${user.role}`)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {user.filiere?.code || '—'}
                        {user.annee_formation?.label ? ` · ${user.annee_formation.label}` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.resources_count ?? 0}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {user.last_login_at ? formatDate(user.last_login_at, i18n.language) : t('admin.never')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={user.is_active ? 'green' : 'slate'}>
                          {user.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            onClick={() => openModal(user)}
                            aria-label={t('common.edit')}
                          />
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash}
                              loading={actionId === user.id}
                              onClick={() => handleDelete(user)}
                              aria-label={t('common.delete')}
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/15"
                            />
                          )}
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
              {t('common.resultsCount', { count: meta?.total ?? users.length })}
            </p>
            <Pagination
              currentPage={page}
              lastPage={meta?.last_page ?? 1}
              onChange={(next) => updateParams({ page: next === 1 ? '' : next })}
            />
          </div>
        </>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={t('admin.editUser')}
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
        {modal && (
          <div className="space-y-4">
            <Input
              label={t('auth.fullName')}
              name="name"
              required
              value={values.name || ''}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              error={serverErrors.name}
            />
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              required
              value={values.email || ''}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              error={serverErrors.email}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('admin.userRole')}
                name="role"
                value={values.role || 'student'}
                onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))}
                error={serverErrors.role}
                disabled={isSelf}
                hint={isSelf ? t('admin.cannotChangeOwnRole') : undefined}
              >
                {ROLES.map((option) => (
                  <option key={option} value={option}>
                    {t(`common.roles.${option}`)}
                  </option>
                ))}
              </Select>
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(values.is_active)}
                    disabled={isSelf}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, is_active: event.target.checked }))
                    }
                    className="size-4 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500/40 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800"
                  />
                  {t('admin.activeAccount')}
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('common.filiere')}
                name="filiere_id"
                value={values.filiere_id || ''}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    filiere_id: event.target.value,
                    annee_formation_id: '',
                  }))
                }
                error={serverErrors.filiere_id}
              >
                <option value="">{t('common.none')}</option>
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
                onChange={(event) =>
                  setValues((current) => ({ ...current, annee_formation_id: event.target.value }))
                }
                error={serverErrors.annee_formation_id}
                disabled={!values.filiere_id}
              >
                <option value="">{t('common.none')}</option>
                {(annees || []).map((annee) => (
                  <option key={annee.id} value={annee.id}>
                    {annee.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <KeyRound className="size-4" />
                {t('admin.resetPassword')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('auth.password')}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password || ''}
                  onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                  error={serverErrors.password}
                  hint={t('admin.passwordLeaveEmpty')}
                />
                <Input
                  label={t('auth.confirmPassword')}
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={values.password_confirmation || ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, password_confirmation: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
