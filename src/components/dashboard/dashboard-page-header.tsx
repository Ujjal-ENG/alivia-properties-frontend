import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
  icon?: LucideIcon
  className?: string
}

export function DashboardPageHeader({
  title,
  description,
  actions,
  eyebrow = "Workspace",
  icon: Icon,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "surface-panel relative mb-6 overflow-hidden p-5 sm:p-6",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-brand-aurora opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-200/30 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-700 to-brand-500 text-white shadow-elevated ring-4 ring-white/70">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-700">
              {eyebrow}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-ink-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
