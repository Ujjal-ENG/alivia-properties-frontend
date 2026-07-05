"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/** Returns a setter that writes a dashboard filter into the URL.
 *  `"all"` / empty clears the key. Changing a filter always resets `page`.
 *  Uses `replace` so filter clicks don't pile up in browser history. */
export function useUrlFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!value || value === "all") params.delete(key)
      else params.set(key, value)
      params.delete("page")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams],
  )
}
