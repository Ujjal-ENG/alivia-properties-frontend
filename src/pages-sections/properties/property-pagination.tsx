"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCallback } from "react"

interface PropertyPaginationProps {
  page: number
  totalPages: number
}

export function PropertyPagination({ page, totalPages }: PropertyPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goTo = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(p))
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-500 hover:bg-ink-50 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => goTo(p)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
            p === page
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-border text-ink-700 hover:bg-ink-50",
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-500 hover:bg-ink-50 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
