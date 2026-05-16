import { cn } from "@/lib/utils"
import { PROPERTY_STATUS_STYLES } from "@/lib/constants"
import type { PropertyStatus } from "@/types/property.types"

export function ListingStatusBadge({ status }: { status: PropertyStatus }) {
  const style = PROPERTY_STATUS_STYLES[status]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style?.classes ?? "bg-muted text-muted-foreground border-border")}>
      {style?.label ?? status}
    </span>
  )
}
