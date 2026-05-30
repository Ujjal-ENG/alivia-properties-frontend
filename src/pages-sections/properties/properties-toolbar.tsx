"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { LayoutGrid, List, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCallback } from "react"

const SORT_OPTIONS = [
  { value: "", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size-desc", label: "Largest first" },
]

export function PropertiesToolbar({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "grid"
  const sortBy = searchParams.get("sortBy") ?? ""

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-2.5">
      <p className="text-sm text-ink-500">
        <span className="font-semibold text-ink-900">{total.toLocaleString()}</span> listings found
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setParam("view", "grid")}
            aria-label="Grid view"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "grid" ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setParam("view", "list")}
            aria-label="List view"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list" ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800",
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink-700">
          <ArrowUpDown className="h-3.5 w-3.5 text-ink-400" />
          <select
            value={sortBy}
            onChange={(e) => setParam("sortBy", e.target.value)}
            className="cursor-pointer appearance-none bg-transparent text-xs text-ink-800 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
