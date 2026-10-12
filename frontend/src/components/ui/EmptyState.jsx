import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-14 text-center ${className}`}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500">
        <Icon className="size-7" />
      </div>
      <h3 className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
