import { LoaderCircle } from 'lucide-react'

const VARIANTS = {
  primary:
    'gradient-brand text-white shadow-sm shadow-primary-600/25 hover:opacity-90 active:opacity-100',
  secondary: 'bg-secondary-600 text-white shadow-sm hover:bg-secondary-700',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60',
  ghost:
    'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
  white: 'bg-white text-primary-700 shadow-sm hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-white',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...(Component === 'button' ? { disabled: disabled || loading, type: props.type || 'button' } : {})}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="size-4" /> : null}
    </Component>
  )
}
