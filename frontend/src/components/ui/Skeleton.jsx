export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />
}

export function ResourceCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <Skeleton className="mb-2 h-5 w-4/5" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-5 h-4 w-2/3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function ResourceGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
