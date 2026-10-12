export const RESOURCE_TYPES = [
  'cours',
  'tp',
  'exercice',
  'exercice_corrige',
  'examen',
  'examen_corrige',
  'resume',
  'projet',
  'tutoriel',
  'presentation',
  'fiche_revision',
]

export const TYPE_TONES = {
  cours: 'primary',
  tp: 'secondary',
  exercice: 'sky',
  exercice_corrige: 'green',
  examen: 'amber',
  examen_corrige: 'red',
  resume: 'slate',
  projet: 'secondary',
  tutoriel: 'sky',
  presentation: 'amber',
  fiche_revision: 'green',
}

export const FILE_META = {
  pdf: { label: 'PDF', className: 'text-red-500' },
  doc: { label: 'DOC', className: 'text-sky-500' },
  docx: { label: 'DOC', className: 'text-sky-500' },
  ppt: { label: 'PPT', className: 'text-orange-500' },
  pptx: { label: 'PPT', className: 'text-orange-500' },
  xls: { label: 'XLS', className: 'text-emerald-500' },
  xlsx: { label: 'XLS', className: 'text-emerald-500' },
  zip: { label: 'ZIP', className: 'text-amber-500' },
  rar: { label: 'ZIP', className: 'text-amber-500' },
  '7z': { label: 'ZIP', className: 'text-amber-500' },
  txt: { label: 'TXT', className: 'text-slate-500' },
  md: { label: 'MD', className: 'text-slate-500' },
}

export function getFileMeta(extension) {
  return FILE_META[(extension || '').toLowerCase()] || { label: 'FILE', className: 'text-slate-400' }
}

export const STATUS_TONES = {
  published: 'green',
  draft: 'slate',
  archived: 'amber',
  pending_review: 'amber',
  rejected: 'red',
}

export function resourceTypeLabel(type, t) {
  return t(`resourceTypes.${type}`, type)
}
