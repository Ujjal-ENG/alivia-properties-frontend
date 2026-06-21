"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Tab = {
  slug: string
  name: string
  count: number
}

export function CategoryGroupTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.slug ?? "")
  const railRef = useRef<HTMLDivElement>(null)
  const ticking = useRef(false)

  // Scroll-spy: mark the group whose section is nearest the top
  useEffect(() => {
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const offset = 120
        let current = tabs[0]?.slug ?? ""
        for (const tab of tabs) {
          const el = document.getElementById(`group-${tab.slug}`)
          if (el && el.getBoundingClientRect().top <= offset) current = tab.slug
        }
        setActive(current)
        ticking.current = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [tabs])

  // When active tab changes, scroll the tab rail so it's visible
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const btn = rail.querySelector<HTMLButtonElement>(`[data-slug="${active}"]`)
    if (btn) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const railRect = rail.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      const scrollLeft = rail.scrollLeft + (btnRect.left - railRect.left) - railRect.width / 2 + btnRect.width / 2
      rail.scrollTo({ left: scrollLeft, behavior: reducedMotion ? "auto" : "smooth" })
    }
  }, [active])

  function scrollTo(slug: string) {
    const el = document.getElementById(`group-${slug}`)
    if (!el) return
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const top = el.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" })
    setActive(slug)
  }

  return (
    <nav
      aria-label="Marketplace departments"
      className="mobile-liquid-glass-nav sticky top-0 z-30 border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-sm"
    >
      <div className="container-page">
        <div
          ref={railRef}
          className="flex gap-1 overflow-x-auto py-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              data-slug={tab.slug}
              type="button"
              aria-current={active === tab.slug ? "true" : undefined}
              onClick={() => scrollTo(tab.slug)}
              className={cn(
                "flex min-h-11 shrink-0 touch-manipulation items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                active === tab.slug
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-ink-600 hover:bg-brand-50 hover:text-brand-700",
              )}
            >
              {tab.name}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active === tab.slug ? "bg-white/25 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        {/* Gold progress stripe under active tab */}
        <div className="relative -mt-px h-0.5">
          {tabs.map((tab) => (
            <div
              key={tab.slug}
              className={cn(
                "absolute inset-0 origin-left transition-transform duration-300 motion-reduce:transition-none",
                active === tab.slug ? "scale-x-100 bg-gold-400" : "scale-x-0",
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
