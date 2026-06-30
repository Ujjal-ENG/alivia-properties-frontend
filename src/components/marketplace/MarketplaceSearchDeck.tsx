"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { cn } from "@/lib/utils"

export type MarketplaceSearchItem = {
  slug: string
  name: string
  description?: string | null
  level?: "DEPARTMENT" | "CATEGORY" | "SUBCATEGORY"
  parentName?: string | null
}

const levelLabel = {
  DEPARTMENT: "Department",
  CATEGORY: "Category",
  SUBCATEGORY: "Quote-ready",
} as const

const preferredSuggestionSlugs = [
  "cement",
  "steel",
  "tile",
  "paint",
  "doors",
  "sanitary",
  "lift",
  "electrician",
  "plumber",
  "painter",
]

function cleanMeta(item: MarketplaceSearchItem) {
  const parent = item.parentName?.trim()

  if (parent && parent.toLowerCase() !== item.name.toLowerCase()) {
    return parent
  }

  return levelLabel[item.level ?? "CATEGORY"]
}

function getPreferredSuggestions(items: MarketplaceSearchItem[]) {
  const curated = preferredSuggestionSlugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is MarketplaceSearchItem => Boolean(item))

  if (curated.length >= 6) return curated

  const seen = new Set(curated.map((item) => item.slug))
  const fallback = items.filter(
    (item) => item.level === "CATEGORY" && !seen.has(item.slug),
  )

  return [...curated, ...fallback]
}

export function MarketplaceSearchDeck({
  items,
  initialQuery = "",
}: {
  items: MarketplaceSearchItem[]
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q
      ? items.filter((item) =>
          [item.name, item.description, item.parentName, item.level]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : getPreferredSuggestions(items)

    return pool.slice(0, 6)
  }, [items, query])

  const quickLinks = getPreferredSuggestions(items).slice(0, 5)

  return (
    <div className="mt-7 max-w-2xl rounded-[1.75rem] border border-black/5 bg-white/95 p-3 shadow-(--shadow-elevated) backdrop-blur">
      <label
        htmlFor="marketplace-category-search"
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700"
      >
        Find build item
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-600"
          />
          <input
            id="marketplace-category-search"
            name="marketplace-search"
            type="search"
            autoComplete="off"
            placeholder="Try tiles, steel, paint…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-2xl border border-ink-200 bg-white pl-10 pr-4 text-sm font-medium text-ink-900 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-400 focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-200"
          />
        </div>
        <Link href={ROUTES.MARKETPLACE_REQUEST} className="shrink-0">
          <Button className="h-12 w-full gap-2 rounded-2xl bg-gold-400 px-5 text-ink-900 hover:bg-gold-300 sm:w-auto">
            <FileText aria-hidden="true" className="size-4" />
            Start RFQ
          </Button>
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <Link
              key={item.slug}
              href={ROUTES.MARKETPLACE_CATEGORY(item.slug)}
              className="group min-w-0 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2.5 text-left transition-[background-color,border-color] duration-200 hover:border-brand-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-500">
                    {cleanMeta(item)}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                />
              </span>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-3 py-3 text-sm text-ink-600 sm:col-span-2">
            No category match yet. Try cement, tiles, paint, lift, or start a
            guided RFQ and Alivia desk will route it.
          </div>
        )}
      </div>

      {quickLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.slug}
              href={ROUTES.MARKETPLACE_CATEGORY(item.slug)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border border-brand-100 bg-white px-3 text-xs font-medium text-brand-800 transition-[background-color,color,border-color] duration-200",
                "hover:border-gold-300 hover:bg-gold-300 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
