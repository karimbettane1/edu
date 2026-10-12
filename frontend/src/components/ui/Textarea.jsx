export default function Textarea({ label, error, hint, id, rows = 4, className = '', ...props }) {
  const textareaId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="label">
          {label}
          {props.required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`input resize-y ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
