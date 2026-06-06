import Image from "next/image"
import { Edit2, EyeOff, ImagePlus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { detectMode, MODE_LABEL } from "./types"

type Props = {
  cat: MarketplaceCategory
  depth: 0 | 1 | 2
  onEdit: (cat: MarketplaceCategory) => void
  onDelete: (cat: MarketplaceCategory) => void
  /** Present on department/category rows — adds a child node under this one. */
  onAddChild?: (cat: MarketplaceCategory) => void
}

const LEVEL_BADGE: Record<string, string> = {
  department: "bg-brand-100 text-brand-700",
  category: "bg-ink-100 text-ink-700",
  subcategory: "border border-gold-200 bg-gold-50 text-gold-700",
}

export function CategoryRow({ cat, depth, onEdit, onDelete, onAddChild }: Props) {
  const mode = detectMode(cat)
  const isSubcategory = mode === "subcategory"
  const thumb = cat.image?.url ?? cat.iconUrl ?? null
  const variantCount = cat.variants?.length ?? 0
  const fieldCount = cat.attributes?.length ?? 0
  const inactive = cat.isActive === false

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-shadow hover:shadow-sm",
        depth === 0 && "border-brand-200 bg-brand-50/40",
        depth === 1 && "ml-6 border-border/70",
        depth === 2 && "ml-12 border-border/60",
        inactive && "opacity-60",
      )}
    >
      {/* Thumbnail */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-ink-50">
        {thumb ? (
          <Image src={thumb} alt={cat.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-300">
            <ImagePlus className="size-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink-900">{cat.name}</p>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-mono text-ink-500">
            {cat.slug}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", LEVEL_BADGE[mode])}>
            {MODE_LABEL[mode]}
          </span>
          {inactive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
              <EyeOff className="size-2.5" /> Hidden
            </span>
          )}
        </div>
        {cat.description && (
          <p className="mt-0.5 truncate text-xs text-ink-500">{cat.description}</p>
        )}

        {/* Quote configuration summary (subcategories only) */}
        {isSubcategory && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {variantCount > 0 ? (
              <>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                  {variantCount} variant{variantCount === 1 ? "" : "s"}
                </span>
                {fieldCount > 0 && (
                  <span className="rounded-full border border-gold-200 bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-700">
                    {fieldCount} spec field{fieldCount === 1 ? "" : "s"}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] italic text-ink-400">
                No quote variants yet — click edit to configure
              </span>
            )}
            {!cat.image?.url && (
              <span className="text-[10px] italic text-amber-500">No image yet</span>
            )}
          </div>
        )}
      </div>

      {/* Order badge */}
      <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-xs text-ink-500">
        #{cat.order}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {onAddChild && (
          <Button
            type="button" size="icon" variant="ghost"
            className="size-8 rounded-full text-ink-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={() => onAddChild(cat)}
            aria-label={mode === "department" ? "Add category" : "Add subcategory"}
            title={mode === "department" ? "Add category" : "Add subcategory"}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
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
