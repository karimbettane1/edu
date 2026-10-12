export default function Select({ label, error, hint, id, className = '', children, ...props }) {
  const selectId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {props.required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`input cursor-pointer appearance-none bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat pe-9 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
