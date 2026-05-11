import { cn } from "@/lib/utils"

interface LoadingCardProps {
  count?: number
  className?: string
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex gap-3 pt-1">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-8 bg-muted rounded mt-2" />
      </div>
    </div>
  )
}

export function LoadingCard({ count = 6, className }: LoadingCardProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
