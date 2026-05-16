"use client"

import { GitCompare } from "lucide-react"
import { useCompareProperties } from "@/hooks/use-compare-properties"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/property.types"

interface CompareButtonProps {
  property: Property
  className?: string
}

export function CompareButton({ property, className }: CompareButtonProps) {
  const { toggle, isAdded, isFull } = useCompareProperties()
  const added = isAdded(property.id)
  const disabled = isFull && !added

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(property.id) }}
      disabled={disabled}
      aria-label={added ? "Remove from compare" : "Add to compare"}
      title={disabled ? "Compare list full (max 4)" : added ? "Remove from compare" : "Compare"}
      className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
        added ? "bg-brand-50 text-brand-600 hover:bg-brand-100" : "bg-muted text-muted-foreground hover:text-brand-600",
        disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
    >
      <GitCompare className="h-3.5 w-3.5" />
    </button>
  )
}
