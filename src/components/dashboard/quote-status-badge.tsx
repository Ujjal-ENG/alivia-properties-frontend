import type { QuoteStatus } from "@/types/quote.types"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<QuoteStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  RESPONDED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-ink-200 bg-ink-50 text-ink-600",
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pending",
  RESPONDED: "Responded",
  CLOSED: "Closed",
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
