import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

export function paginate<T>(items: T[], page: number, limit = DEFAULT_PAGE_SIZE): T[] {
  const start = (page - 1) * limit
  return items.slice(start, start + limit)
}

export function getTotalPages(total: number, limit = DEFAULT_PAGE_SIZE): number {
  return Math.ceil(total / limit)
}

export function getPaginationRange(currentPage: number, totalPages: number, delta = 2): (number | "…")[] {
  const range: (number | "…")[] = []
  const left = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  range.push(1)
  if (left > 2) range.push("…")
  for (let i = left; i <= right; i++) range.push(i)
  if (right < totalPages - 1) range.push("…")
  if (totalPages > 1) range.push(totalPages)

  return range
}
