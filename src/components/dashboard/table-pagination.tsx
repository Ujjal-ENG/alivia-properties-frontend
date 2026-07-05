"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/common/pagination"
import type { PaginationMeta } from "@/services/http-client"
import { cn } from "@/lib/utils"

/** URL-synced pager for dashboard tables. The `page` search param is the
 *  source of truth — clicking a page pushes a new URL and the server page
 *  refetches. Renders nothing for an empty list. */
export function TablePagination({ meta, className }: { meta?: PaginationMeta; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!meta || meta.total === 0) return null

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={cn("mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      <p className="text-xs text-ink-500">
        Showing {start}–{end} of {meta.total}
      </p>
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={goTo} />
    </div>
  )
}
