import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ROUTES } from "@/config/routes.config"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { CategoryImageCard } from "./CategoryImageCard"

// Fixed accent colors per group index (cycles if > 5 groups)
const GROUP_ACCENTS = [
  { bar: "bg-gold-400", badge: "bg-gold-50 text-gold-700 border-gold-200" },
  { bar: "bg-brand-500", badge: "bg-brand-50 text-brand-700 border-brand-200" },
  { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { bar: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-200" },
  { bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200" },
]

type Props = {
  group: MarketplaceCategory
  children: MarketplaceCategory[]
  index: number
}

export function CategoryGroupSection({ group, children, index }: Props) {
  const accent = GROUP_ACCENTS[index % GROUP_ACCENTS.length]!

  return (
    <section
      id={`group-${group.slug}`}
      className="scroll-mt-16"
    >
      {/* Group header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Colored accent bar */}
          <div className={`h-8 w-1 rounded-full ${accent.bar}`} />
          <div>
            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${accent.badge} mb-1`}>
              {group.name}
            </span>
            {group.description && (
              <p className="text-xs text-ink-500 max-w-lg">{group.description}</p>
            )}
          </div>
        </div>
        {children.length > 0 && (
          <Link
            href={ROUTES.MARKETPLACE_CATEGORY(group.slug)}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Sub-category grid */}
      {children.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-ink-500">
          No items in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {children.map((cat) => (
            <CategoryImageCard key={cat.slug} cat={cat} />
          ))}
        </div>
      )}
    </section>
  )
}
