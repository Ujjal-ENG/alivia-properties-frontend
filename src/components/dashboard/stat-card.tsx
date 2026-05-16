import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatTone = "brand" | "gold" | "info" | "success" | "warning" | "danger"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  tone?: StatTone
  className?: string
  hint?: string
}

const TONE_STYLES: Record<
  StatTone,
  { iconBg: string; iconText: string; ring: string; glow: string }
> = {
  brand: {
    iconBg: "bg-linear-to-br from-brand-500 to-brand-700",
    iconText: "text-white",
    ring: "ring-brand-100",
    glow: "from-brand-100/80",
  },
  gold: {
    iconBg: "bg-linear-to-br from-gold-300 to-gold-500",
    iconText: "text-ink-900",
    ring: "ring-gold-100",
    glow: "from-gold-100/70",
  },
  info: {
    iconBg: "bg-linear-to-br from-sky-400 to-sky-600",
    iconText: "text-white",
    ring: "ring-sky-100",
    glow: "from-sky-100/70",
  },
  success: {
    iconBg: "bg-linear-to-br from-emerald-400 to-emerald-600",
    iconText: "text-white",
    ring: "ring-emerald-100",
    glow: "from-emerald-100/70",
  },
  warning: {
    iconBg: "bg-linear-to-br from-amber-300 to-amber-500",
    iconText: "text-ink-900",
    ring: "ring-amber-100",
    glow: "from-amber-100/70",
  },
  danger: {
    iconBg: "bg-linear-to-br from-rose-400 to-rose-600",
    iconText: "text-white",
    ring: "ring-rose-100",
    glow: "from-rose-100/70",
  },
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  tone = "brand",
  hint,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const styles = TONE_STYLES[tone]

  return (
    <div
      className={cn(
        "group surface-card relative flex flex-col gap-4 overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-linear-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.glow,
        )}
        aria-hidden
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
          {label}
        </span>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl shadow-elevated ring-4",
            styles.iconBg,
            styles.iconText,
            styles.ring,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative flex items-end justify-between gap-2">
        <span className="text-3xl font-bold tracking-tight text-ink-900">
          {value}
        </span>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      {(hint || trendLabel) && (
        <p className="relative text-xs text-ink-500">{hint ?? trendLabel}</p>
      )}
    </div>
  )
}
