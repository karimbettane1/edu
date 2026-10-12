const TONES = {
  primary:
    'bg-primary-50 text-primary-700 dark:bg-primary-600/15 dark:text-primary-300',
  secondary:
    'bg-secondary-50 text-secondary-700 dark:bg-secondary-600/15 dark:text-secondary-300',
  slate:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
  green:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/15 dark:text-emerald-300',
  amber:
    'bg-amber-50 text-amber-700 dark:bg-amber-600/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-600/15 dark:text-red-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-600/15 dark:text-sky-300',
}

export default function Badge({ tone = 'slate', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.slate} ${className}`}
    >
      {children}
    </span>
  )
}
