"use client"

import Link from "next/link"
import { GitCompare, X } from "lucide-react"
import { useCompareProperties } from "@/hooks/use-compare-properties"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

export function CompareFloatBar() {
  const { list, clear } = useCompareProperties()

  if (list.length < 2) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center gap-4 rounded-[1.4rem] border border-white/10 bg-ink-900/96 px-5 py-3 text-white shadow-pop backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200 sm:bottom-6">
      <GitCompare className="h-4 w-4 text-brand-400 shrink-0" />
      <span className="text-sm font-medium">{list.length} properties selected</span>
      <Link href={ROUTES.COMPARE}>
        <Button size="sm" className="rounded-full bg-brand-600 text-xs text-white hover:bg-brand-700">Compare Now</Button>
      </Link>
      <button
        onClick={clear}
        className="ml-auto cursor-pointer rounded-full p-1 transition-colors hover:bg-white/10"
        aria-label="Clear compare list"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
