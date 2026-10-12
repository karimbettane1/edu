import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Download, Heart, Lock, User } from 'lucide-react'
import Badge from '../ui/Badge'
import FileTypeIcon from './FileTypeIcon'
import { STATUS_TONES, TYPE_TONES } from '../../utils/resourceMeta'
import { formatDate, formatNumber } from '../../utils/format'

export default function ResourceCard({
  resource,
  onToggleFavorite,
  favoriteBusy = false,
  showStatus = false,
  actions,
}) {
  const { t, i18n } = useTranslation()
  const typeTone = TYPE_TONES[resource.type] || 'slate'

  return (
    <article className="card card-hover group flex h-full min-w-0 flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileTypeIcon extension={resource.primary_file?.extension} />
          <div className="flex flex-col gap-1">
            <Badge tone={typeTone}>{t(`resourceTypes.${resource.type}`, resource.type_label || resource.type)}</Badge>
            {showStatus && (
              <Badge tone={STATUS_TONES[resource.status] || 'slate'}>
                {t(`common.${resource.status === 'pending_review' ? 'pendingReview' : resource.status}`, resource.status)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {resource.visibility === 'private' && (
            <span title={t('common.private')} className="rounded-lg p-1.5 text-slate-400">
              <Lock className="size-4" />
            </span>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              disabled={favoriteBusy}
              onClick={() => onToggleFavorite(resource)}
              aria-label={resource.is_favorited ? t('resources.removeFromFavorites') : t('resources.addToFavorites')}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                resource.is_favorited
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-600/15'
                  : 'text-slate-300 hover:bg-slate-100 hover:text-red-400 dark:text-slate-500 dark:hover:bg-slate-700/60'
              }`}
            >
              <Heart className={`size-4.5 ${resource.is_favorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <Link
        to={`/ressources/${resource.id}`}
        className="font-display line-clamp-2 text-base leading-snug font-semibold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-50 dark:group-hover:text-primary-400"
      >
        {resource.title}
      </Link>

      {resource.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{resource.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {resource.module && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
            {resource.module.code ? `${resource.module.code} · ` : ''}
            {resource.module.name}
          </span>
        )}
        {resource.filiere && (
          <span className="text-slate-400 dark:text-slate-500">
            {resource.filiere.code || resource.filiere.name}
            {resource.annee_formation ? ` — ${resource.annee_formation.label}` : ''}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
        <div className="flex min-w-0 items-center gap-3">
          {resource.author?.name && (
            <span className="flex min-w-0 items-center gap-1">
              <User className="size-3.5 shrink-0" />
              <span className="truncate">{resource.author.name}</span>
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(resource.published_at || resource.created_at, i18n.language)}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1" title={t('common.downloads')}>
          <Download className="size-3.5" />
          {formatNumber(resource.downloads_count ?? 0, i18n.language)}
        </span>
      </div>

      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  )
}
