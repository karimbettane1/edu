export default function Input({ label, error, hint, id, icon: Icon, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={inputId}
          className={`input ${Icon ? 'ps-9' : ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''
          }`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
