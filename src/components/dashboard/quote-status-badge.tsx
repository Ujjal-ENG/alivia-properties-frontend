import type { QuoteStatus } from "@/types/quote.types"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<QuoteStatus, string> = {
  NEW: "border-amber-200 bg-amber-50 text-amber-700",
  ASSIGNED: "border-blue-200 bg-blue-50 text-blue-700",
  CONTACTED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  NEGOTIATING: "border-violet-200 bg-violet-50 text-violet-700",
  QUOTE_SENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  WON: "border-green-200 bg-green-50 text-green-700",
  LOST: "border-red-200 bg-red-50 text-red-700",
  CLOSED: "border-ink-200 bg-ink-50 text-ink-600",
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  NEGOTIATING: "Negotiating",
  QUOTE_SENT: "Quote sent",
  WON: "Won",
  LOST: "Lost",
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
