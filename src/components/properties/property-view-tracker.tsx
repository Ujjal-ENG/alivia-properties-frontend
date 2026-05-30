"use client"

import { useEffect } from "react"
import { propertiesService } from "@/services/properties.service"

export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    const key = `alivia:viewed:${propertyId}`
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(key) === "1") return

    sessionStorage.setItem(key, "1")
    void propertiesService.incrementView(propertyId).catch(() => {
      sessionStorage.removeItem(key)
    })
  }, [propertyId])

  return null
}
