import Image from "next/image"
import { Edit2, EyeOff, ImagePlus, Layers, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { detectMode } from "./types"

type Props = {
  category: MarketplaceCategory
  subcategories: MarketplaceCategory[]
  onEdit: (cat: MarketplaceCategory) => void
  onDelete: (cat: MarketplaceCategory) => void
  onAddChild: (cat: MarketplaceCategory) => void
  /** slug that should flash after a save */
  flashSlug?: string | null
}

/**
 * Eye-catching card for one Category tier. Designed to sit in a 2-up grid:
 * header strip (thumb + name + actions) over a grid of subcategory image tiles.
 */
export function CategoryCard({
  category,
  subcategories,
  onEdit,
  onDelete,
  onAddChild,
  flashSlug,
}: Props) {
  const thumb = category.image?.url ?? category.iconUrl ?? null
  const inactive = category.isActive === false
  const flash = flashSlug === category.slug

  return (
    <section
      className={cn(
        "group/card flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]",
        inactive && "opacity-70",
        flash && "ring-2 ring-brand-400 ring-offset-2",
      )}
    >
      {/* Header strip */}
      <header className="flex items-center gap-3 border-b border-border/60 bg-ink-50/60 px-4 py-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
          {thumb ? (
            <Image src={thumb} alt={category.name} fill sizes="44px" className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center text-ink-300">
              <ImagePlus className="size-4" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-sm font-bold text-ink-900">{category.name}</h3>
            {inactive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                <EyeOff className="size-2.5" /> Hidden
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="truncate rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-mono text-ink-500">
              {category.slug}
            </span>
            <span className="shrink-0 text-[10px] text-ink-400">#{category.order}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button" size="icon" variant="ghost"
            className="size-9 rounded-full text-ink-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={() => onEdit(category)} aria-label="Edit category"
          >
            <Edit2 className="size-4" />
          </Button>
          <Button
            type="button" size="icon" variant="ghost"
            className="size-9 rounded-full text-ink-600 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(category)} aria-label="Delete category"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      {/* Subcategory tiles */}
      <div className="flex flex-1 flex-col p-3">
        {category.description && (
          <p className="mb-2.5 line-clamp-2 px-1 text-xs text-ink-500">{category.description}</p>
        )}

        {subcategories.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-4 py-7 text-center">
            <Layers className="mb-1.5 size-5 text-ink-300" />
            <p className="text-xs font-medium text-ink-600">No subcategories yet</p>
            <p className="mt-0.5 text-[11px] text-ink-400">
              Subcategories carry the buyer-facing image tile + quote config.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {subcategories.map((sub) => (
              <SubcategoryTile key={sub.slug} sub={sub} onEdit={onEdit} onDelete={onDelete} flash={flashSlug === sub.slug} />
            ))}
          </div>
        )}

        {/* Add subcategory */}
        <Button
          type="button" variant="outline"
          onClick={() => onAddChild(category)}
          className="mt-3 h-9 w-full gap-1.5 rounded-xl border-dashed border-brand-200 text-brand-700 hover:bg-brand-50"
        >
          <Plus className="size-4" /> Add subcategory
        </Button>
      </div>
    </section>
  )
}

function SubcategoryTile({
  sub,
  onEdit,
  onDelete,
  flash,
}: {
  sub: MarketplaceCategory
  onEdit: (cat: MarketplaceCategory) => void
  onDelete: (cat: MarketplaceCategory) => void
  flash?: boolean
}) {
  const mode = detectMode(sub)
  const isSubcategory = mode === "subcategory"
  const thumb = sub.image?.url ?? sub.iconUrl ?? null
  const variantCount = sub.variants?.length ?? 0
  const fieldCount = sub.attributes?.length ?? 0
  const inactive = sub.isActive === false
  const configured = !isSubcategory || (variantCount > 0 && !!sub.image?.url)

  return (
    <div
      className={cn(
        "group/tile relative overflow-hidden rounded-xl border border-border/70 bg-white transition-shadow hover:shadow-[var(--shadow-card)]",
        inactive && "opacity-60",
        flash && "ring-2 ring-brand-400 ring-offset-2",
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-50">
        {thumb ? (
          <Image src={thumb} alt={sub.name} fill sizes="160px" className="object-cover" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-300">
            <ImagePlus className="size-5" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Hover actions */}
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/tile:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(sub)}
            aria-label={`Edit ${sub.name}`}
            className="flex size-7 items-center justify-center rounded-full bg-white/95 text-ink-700 shadow-sm hover:bg-brand-50 hover:text-brand-700"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(sub)}
            aria-label={`Delete ${sub.name}`}
            className="flex size-7 items-center justify-center rounded-full bg-white/95 text-ink-700 shadow-sm hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Status dot */}
        {isSubcategory && (
          <span
            className={cn(
              "absolute left-1.5 top-1.5 size-2 rounded-full ring-2 ring-white/80",
              configured ? "bg-emerald-400" : "bg-amber-400",
            )}
            title={configured ? "Quote-ready" : "Needs image / variants"}
          />
        )}

        {/* Name on gradient */}
        <p className="absolute inset-x-0 bottom-0 truncate px-2 py-1.5 text-[11px] font-semibold text-white">
          {sub.name}
        </p>
      </div>

      {/* Config chips */}
      {isSubcategory && (
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
          {variantCount > 0 ? (
            <>
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700">
                {variantCount} var
              </span>
              {fieldCount > 0 && (
                <span className="rounded-full border border-gold-200 bg-gold-50 px-1.5 py-0.5 text-[9px] font-medium text-gold-700">
                  {fieldCount} spec
                </span>
              )}
            </>
          ) : (
            <span className="text-[9px] italic text-ink-400">No variants</span>
          )}
        </div>
      )}
    </div>
  )
}
