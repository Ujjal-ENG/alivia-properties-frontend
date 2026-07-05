"use client"

import { useEffect, useState, useCallback } from "react"
import { LS_COMPARE_LIST, MAX_COMPARE_ITEMS } from "@/lib/constants"

const COMPARE_EVENT = "alivia:compare-list"

function getList(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LS_COMPARE_LIST) ?? "[]") as string[]
  } catch {
    return []
  }
}

export function useCompareProperties() {
  // Start empty to match server render, then reconcile with localStorage after
  // mount — avoids a hydration mismatch when the list already has items.
  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    function syncFromStorage() {
      setList(getList())
    }

    syncFromStorage()
    window.addEventListener("storage", syncFromStorage)
    window.addEventListener(COMPARE_EVENT, syncFromStorage)
    return () => {
      window.removeEventListener("storage", syncFromStorage)
      window.removeEventListener(COMPARE_EVENT, syncFromStorage)
    }
  }, [])

  const sync = useCallback((next: string[]) => {
    localStorage.setItem(LS_COMPARE_LIST, JSON.stringify(next))
    window.dispatchEvent(new Event(COMPARE_EVENT))
    setList(next)
  }, [])

  const add = useCallback((id: string) => {
    const current = getList()
    if (current.includes(id) || current.length >= MAX_COMPARE_ITEMS) return
    sync([...current, id])
  }, [sync])

  const remove = useCallback((id: string) => {
    sync(getList().filter((i) => i !== id))
  }, [sync])

  const toggle = useCallback((id: string) => {
    const current = getList()
    if (current.includes(id)) {
      sync(current.filter((i) => i !== id))
    } else if (current.length < MAX_COMPARE_ITEMS) {
      sync([...current, id])
    }
  }, [sync])

  const clear = useCallback(() => sync([]), [sync])

  const isAdded = useCallback((id: string) => list.includes(id), [list])

  return { list, add, remove, toggle, clear, isAdded, isFull: list.length >= MAX_COMPARE_ITEMS }
}
