"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LS_COMPARE_LIST } from "@/lib/constants"
import { ROUTES } from "@/config/routes.config"
import { formatPrice } from "@/utils/format-price"
import type { Property } from "@/types/property.types"

export function CompareView() {
  const [ids, setIds] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_COMPARE_LIST) ?? "[]")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIds(Array.isArray(stored) ? stored : [])
    } catch {
      // ignore
    }
  }, [])

  function removeFromCompare(id: string) {
    const next = ids.filter((i) => i !== id)
    setIds(next)
    setProperties((prev) => prev.filter((p) => p.id !== id))
    localStorage.setItem(LS_COMPARE_LIST, JSON.stringify(next))
  }

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-ink-700">No properties selected for comparison.</p>
        <p className="mt-1 text-xs text-ink-400">Use the compare button on any listing to add it here.</p>
        <Link href={ROUTES.PROPERTIES} className="mt-5">
          <Button variant="outline" className="rounded-full">Browse Listings</Button>
        </Link>
      </div>
    )
  }

  const ROWS: { label: string; key: keyof Property; format?: (v: unknown) => string }[] = [
    { label: "Price",    key: "price",    format: (v) => formatPrice(v as number, true) },
    { label: "Purpose",  key: "purpose",  format: (v) => String(v) },
    { label: "Type",     key: "type",     format: (v) => String(v) },
    { label: "Division", key: "division", format: (v) => String(v) },
    { label: "District", key: "district", format: (v) => String(v) },
    { label: "Area",     key: "area",     format: (v) => String(v) },
    { label: "Size",     key: "size",     format: (v) => `${v} sqft` },
    { label: "Bedrooms", key: "bedrooms", format: (v) => v == null ? "—" : String(v) },
    { label: "Bathrooms",key: "bathrooms",format: (v) => v == null ? "—" : String(v) },
  ]

  return (
    <div>
      <p className="mb-4 text-xs text-ink-500">{ids.length} properties selected · max 4</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left text-xs uppercase tracking-wide text-ink-500">Attribute</th>
              {ids.map((id) => (
                <th key={id} className="py-2 px-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[160px] text-xs font-semibold text-ink-800">
                      {properties.find((p) => p.id === id)?.title ?? id}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCompare(id)}
                      className="shrink-0 text-ink-400 hover:text-red-500"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-ink-50/50" : "bg-white"}>
                <td className="py-2 pr-4 text-xs font-medium text-ink-500">{row.label}</td>
                {ids.map((id) => {
                  const prop = properties.find((p) => p.id === id)
                  const raw = prop?.[row.key]
                  const display = prop == null ? "—" : raw == null ? "—" : row.format ? row.format(raw) : String(raw)
                  return (
                    <td key={id} className="py-2 px-3 text-xs text-ink-800">{display}</td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td className="py-3 pr-4" />
              {ids.map((id) => {
                const prop = properties.find((p) => p.id === id)
                return (
                  <td key={id} className="py-3 px-3">
                    {prop ? (
                      <Link href={ROUTES.PROPERTY_DETAIL(prop.slug)}>
                        <Button size="sm" variant="outline" className="rounded-full w-full">
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-400">Loading…</span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
