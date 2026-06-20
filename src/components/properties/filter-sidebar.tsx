"use client"

import { useState } from "react"
import { SlidersHorizontal, RotateCcw, MapPin, BadgeCheck, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePropertyFilters } from "@/hooks/use-property-filters"
import { PROPERTY_TYPE_OPTIONS } from "@/data/property-types"
import { BD_DIVISIONS } from "@/data/locations.bd"
import type { PropertyType, PropertyPurpose } from "@/types/property.types"

const PRICE_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under ৳80L", min: undefined, max: 8_000_000 },
  { label: "৳80L–1.5Cr", min: 8_000_000, max: 15_000_000 },
  { label: "৳1.5Cr+", min: 15_000_000, max: undefined },
] as const

export function FilterSidebar() {
  const { filters, setFilter, setFilters, resetFilters } = usePropertyFilters()
  const divisions = BD_DIVISIONS.map((d) => d.name)
  const districts = BD_DIVISIONS
    .find((d) => d.name === filters.division)
    ?.districts.map((d) => d.name) ?? []
  const activeCount = [
    filters.search,
    filters.purpose,
    filters.type,
    filters.division,
    filters.district,
    filters.area,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.verified,
  ].filter(Boolean).length

  const [open, setOpen] = useState(false)

  return (
    <aside className="surface-panel space-y-5 p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-body"
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
        <button type="button" onClick={resetFilters} className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-brand-700 hover:underline">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div
        id="filter-body"
        className={cn("space-y-5 lg:block", open ? "block" : "hidden")}
      >
      <div className="rounded-[1.25rem] border border-brand-100 bg-brand-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Quick guidance</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Filters update live. Dummy data now. Query shape already aligned for later API swap.
        </p>
      </div>

      <div>
        <label htmlFor="property-area" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area or keyword</label>
        <div className="flex items-center gap-2 rounded-[1rem] border border-border bg-white px-3 py-2">
          <MapPin className="h-4 w-4 text-brand-600" />
          <input
            id="property-area"
            name="area"
            value={filters.area ?? ""}
            onChange={(e) => setFilter("area", e.target.value || undefined)}
            placeholder="Bashundhara R/A…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-400"
            aria-label="Filter by area"
          />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Purpose</label>
        <div className="flex gap-2">
          {(["sale", "rent"] as PropertyPurpose[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilter("purpose", filters.purpose === p ? undefined : p)}
              className={`flex-1 cursor-pointer rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                filters.purpose === p
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-border hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {p === "sale" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price range</label>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_PRESETS.map((preset) => {
            const active = filters.minPrice === preset.min && filters.maxPrice === preset.max
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFilters({ minPrice: preset.min, maxPrice: preset.max })}
                className={`cursor-pointer rounded-[1rem] border px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brand-700 bg-brand-50 text-brand-800"
                    : "border-border bg-white text-ink-600 hover:border-brand-200"
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Property type */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property type</label>
        <div className="space-y-1.5">
          {PROPERTY_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="group flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3">
              <input
                type="checkbox"
                name={`type-${opt.value}`}
                checked={filters.type === opt.value}
                onChange={(e) => setFilter("type", e.target.checked ? opt.value as PropertyType : undefined)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-md border border-ink-300 bg-white transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:[&_span]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300"
              >
                <span className="size-2 rounded-sm bg-white opacity-0 transition-opacity" />
              </span>
              <span className="text-sm transition-colors group-hover:text-brand-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Division */}
      <div>
        <label htmlFor="division" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Division</label>
        <select
          id="division"
          name="division"
          value={filters.division ?? ""}
          onChange={(e) => setFilters({ division: e.target.value || undefined, district: undefined })}
          className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          <option value="">All Divisions</option>
          {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* District */}
      {districts.length > 0 && (
        <div>
          <label htmlFor="district" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">District</label>
          <select
            id="district"
            name="district"
            value={filters.district ?? ""}
            onChange={(e) => setFilter("district", e.target.value || undefined)}
            className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Bedrooms */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bedrooms</label>
        <div className="flex gap-1.5">
          {["1", "2", "3", "4", "5+"].map((b) => {
            const parsed = Number(b.replace("+", ""))
            return (
              <button
                key={b}
                type="button"
                onClick={() => setFilter("bedrooms", filters.bedrooms === parsed ? undefined : parsed)}
                className={`flex-1 cursor-pointer rounded-full border py-1.5 text-xs font-medium transition-colors ${
                  filters.bedrooms === parsed
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-border hover:border-brand-300"
                }`}
              >
                {b}
              </button>
            )
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-border bg-white px-3 py-3">
        <input
          type="checkbox"
          name="verified"
          checked={!!filters.verified}
          onChange={(e) => setFilter("verified", e.target.checked || undefined)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center rounded-md border border-ink-300 bg-white transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:[&_span]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300"
        >
          <span className="size-2 rounded-sm bg-white opacity-0 transition-opacity" />
        </span>
        <BadgeCheck className="h-4 w-4 text-brand-600" />
        <span className="text-sm font-medium">Verified listings only</span>
      </label>
      </div>
    </aside>
  )
}
