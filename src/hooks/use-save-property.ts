"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LS_SAVED_PROPERTIES } from "@/lib/constants"
import { propertiesService } from "@/services/properties.service"

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
  const { data: session } = useSession()
  // Start false to match server render, then reconcile with localStorage after
  // mount — avoids a hydration mismatch when the item is already saved.
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    function sync() {
      setSaved(getSaved().includes(propertyId))
    }

    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(SAVED_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(SAVED_EVENT, sync)
    }
  }, [propertyId])

  async function toggle() {
    const current = getSaved()
    const isSaved = current.includes(propertyId)
    const next = isSaved
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId]
    localStorage.setItem(LS_SAVED_PROPERTIES, JSON.stringify(next))
    window.dispatchEvent(new Event(SAVED_EVENT))
    setSaved(!isSaved)

    if (session?.user?.role === "buyer" && session.accessToken) {
      try {
        if (isSaved) {
          await propertiesService.unsave(propertyId, session.accessToken)
        } else {
          await propertiesService.save(propertyId, session.accessToken)
        }
      } catch {
        localStorage.setItem(LS_SAVED_PROPERTIES, JSON.stringify(current))
        window.dispatchEvent(new Event(SAVED_EVENT))
        setSaved(isSaved)
      }
    }
  }

  return { saved, toggle }
}
