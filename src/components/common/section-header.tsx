import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  className?: string
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center", className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      {eyebrow && (
        <div className={cn(align === "center" && "flex justify-center", align === "right" && "flex justify-end")}>
          <p className="eyebrow-pill">{eyebrow}</p>
        </div>
      )}
      <h2
        className={cn(
          "text-h2 text-balance max-w-4xl",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-lead text-balance max-w-2xl",
            align === "center" && "mx-auto",
            align === "right" && "ml-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
