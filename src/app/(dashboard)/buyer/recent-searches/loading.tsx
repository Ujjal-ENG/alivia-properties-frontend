import { SkDashboardHeader, Sk } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <div>
      <SkDashboardHeader />
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-card flex items-center gap-3 p-4">
              <Sk className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-16" />
              </div>
              <Sk className="h-8 w-14 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Sk key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
