import { ShieldCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  type: "verified" | "featured"
  className?: string
}

export function VerifiedBadge({ type, className }: VerifiedBadgeProps) {
  if (type === "featured") {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gold-100 text-gold-700 border border-gold-200", className)}>
        <Star className="h-3 w-3 fill-current" />
        Featured
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200", className)}>
      <ShieldCheck className="h-3 w-3" />
      Verified
    </span>
  )
}
