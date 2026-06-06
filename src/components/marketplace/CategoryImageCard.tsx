import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ROUTES } from "@/config/routes.config"
import type { MarketplaceCategory } from "@/services/marketplace.service"

export function CategoryImageCard({ cat }: { cat: MarketplaceCategory }) {
  // Subcategories store their picture in `image.url`; departments/categories use
  // `iconUrl`. Prefer the richer `image` ref so admin edits to subcategory tiles
  // show up here, then fall back to `iconUrl`.
  const imageSrc = cat.image?.url ?? cat.iconUrl

  return (
    <Link
      href={ROUTES.MARKETPLACE_CATEGORY(cat.slug)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-ink-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-100 to-brand-200">
            <span className="font-heading text-4xl font-bold text-brand-600 opacity-40 select-none">
              {cat.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        {/* Arrow chip */}
        <div className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-3.5" />
        </div>
      </div>

      {/* Name */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className="line-clamp-1 text-sm font-semibold text-ink-900">{cat.name}</p>
        <ArrowUpRight className="size-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600" />
      </div>
    </Link>
  )
}
