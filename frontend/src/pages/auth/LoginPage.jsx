import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, LogIn, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { errorToast, successToast } from '../../utils/alerts'
import { dashboardPath } from '../../utils/roles'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardPath(user)} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = t('auth.fieldRequired')
    if (!form.password) nextErrors.password = t('auth.fieldRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    try {
      const user = await login({ email: form.email.trim(), password: form.password })
      successToast(t('auth.loginSuccess'))
      const from = location.state?.from
      navigate(from || dashboardPath(user), { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 429) {
        errorToast(t('auth.tooManyAttempts'))
      } else if (status === 422) {
        const apiErrors = err.response.data?.errors || {}
        setErrors({
          email: apiErrors.email?.[0],
          password: apiErrors.password?.[0],
        })
        if (!apiErrors.email && !apiErrors.password) errorToast(t('auth.invalidCredentials'))
      } else if (status === 403) {
        errorToast(err.response.data?.message || t('errors.403Text'))
      } else {
        errorToast(t('errors.networkError'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {t('auth.loginTitle')}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('auth.loginSubtitle')}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
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
        <Input
          label={t('auth.password')}
          type="password"
          icon={KeyRound}
          placeholder={t('auth.passwordPlaceholder')}
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <Button type="submit" icon={LogIn} loading={busy} className="w-full" size="lg">
          {t('auth.loginButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('auth.noAccount')}{' '}
        <Link to="/inscription" className="link font-medium">
          {t('auth.createAccount')}
        </Link>
      </p>
    </div>
  )
}
