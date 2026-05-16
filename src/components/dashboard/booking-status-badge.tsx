import { cn } from "@/lib/utils"
import { BOOKING_STATUS_STYLES } from "@/lib/constants"
import type { BookingStatus } from "@/types/booking.types"

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const style = BOOKING_STATUS_STYLES[status]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style?.classes ?? "bg-muted text-muted-foreground border-border")}>
      {style?.label ?? status}
    </span>
  )
}
