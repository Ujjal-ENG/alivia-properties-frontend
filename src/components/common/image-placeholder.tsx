import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  className?: string
  label?: string
}

export function ImagePlaceholder({ className, label }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2",
        className,
      )}
    >
      <ImageIcon className="h-8 w-8 opacity-40" />
      {label && <span className="text-xs">{label}</span>}
    </div>
  )
}
