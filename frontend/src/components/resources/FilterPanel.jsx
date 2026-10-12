import { useTranslation } from 'react-i18next'
import { FilterX } from 'lucide-react'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { RESOURCE_TYPES } from '../../utils/resourceMeta'

export default function FilterPanel({
  filieres = [],
  annees = [],
  modules = [],
  filters,
  onChange,
  onReset,
  className = '',
  showSort = true,
}) {
  const { t } = useTranslation()

  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value, page: 1 })

  const hasFilters =
    filters.filiere_id || filters.annee_id || filters.module_id || filters.type || filters.search

  return (
    <div className={`card p-4 sm:p-5 ${className}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select label={t('common.filiere')} value={filters.filiere_id || ''} onChange={set('filiere_id')}>
          <option value="">{t('resources.allFilieres')}</option>
          {filieres.map((filiere) => (
            <option key={filiere.id} value={filiere.id}>
              {filiere.name}
            </option>
          ))}
        </Select>

        <Select label={t('common.annee')} value={filters.annee_id || ''} onChange={set('annee_id')}>
          <option value="">{t('resources.allYears')}</option>
          {annees.map((annee) => (
            <option key={annee.id} value={annee.id}>
              {annee.label}
            </option>
          ))}
        </Select>

        <Select label={t('common.module')} value={filters.module_id || ''} onChange={set('module_id')}>
          <option value="">{t('resources.allModules')}</option>
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.code ? `${mod.code} · ${mod.name}` : mod.name}
            </option>
          ))}
        </Select>

        <Select label={t('common.type')} value={filters.type || ''} onChange={set('type')}>
          <option value="">{t('resources.allTypes')}</option>
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`resourceTypes.${type}`)}
            </option>
          ))}
        </Select>

        {showSort && (
          <Select label={t('common.sortBy')} value={filters.sort || 'recent'} onChange={set('sort')}>
            <option value="recent">{t('resources.sortRecent')}</option>
            <option value="popular">{t('resources.sortPopular')}</option>
            <option value="title">{t('resources.sortTitle')}</option>
          </Select>
        )}
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" icon={FilterX} onClick={onReset}>
            {t('common.reset')}
          </Button>
        </div>
      )}
    </div>
  )
}
