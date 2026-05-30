"use client"

import Image from "next/image"
import { Compass, Maximize } from "lucide-react"

export function VirtualTour({
  posterImage,
  title = "Virtual 360° Tour",
}: {
  posterImage?: string
  title?: string
}) {
  return (
    <div className="surface-card relative overflow-hidden">
      <div className="relative h-56 sm:h-64">
        {posterImage ? (
          <Image
            src={posterImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-aurora" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-elevated transition-colors hover:bg-white"
          >
            <Compass className="h-4 w-4" />
            Launch 360° Tour
          </button>
        </div>
        <div className="absolute right-3 top-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink-700 transition-colors hover:bg-white"
            aria-label="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-ink-500">{title}</div>
    </div>
  )
}
