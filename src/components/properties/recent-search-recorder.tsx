"use client"

import { useEffect } from "react"
import { LS_RECENT_SEARCHES } from "@/lib/constants"

interface RecentSearchRecorderProps {
  value: string
}

export function RecentSearchRecorder({ value }: RecentSearchRecorderProps) {
  useEffect(() => {
    if (!value.trim()) return

    try {
      const current = JSON.parse(localStorage.getItem(LS_RECENT_SEARCHES) ?? "[]") as string[]
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 8)
      localStorage.setItem(LS_RECENT_SEARCHES, JSON.stringify(next))
    } catch {
      localStorage.setItem(LS_RECENT_SEARCHES, JSON.stringify([value]))
    }
  }, [value])

  return null
}
