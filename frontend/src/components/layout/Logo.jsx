import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      <span className="gradient-brand flex size-9 items-center justify-center rounded-xl text-white shadow-sm shadow-primary-600/25">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="font-display hidden text-base font-bold tracking-tight whitespace-nowrap text-slate-900 min-[340px]:block sm:text-lg dark:text-slate-50">
          Digital <span className="gradient-text">Academy</span>
        </span>
      )}
    </Link>
  )
}
