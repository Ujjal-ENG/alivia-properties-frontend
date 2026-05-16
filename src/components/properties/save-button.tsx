"use client"

import { Heart } from "lucide-react"
import { useSaveProperty } from "@/hooks/use-save-property"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  propertyId: string
  className?: string
}

export function SaveButton({ propertyId, className }: SaveButtonProps) {
  const { saved, toggle } = useSaveProperty(propertyId)

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle() }}
      aria-label={saved ? "Remove from saved" : "Save property"}
      className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
        saved ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-muted text-muted-foreground hover:text-red-400",
        className,
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
    </button>
  )
}
