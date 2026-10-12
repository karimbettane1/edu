import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Save, Settings2, ShieldCheck } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const LANGUAGES = ['fr', 'ar', 'en']

function toBool(value, fallback = true) {
  if (value === null || value === undefined || value === '') return fallback
  return value === '1' || value === 'true'
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'gradient-brand' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'start-[22px]' : 'start-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export default function AdminSettingsPage() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useApi(() => adminService.settings(), [])
  const [values, setValues] = useState(null)
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})

  useEffect(() => {
    if (!data) return
    setValues({
      site_name: data.site_name || '',
      site_tagline: data.site_tagline || '',
      site_description: data.site_description || '',
      contact_email: data.contact_email || '',
      languages: (data.available_languages || 'fr,ar,en')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      default_language: data.default_language || 'fr',
      public_downloads_enabled: toBool(data.public_downloads_enabled),
      comments_moderation: toBool(data.comments_moderation),
      contributor_validation: toBool(data.contributor_validation),
    })
  }, [data])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setServerErrors((current) => ({ ...current, [`settings.${field}`]: undefined }))
  }

  const toggleLanguage = (language) => {
    setValues((current) => {
      const selected = current.languages.includes(language)
      if (selected && current.languages.length === 1) return current
      const languages = selected
        ? current.languages.filter((item) => item !== language)
        : [...current.languages, language]
      return {
        ...current,
        languages,
        default_language: languages.includes(current.default_language) ? current.default_language : languages[0],
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setServerErrors({})
    try {
      const result = await adminService.updateSettings({
        settings: {
          site_name: values.site_name || null,
          site_tagline: values.site_tagline || null,
          site_description: values.site_description || null,
          contact_email: values.contact_email || null,
          available_languages: values.languages.join(','),
          default_language: values.default_language,
          public_downloads_enabled: values.public_downloads_enabled ? '1' : '0',
          comments_moderation: values.comments_moderation ? '1' : '0',
          contributor_validation: values.contributor_validation ? '1' : '0',
        },
      })
      successToast(result.message || t('admin.settingsSaved'))
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

  if (loading || (!values && !error)) {
    return (
      <div>
        <PageHeader title={t('admin.settings')} description={t('admin.settingsDesc')} />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title={t('admin.settings')} description={t('admin.settingsDesc')} />
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={t('admin.settings')}
        description={t('admin.settingsDesc')}
        actions={
          <Button icon={Save} onClick={handleSave} loading={saving}>
            {t('common.save')}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <Settings2 className="size-4.5" />
            {t('admin.generalSettings')}
          </h2>
          <div className="space-y-4">
            <Input
              label={t('admin.siteName')}
              name="site_name"
              value={values.site_name}
              onChange={update('site_name')}
              error={serverErrors['settings.site_name']}
            />
            <Input
              label={t('admin.siteTagline')}
              name="site_tagline"
              value={values.site_tagline}
              onChange={update('site_tagline')}
              error={serverErrors['settings.site_tagline']}
            />
            <Input
              label={t('admin.contactEmail')}
              name="contact_email"
              type="email"
              value={values.contact_email}
              onChange={update('contact_email')}
              error={serverErrors['settings.contact_email']}
            />
            <Textarea
              label={t('admin.siteDescription')}
              name="site_description"
              rows={4}
              value={values.site_description}
              onChange={update('site_description')}
              error={serverErrors['settings.site_description']}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              <Languages className="size-4.5" />
              {t('admin.languageSettings')}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="label">{t('admin.availableLanguages')}</p>
                <div className="flex flex-wrap gap-3">
                  {LANGUAGES.map((language) => {
                    const selected = values.languages.includes(language)
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-600/15 dark:text-primary-300'
                            : 'border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        {t(`common.languages.${language}`)}
                      </button>
                    )
                  })}
                </div>
                {serverErrors['settings.available_languages'] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {serverErrors['settings.available_languages']}
                  </p>
                )}
              </div>
              <Select
                label={t('admin.defaultLanguage')}
                name="default_language"
                value={values.default_language}
                onChange={update('default_language')}
                error={serverErrors['settings.default_language']}
              >
                {values.languages.map((language) => (
                  <option key={language} value={language}>
                    {t(`common.languages.${language}`)}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display mb-2 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              <ShieldCheck className="size-4.5" />
              {t('admin.platformOptions')}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              <ToggleRow
                label={t('admin.publicDownloads')}
                description={t('admin.publicDownloadsHint')}
                checked={values.public_downloads_enabled}
                onChange={(checked) => setValues((current) => ({ ...current, public_downloads_enabled: checked }))}
              />
              <ToggleRow
                label={t('admin.commentsModeration')}
                description={t('admin.commentsModerationHint')}
                checked={values.comments_moderation}
                onChange={(checked) => setValues((current) => ({ ...current, comments_moderation: checked }))}
              />
              <ToggleRow
                label={t('admin.contributorValidation')}
                description={t('admin.contributorValidationHint')}
                checked={values.contributor_validation}
                onChange={(checked) => setValues((current) => ({ ...current, contributor_validation: checked }))}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button icon={Save} onClick={handleSave} loading={saving}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
