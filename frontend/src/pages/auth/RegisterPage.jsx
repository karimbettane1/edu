import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, KeyRound, Mail, User, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApi } from '../../hooks/useApi'
import { catalogService } from '../../services/catalogService'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { dashboardPath } from '../../utils/roles'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  filiere_id: '',
  annee_formation_id: '',
}

export default function RegisterPage() {
  const { t, i18n } = useTranslation()
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const { data: filieres } = useApi(() => catalogService.filieres(), [])
  const { data: annees, loading: anneesLoading } = useApi(
    () => catalogService.annees(form.filiere_id || undefined),
    [form.filiere_id],
  )

  const anneeOptions = useMemo(
    () => (annees || []).filter((annee) => String(annee.filiere_id) === String(form.filiere_id)),
    [annees, form.filiere_id],
  )

  if (isAuthenticated) {
    return <Navigate to={dashboardPath(user)} replace />
  }

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'filiere_id' ? { annee_formation_id: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = t('auth.fieldRequired')
    if (!form.email.trim()) nextErrors.email = t('auth.fieldRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = t('auth.invalidEmail')
    if (!form.password) nextErrors.password = t('auth.fieldRequired')
    else if (form.password.length < 8) nextErrors.password = t('auth.passwordMin')
    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = t('auth.passwordMismatch')
    }
    if (!form.filiere_id) nextErrors.filiere_id = t('auth.fieldRequired')
    if (!form.annee_formation_id) nextErrors.annee_formation_id = t('auth.fieldRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        filiere_id: Number(form.filiere_id),
        annee_formation_id: Number(form.annee_formation_id),
        language: i18n.language,
      })
      successToast(t('auth.registerSuccess'))
      navigate('/etudiant', { replace: true })
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, value[0]])))
      }
      errorToast(getApiErrorMessage(err, t('auth.registerTitle')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {t('auth.registerTitle')}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('auth.registerSubtitle')}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label={t('auth.fullName')}
          icon={User}
          placeholder={t('auth.fullNamePlaceholder')}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Input
          label={t('auth.email')}
          type="email"
          icon={Mail}
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('auth.selectFiliere')}
            value={form.filiere_id}
            onChange={set('filiere_id')}
            error={errors.filiere_id}
            required
          >
            <option value="">—</option>
            {(filieres || []).map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.name}
              </option>
            ))}
          </Select>
          <Select
            label={t('auth.selectAnnee')}
            value={form.annee_formation_id}
            onChange={set('annee_formation_id')}
            error={errors.annee_formation_id}
            disabled={!form.filiere_id || anneesLoading}
            required
          >
            <option value="">—</option>
            {anneeOptions.map((annee) => (
              <option key={annee.id} value={annee.id}>
                {annee.label}
                {annee.option_name ? ` — ${annee.option_name}` : ''}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('auth.password')}
            type="password"
            icon={KeyRound}
            placeholder={t('auth.passwordPlaceholder')}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint={t('auth.passwordMin')}
            autoComplete="new-password"
            required
          />
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            icon={GraduationCap}
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            error={errors.password_confirmation}
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" icon={UserPlus} loading={busy} className="w-full" size="lg">
          {t('auth.registerButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('auth.hasAccount')}{' '}
        <Link to="/connexion" className="link font-medium">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  )
}
