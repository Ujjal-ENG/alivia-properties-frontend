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
  items: MarketplaceCategory[]
  index: number
}

export function CategoryGroupSection({ group, items: children, index }: Props) {
  const accent = GROUP_ACCENTS[index % GROUP_ACCENTS.length]!
  const childCountLabel =
    children.length === 1 ? "1 category to shop" : `${children.length} categories to shop`

  return (
    <section
      id={`group-${group.slug}`}
      className="scroll-mt-16"
    >
      <div className="rounded-[1.75rem] border border-border/70 bg-white/90 p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {/* Colored accent bar */}
            <div aria-hidden="true" className={`mt-1 h-10 w-1 rounded-full ${accent.bar}`} />
            <div className="min-w-0">
              <span
                className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${accent.badge}`}
              >
                {group.name}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
                  Shop {group.name}
                </h2>
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-600">
                  {childCountLabel}
                </span>
              </div>
              {group.description && (
                <p className="mt-1 max-w-2xl text-sm text-ink-500">
                  {group.description}
                </p>
              )}
            </div>
          </div>
          {children.length > 0 && (
            <Link
              href={ROUTES.MARKETPLACE_CATEGORY(group.slug)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-700 transition-[background-color,border-color,color] duration-200 hover:border-brand-300 hover:bg-white hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              View all in {group.name}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>

        {children.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-ink-500">
            No items in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {children.map((cat) => (
              <CategoryImageCard key={cat.slug} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
