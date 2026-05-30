import Image from "next/image"
import { ChevronRight, Edit2, ImagePlus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/services/marketplace.service"

type Props = {
  cat: MarketplaceCategory
  depth: number
  onEdit: (cat: MarketplaceCategory) => void
  onDelete: (cat: MarketplaceCategory) => void
}

export function CategoryRow({ cat, depth, onEdit, onDelete }: Props) {
  const isGroup = depth === 0

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-shadow hover:shadow-sm",
      isGroup ? "border-brand-200 bg-brand-50/40" : "ml-6 border-border/60",
    )}>
      {/* Thumbnail */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-ink-50">
        {cat.iconUrl ? (
          <Image src={cat.iconUrl} alt={cat.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-300">
            <ImagePlus className="size-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {!isGroup && <ChevronRight className="size-3 shrink-0 text-ink-400" />}
          <p className="truncate text-sm font-semibold text-ink-900">{cat.name}</p>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-mono text-ink-500">
            {cat.slug}
          </span>
          {isGroup && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
              Group
            </span>
          )}
        </div>
        {cat.description && (
          <p className="mt-0.5 truncate text-xs text-ink-500">{cat.description}</p>
        )}
      </div>

      {/* Order badge */}
      <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-xs text-ink-500">
        #{cat.order}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button" size="icon" variant="ghost"
          className="size-8 rounded-full text-ink-600 hover:bg-brand-50 hover:text-brand-700"
          onClick={() => onEdit(cat)} aria-label="Edit"
        >
          <Edit2 className="size-3.5" />
        </Button>
        <Button
          type="button" size="icon" variant="ghost"
          className="size-8 rounded-full text-ink-600 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(cat)} aria-label="Delete"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
