"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import type { ProjectQueryParams } from "@/services/projects.service"

export function useProjectFilters(): {
  filters: ProjectQueryParams
  setFilter: (key: keyof ProjectQueryParams, value: string | number | boolean | undefined) => void
  setFilters: (patch: Partial<Record<keyof ProjectQueryParams, string | number | boolean | undefined>>) => void
  resetFilters: () => void
} {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: ProjectQueryParams = {
    search:   searchParams.get("search")   ?? undefined,
    status:   searchParams.get("status")   ?? undefined,
    minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    sort:     searchParams.get("sort")     ?? undefined,
    view:     searchParams.get("view")     ?? undefined,
    page:     searchParams.has("page")    ? Number(searchParams.get("page"))    : 1,
  }

  const setFilters = useCallback(
    (patch: Partial<Record<keyof ProjectQueryParams, string | number | boolean | undefined>>) => {
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
    (key: keyof ProjectQueryParams, value: string | number | boolean | undefined) => {
      setFilters({ [key]: value })
    },
    [setFilters],
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { filters, setFilter, setFilters, resetFilters }
}
