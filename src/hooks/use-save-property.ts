"use client"

import { useEffect, useState, useCallback } from "react"
import { LS_SAVED_PROPERTIES } from "@/lib/constants"

const SAVED_EVENT = "alivia:saved-properties"

function getSaved(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LS_SAVED_PROPERTIES) ?? "[]") as string[]
  } catch {
    return []
  }
}

export function useSaveProperty(propertyId: string) {
  // Lazy init — reads localStorage once on mount (SSR-safe)
  const [saved, setSaved] = useState(() => getSaved().includes(propertyId))

  useEffect(() => {
    function sync() {
      setSaved(getSaved().includes(propertyId))
    }

    window.addEventListener("storage", sync)
    window.addEventListener(SAVED_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(SAVED_EVENT, sync)
    }
  }, [propertyId])

  const toggle = useCallback(() => {
    const current = getSaved()
    const isSaved = current.includes(propertyId)
    const next = isSaved
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId]
    localStorage.setItem(LS_SAVED_PROPERTIES, JSON.stringify(next))
    window.dispatchEvent(new Event(SAVED_EVENT))
    setSaved(!isSaved)
  }, [propertyId])

  return { saved, toggle }
}
