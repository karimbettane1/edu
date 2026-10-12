import { File, FileArchive, FileSpreadsheet, FileText, Presentation } from 'lucide-react'

const ICONS = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: Presentation,
  pptx: Presentation,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
}

const CLASSES = {
  pdf: 'bg-red-50 text-red-500 dark:bg-red-600/15 dark:text-red-400',
  doc: 'bg-sky-50 text-sky-500 dark:bg-sky-600/15 dark:text-sky-400',
  docx: 'bg-sky-50 text-sky-500 dark:bg-sky-600/15 dark:text-sky-400',
  ppt: 'bg-orange-50 text-orange-500 dark:bg-orange-600/15 dark:text-orange-400',
  pptx: 'bg-orange-50 text-orange-500 dark:bg-orange-600/15 dark:text-orange-400',
  xls: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-600/15 dark:text-emerald-400',
  xlsx: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-600/15 dark:text-emerald-400',
  zip: 'bg-amber-50 text-amber-500 dark:bg-amber-600/15 dark:text-amber-400',
  rar: 'bg-amber-50 text-amber-500 dark:bg-amber-600/15 dark:text-amber-400',
  '7z': 'bg-amber-50 text-amber-500 dark:bg-amber-600/15 dark:text-amber-400',
}

export default function FileTypeIcon({ extension, className = 'size-11' }) {
  const ext = (extension || '').toLowerCase()
  const Icon = ICONS[ext] || File
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl ${CLASSES[ext] || 'bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-400'} ${className}`}>
      <Icon className="size-5" />
    </div>
  )
}
