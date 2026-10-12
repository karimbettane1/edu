import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react'
import { contactService } from '../../services/contactService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import { errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

export default function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = t('auth.fieldRequired')
    if (!form.email.trim()) nextErrors.email = t('auth.fieldRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = t('auth.invalidEmail')
    if (!form.subject.trim()) nextErrors.subject = t('auth.fieldRequired')
    if (form.message.trim().length < 10) nextErrors.message = t('errors.validationError')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    try {
      const result = await contactService.send({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setForm(EMPTY_FORM)
      successToast(result.message || t('contact.successMessage'))
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, value[0]])))
      }
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {t('contact.title')}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('contact.subtitle')}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <Card className="p-6 sm:p-7 lg:col-span-3">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <MessageSquare className="size-5 text-primary-600 dark:text-primary-400" />
            {t('contact.formTitle')}
          </h2>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('contact.name')}
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                required
                maxLength={120}
                autoComplete="name"
              />
              <Input
                label={t('contact.email')}
                type="email"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                required
                maxLength={120}
                autoComplete="email"
              />
            </div>
            <Input
              label={t('contact.subject')}
              value={form.subject}
              onChange={set('subject')}
              error={errors.subject}
              required
              maxLength={160}
            />
            <Textarea
              label={t('contact.message')}
              rows={6}
              placeholder={t('contact.messagePlaceholder')}
              value={form.message}
              onChange={set('message')}
              error={errors.message}
              required
            />
            <div className="flex justify-end">
              <Button type="submit" icon={Send} loading={busy}>
                {t('contact.sendMessage')}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('contact.emailLabel')}
            </h2>
            <a
              href="mailto:contact@digital-academy.ma"
              className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-700 dark:hover:border-primary-600/40 dark:hover:bg-primary-600/10"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400">
                <Mail className="size-4.5" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-200">contact@digital-academy.ma</span>
            </a>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600 dark:bg-secondary-600/15 dark:text-secondary-400">
                <MapPin className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('common.appName')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.tagline')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t('footer.about')}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
