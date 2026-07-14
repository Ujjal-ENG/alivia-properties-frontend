"use client"

import { useState } from "react"
import { SlidersHorizontal, RotateCcw, Search, Star, ChevronDown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectFilters } from "@/hooks/use-project-filters"
import { PROJECT_VIEW_OPTIONS } from "@/lib/project-views"

const PRICE_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under ৳50L", min: undefined, max: 5_000_000 },
  { label: "৳50L–1Cr", min: 5_000_000, max: 10_000_000 },
  { label: "৳1Cr+", min: 10_000_000, max: undefined },
] as const

const SORT_OPTIONS = [
  { label: "Newest", value: "" },
  { label: "Price: low to high", value: "priceFrom:asc" },
  { label: "Price: high to low", value: "priceFrom:desc" },
  { label: "Name A–Z", value: "name:asc" },
] as const

export function ProjectFilterSidebar() {
  const { filters, setFilter, setFilters, resetFilters } = useProjectFilters()
  const activeCount = [
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.featured,
    filters.sort,
    filters.view,
  ].filter(Boolean).length

  const [open, setOpen] = useState(false)

  return (
    <aside className="surface-panel space-y-5 p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="project-filter-body"
          className="flex flex-1 items-center justify-between gap-2 text-left lg:pointer-events-none"
        >
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 py-0.5 text-[0.6rem] font-bold text-white lg:hidden">
                  {activeCount}
                </span>
              )}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
              {activeCount} active
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-ink-500 transition-transform duration-200 lg:hidden",
              open && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-brand-700 hover:underline"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div
        id="project-filter-body"
        className={cn("space-y-5 lg:block", open ? "block" : "hidden")}
      >
        <div>
          <label htmlFor="project-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Name or location
          </label>
          <div className="flex items-center gap-2 rounded-[1rem] border border-border bg-white px-3 py-2">
            <Search className="h-4 w-4 text-brand-600" />
            <input
              id="project-search"
              name="search"
              value={filters.search ?? ""}
              onChange={(e) => setFilter("search", e.target.value || undefined)}
              placeholder="Gulshan, Alivia Heights…"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-400"
              aria-label="Search apartments by name or location"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Starting price
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => {
              const active = filters.minPrice === preset.min && filters.maxPrice === preset.max
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFilters({ minPrice: preset.min, maxPrice: preset.max })}
                  className={cn(
                    "cursor-pointer rounded-[1rem] border px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-brand-700 bg-brand-50 text-brand-800"
                      : "border-border bg-white text-ink-600 hover:border-brand-200",
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="project-view" className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-brand-600" />
            View
          </label>
          <select
            id="project-view"
            name="view"
            value={filters.view ?? ""}
            onChange={(e) => setFilter("view", e.target.value || undefined)}
            className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            <option value="">Any view</option>
            {PROJECT_VIEW_OPTIONS.map((view) => (
              <option key={view} value={view}>{view}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="project-sort" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sort by
          </label>
          <select
            id="project-sort"
            name="sort"
            value={filters.sort ?? ""}
            onChange={(e) => setFilter("sort", e.target.value || undefined)}
            className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-border bg-white px-3 py-3">
          <input
            type="checkbox"
            name="featured"
            checked={!!filters.featured}
            onChange={(e) => setFilter("featured", e.target.checked || undefined)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-md border border-ink-300 bg-white transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:[&_span]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300"
          >
            <span className="size-2 rounded-sm bg-white opacity-0 transition-opacity" />
          </span>
          <Star className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium">Flagship apartments only</span>
        </label>
      </div>
    </aside>
  )
}
