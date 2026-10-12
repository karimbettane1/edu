const INTL_LOCALES = { fr: 'fr-FR', ar: 'ar-MA', en: 'en-US' }

export function formatDate(value, lang = 'fr', options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(INTL_LOCALES[lang] || 'fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function timeAgo(value, lang = 'fr') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALES[lang] || 'fr-FR', { numeric: 'auto' })
  const thresholds = [
    { limit: 60, unit: 'second' },
    { limit: 3600, unit: 'minute', div: 60 },
    { limit: 86400, unit: 'hour', div: 3600 },
    { limit: 604800, unit: 'day', div: 86400 },
    { limit: 2629800, unit: 'week', div: 604800 },
    { limit: 31557600, unit: 'month', div: 2629800 },
  ]
  for (const t of thresholds) {
    if (Math.abs(seconds) < t.limit) {
      return rtf.format(Math.round(seconds / (t.div || 1)), t.unit)
    }
  }
  return rtf.format(Math.round(seconds / 31557600), 'year')
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return '—'
  const size = Number(bytes)
  if (size < 1024) return `${size} B`
  const units = ['Ko', 'Mo', 'Go']
  let value = size
  let unitIndex = -1
  do {
    value /= 1024
    unitIndex += 1
  } while (value >= 1024 && unitIndex < units.length - 1)
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatNumber(value, lang = 'fr') {
  return new Intl.NumberFormat(INTL_LOCALES[lang] || 'fr-FR').format(value ?? 0)
}

export function formatDuration(seconds) {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${String(s).padStart(2, '0')}s`
}
