const TONES = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-400',
  secondary: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-600/15 dark:text-secondary-400',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-600/15 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-600/15 dark:text-amber-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-600/15 dark:text-sky-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-600/15 dark:text-red-400',
}

export default function StatCard({ icon: Icon, label, value, tone = 'primary', hint }) {
  return (
    <div className="card card-hover flex items-center gap-4 p-5">
      {Icon && (
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${TONES[tone] || TONES.primary}`}>
          <Icon className="size-6" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
    </div>
  )
}
