import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, Languages, UserCog } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { authService } from '../../services/authService'
import { catalogService } from '../../services/catalogService'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { successToast, errorToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/format'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const { data: filieres } = useApi(() => catalogService.filieres(), [])

  const [profile, setProfile] = useState({ name: '', email: '', filiere_id: '', annee_formation_id: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)

  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [language, setLanguage] = useState('fr')
  const [languageSaving, setLanguageSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfile({
      name: user.name || '',
      email: user.email || '',
      filiere_id: user.filiere_id ? String(user.filiere_id) : '',
      annee_formation_id: user.annee_formation_id ? String(user.annee_formation_id) : '',
    })
    setLanguage(user.language || 'fr')
  }, [user])

  const { data: annees } = useApi(
    () => catalogService.annees(profile.filiere_id || undefined),
    [profile.filiere_id],
  )

  const anneeOptions = useMemo(() => annees || [], [annees])

  const handleProfileChange = (field) => (event) => {
    const value = event.target.value
    setProfile((current) => ({
      ...current,
      [field]: value,
      ...(field === 'filiere_id' ? { annee_formation_id: '' } : {}),
    }))
    setProfileErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setProfileSaving(true)
    setProfileErrors({})
    try {
      const result = await authService.updateProfile({
        name: profile.name,
        email: profile.email,
        filiere_id: profile.filiere_id ? Number(profile.filiere_id) : null,
        annee_formation_id: profile.annee_formation_id ? Number(profile.annee_formation_id) : null,
      })
      updateUser(result.user)
      successToast(result.message || t('student.profileUpdated'))
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) {
        setProfileErrors(Object.fromEntries(Object.entries(errors).map(([key, value]) => [key, value[0]])))
      }
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setProfileSaving(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setPasswordSaving(true)
    setPasswordErrors({})
    try {
      await authService.updatePassword(password)
      setPassword({ current_password: '', password: '', password_confirmation: '' })
      successToast(t('student.passwordUpdated'))
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) {
        setPasswordErrors(Object.fromEntries(Object.entries(errors).map(([key, value]) => [key, value[0]])))
      }
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setPasswordSaving(false)
    }
  }

  const submitLanguage = async (event) => {
    event.preventDefault()
    setLanguageSaving(true)
    try {
      const result = await authService.updatePreferences({ language })
      if (result?.user) updateUser(result.user)
      i18n.changeLanguage(language)
      successToast(t('student.preferencesSaved'))
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setLanguageSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('student.profile')} description={t('student.profileSubtitle')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400">
              <UserCog className="size-5" />
            </span>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
              {t('student.personalInfo')}
            </h2>
          </div>

          <form onSubmit={submitProfile} className="space-y-4" noValidate>
            <Input
              label={t('auth.fullName')}
              name="name"
              required
              value={profile.name}
              onChange={handleProfileChange('name')}
              error={profileErrors.name}
            />
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              required
              value={profile.email}
              onChange={handleProfileChange('email')}
              error={profileErrors.email}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('common.filiere')}
                name="filiere_id"
                value={profile.filiere_id}
                onChange={handleProfileChange('filiere_id')}
                error={profileErrors.filiere_id}
              >
                <option value="">{t('common.none')}</option>
                {(filieres || []).map((filiere) => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.name}
                  </option>
                ))}
              </Select>
              <Select
                label={t('common.annee')}
                name="annee_formation_id"
                value={profile.annee_formation_id}
                onChange={handleProfileChange('annee_formation_id')}
                error={profileErrors.annee_formation_id}
                disabled={!profile.filiere_id}
              >
                <option value="">{t('common.none')}</option>
                {anneeOptions.map((annee) => (
                  <option key={annee.id} value={annee.id}>
                    {annee.label}
                  </option>
                ))}
              </Select>
            </div>

            {user?.created_at && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('student.since')} {formatDate(user.created_at, i18n.language)}
              </p>
            )}

            <Button type="submit" loading={profileSaving} disabled={profileSaving}>
              {profileSaving ? t('common.saving') : t('common.save')}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 dark:bg-secondary-600/15 dark:text-secondary-400">
                <KeyRound className="size-5" />
              </span>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t('student.changePassword')}
              </h2>
            </div>

            <form onSubmit={submitPassword} className="space-y-4" noValidate>
              <Input
                label={t('student.currentPassword')}
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                value={password.current_password}
                onChange={(event) => setPassword((current) => ({ ...current, current_password: event.target.value }))}
                error={passwordErrors.current_password}
              />
              <Input
                label={t('student.newPassword')}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password.password}
                onChange={(event) => setPassword((current) => ({ ...current, password: event.target.value }))}
                error={passwordErrors.password}
                hint={t('auth.passwordHint')}
              />
              <Input
                label={t('student.confirmNewPassword')}
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                value={password.password_confirmation}
                onChange={(event) =>
                  setPassword((current) => ({ ...current, password_confirmation: event.target.value }))
                }
                error={passwordErrors.password_confirmation}
              />
              <Button type="submit" variant="secondary" loading={passwordSaving} disabled={passwordSaving}>
                {passwordSaving ? t('common.saving') : t('student.changePassword')}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-600/15 dark:text-sky-400">
                <Languages className="size-5" />
              </span>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t('student.preferences')}
              </h2>
            </div>

            <form onSubmit={submitLanguage} className="space-y-4" noValidate>
              <Select
                label={t('student.preferredLanguage')}
                name="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </Select>
              <Button type="submit" loading={languageSaving} disabled={languageSaving}>
                {languageSaving ? t('common.saving') : t('common.save')}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
