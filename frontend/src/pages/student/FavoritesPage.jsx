import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import { resourceService } from '../../services/resourceService'
import PageHeader from '../../components/dashboard/PageHeader'
import ResourceCard from '../../components/resources/ResourceCard'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Button from '../../components/ui/Button'
import { ResourceGridSkeleton } from '../../components/ui/Skeleton'
import { errorToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const PER_PAGE = 12

export default function FavoritesPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const { data, loading, error, reload } = useApi(
    () => studentService.favorites({ per_page: PER_PAGE, page }),
    [page],
  )

  const resources = data?.data || []
  const meta = data?.meta || {}

  const handleRemove = async (resource) => {
    setBusyId(resource.id)
    try {
      await resourceService.toggleFavorite(resource.id)
      successToast(t('resources.removedFromFavorites'))
      await reload()
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title={t('student.myFavorites')} description={t('student.myFavoritesSubtitle')} />

      {loading ? (
        <ResourceGridSkeleton count={6} />
      ) : error ? (
        <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('student.emptyFavorites')}
          description={t('student.emptyFavoritesDesc')}
          action={
            <Button as={Link} to="/ressources" size="sm">
              {t('nav.resources')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleFavorite={handleRemove}
                favoriteBusy={busyId === resource.id}
              />
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} className="mt-8" />
          )}
        </>
      )}
    </div>
  )
}
