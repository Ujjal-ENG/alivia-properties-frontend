"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/common/pagination"

interface ProjectsPaginationProps {
  page: number
  totalPages: number
}

export function ProjectsPagination({ page, totalPages }: ProjectsPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onChange={goTo}
      className="mt-8"
    />
  )
}
