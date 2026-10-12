import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminService } from '../../services/adminService'
import PageHeader from '../../components/dashboard/PageHeader'
import ResourceForm from '../../components/dashboard/ResourceForm'
import Card from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { successToast, errorToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

export default function AdminResourceFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})

  const { data: resource, loading, error, reload } = useApi(
    () => (isEdit ? adminService.resource(id) : Promise.resolve(null)),
    [id],
  )

  const handleSubmit = async (formData) => {
    setSaving(true)
    setServerErrors({})
    try {
      const result = isEdit
        ? await adminService.updateResource(id, formData)
        : await adminService.createResource(formData)
      successToast(result.message || t('common.updatedSuccess'))
      navigate('/admin/ressources')
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

  return (
    <div>
      <PageHeader
        title={isEdit ? t('admin.editResource') : t('admin.newResource')}
        description={t('admin.resourceFormSubtitle')}
        actions={
          <Link to="/admin/ressources" className="link inline-flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="size-4 flip-rtl" />
            {t('admin.manageResources')}
          </Link>
        }
      />

      <Card className="p-6">
        {isEdit && loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : isEdit && error ? (
          <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
        ) : (
          <ResourceForm
            initial={resource}
            busy={saving}
            serverErrors={serverErrors}
            onSubmit={handleSubmit}
            allowPublish
          />
        )}
      </Card>
    </div>
  )
}
