"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import type { PropertyQueryParams } from "@/types/property.types"

export function usePropertyFilters(): {
  filters: PropertyQueryParams
  setFilter: (key: keyof PropertyQueryParams, value: string | number | boolean | undefined) => void
  setFilters: (patch: Partial<Record<keyof PropertyQueryParams, string | number | boolean | undefined>>) => void
  resetFilters: () => void
} {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: PropertyQueryParams = {
    search:   searchParams.get("search")   ?? undefined,
    purpose:  (searchParams.get("purpose")  as PropertyQueryParams["purpose"])  ?? undefined,
    type:     (searchParams.get("type")     as PropertyQueryParams["type"])     ?? undefined,
    division: searchParams.get("division") ?? undefined,
    district: searchParams.get("district") ?? undefined,
    area:     searchParams.get("area")     ?? undefined,
    minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    bedrooms: searchParams.has("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
    verified: searchParams.get("verified") === "true" ? true : undefined,
    sortBy:   (searchParams.get("sortBy")   as PropertyQueryParams["sortBy"])   ?? undefined,
    page:     searchParams.has("page")    ? Number(searchParams.get("page"))    : 1,
  }

  const setFilters = useCallback(
    (patch: Partial<Record<keyof PropertyQueryParams, string | number | boolean | undefined>>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      if (!Object.prototype.hasOwnProperty.call(patch, "page")) {
        params.set("page", "1")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const setFilter = useCallback(
    (key: keyof PropertyQueryParams, value: string | number | boolean | undefined) => {
      setFilters({ [key]: value })
    },
    [setFilters],
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { filters, setFilter, setFilters, resetFilters }
}
