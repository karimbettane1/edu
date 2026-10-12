import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FolderX } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { catalogService } from '../../services/catalogService'
import { resourceService } from '../../services/resourceService'
import { useAuth } from '../../contexts/AuthContext'
import SearchBar from '../../components/ui/SearchBar'
import FilterPanel from '../../components/resources/FilterPanel'
import ResourceCard from '../../components/resources/ResourceCard'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Button from '../../components/ui/Button'
import { ResourceGridSkeleton } from '../../components/ui/Skeleton'
import { errorToast, infoToast, successToast } from '../../utils/alerts'
import { getApiErrorMessage } from '../../services/api'

const PER_PAGE = 12

export default function ResourcesPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [favoriteBusyId, setFavoriteBusyId] = useState(null)

  const filters = useMemo(
    () => ({
      search: searchParams.get('q') || '',
      filiere_id: searchParams.get('filiere_id') || '',
      annee_id: searchParams.get('annee_id') || '',
      module_id: searchParams.get('module_id') || '',
      type: searchParams.get('type') || '',
      sort: searchParams.get('sort') || 'recent',
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams],
  )

  const [searchInput, setSearchInput] = useState(filters.search)

  const updateParams = useCallback(
    (patch) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          Object.entries(patch).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) next.delete(key)
            else next.set(key, String(value))
          })
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const debouncedSearch = useDebounce(searchInput, 400)
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateParams({ q: debouncedSearch, page: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    setSearchInput(filters.search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  const query = useMemo(() => {
    const params = { per_page: PER_PAGE, page: filters.page, sort: filters.sort }
    if (filters.search) params.search = filters.search
    if (filters.filiere_id) params.filiere_id = filters.filiere_id
    if (filters.annee_id) params.annee_id = filters.annee_id
    if (filters.module_id) params.module_id = filters.module_id
    if (filters.type) params.type = filters.type
    return params
  }, [filters])

  const { data, loading, error, reload, setData } = useApi(
    () => resourceService.list(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(query)],
  )

  useEffect(() => {
    const meta = data?.meta
    if (meta && meta.last_page >= 1 && filters.page > meta.last_page) {
      updateParams({ page: meta.last_page === 1 ? '' : meta.last_page })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const { data: filieres } = useApi(() => catalogService.filieres(), [])
  const { data: annees } = useApi(
    () => catalogService.annees(filters.filiere_id || undefined),
    [filters.filiere_id],
  )
  const { data: modules } = useApi(
    () =>
      catalogService.modules({
        filiere_id: filters.filiere_id || undefined,
        annee_id: filters.annee_id || undefined,
      }),
    [filters.filiere_id, filters.annee_id],
  )

  const anneeOptions = useMemo(() => {
    const list = annees || []
    if (filters.filiere_id) return list
    return list.map((annee) => {
      const filiere = (filieres || []).find((item) => item.id === annee.filiere_id)
      return { ...annee, label: `${filiere?.code ? `${filiere.code} · ` : ''}${annee.label}` }
    })
  }, [annees, filieres, filters.filiere_id])

  const applyFilters = (next) => {
    updateParams({
      filiere_id: next.filiere_id,
      annee_id: next.annee_id,
      module_id: next.module_id,
      type: next.type,
      sort: next.sort !== 'recent' ? next.sort : '',
      page: '',
    })
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  const handleToggleFavorite = async (resource) => {
    if (!isAuthenticated) {
      infoToast(t('auth.loginRequiredText'))
      navigate('/connexion', { state: { from: location.pathname + location.search } })
      return
    }
    setFavoriteBusyId(resource.id)
    try {
      const result = await resourceService.toggleFavorite(resource.id)
      const favorited = result.favorited ?? !resource.is_favorited
      setData((current) => {
        if (!current?.data) return current
        return {
          ...current,
          data: current.data.map((item) =>
            item.id === resource.id ? { ...item, is_favorited: favorited } : item,
          ),
        }
      })
      successToast(favorited ? t('resources.addedToFavorites') : t('resources.removedFromFavorites'))
    } catch (err) {
      errorToast(getApiErrorMessage(err, t('common.error')))
    } finally {
      setFavoriteBusyId(null)
    }
  }

  const resources = data?.data || []
  const meta = data?.meta || {}
  const hasActiveFilters =
    filters.search || filters.filiere_id || filters.annee_id || filters.module_id || filters.type

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {t('resources.title')}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('resources.subtitle')}</p>
      </header>

      <div className="mt-8">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('resources.searchPlaceholder')}
          className="mx-auto max-w-2xl"
        />
      </div>

      <div className="mt-6">
        <FilterPanel
          filieres={filieres || []}
          annees={anneeOptions}
          modules={modules || []}
          filters={filters}
          onChange={applyFilters}
          onReset={resetFilters}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? t('common.loading') : t('common.resultsCount', { count: meta.total ?? resources.length })}
        </p>
      </div>

      <div className="mt-4">
        {loading ? (
          <ResourceGridSkeleton count={PER_PAGE - 6} />
        ) : error ? (
          <ErrorMessage message={t('errors.genericApiError')} onRetry={reload} />
        ) : resources.length === 0 ? (
          <EmptyState
            icon={FolderX}
            title={t('resources.emptyTitle')}
            description={t('resources.emptyDescription')}
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  {t('common.reset')}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                favoriteBusy={favoriteBusyId === resource.id}
              />
            ))}
          </div>
        )}
      </div>

      {meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          onChange={(page) => updateParams({ page: page === 1 ? '' : page })}
          className="mt-10"
        />
      )}
    </div>
  )
}
