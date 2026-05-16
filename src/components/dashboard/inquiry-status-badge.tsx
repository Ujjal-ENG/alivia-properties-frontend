import { cn } from "@/lib/utils"
import { INQUIRY_STATUS_STYLES } from "@/lib/constants"
import type { InquiryStatus } from "@/types/inquiry.types"

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const style = INQUIRY_STATUS_STYLES[status]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style?.classes ?? "bg-muted text-muted-foreground border-border")}>
      {style?.label ?? status}
    </span>
  )
}
