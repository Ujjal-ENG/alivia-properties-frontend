import type { PaginationMeta } from "@/types/api.types"

export function paginateArray<T>(
  items: T[],
  page = 1,
  limit = 12,
): { data: T[]; meta: PaginationMeta } {
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const safePage = Math.max(1, Math.min(page, totalPages || 1))
  const data = items.slice((safePage - 1) * limit, safePage * limit)
  return { data, meta: { page: safePage, limit, total, totalPages } }
}
