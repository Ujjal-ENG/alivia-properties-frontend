"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

type PropertyImageLightboxButtonProps = {
  images: string[]
  index: number
  label: string
  className?: string
}

export function PropertyImageLightboxButton({
  images,
  index,
  label,
  className,
}: PropertyImageLightboxButtonProps) {
  const cleanImages = useMemo(() => images.filter(Boolean), [images])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(index)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const activeIndex = cleanImages[active] ? active : 0
  const activeImage = cleanImages[activeIndex]

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
      if (event.key === "ArrowRight") {
        setActive((current) => (current + 1) % cleanImages.length)
        setZoom(1)
        setRotation(0)
      }
      if (event.key === "ArrowLeft") {
        setActive((current) => (current - 1 + cleanImages.length) % cleanImages.length)
        setZoom(1)
        setRotation(0)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [cleanImages.length, open])

  if (!activeImage) return null

  function openViewer() {
    setActive(Math.min(index, cleanImages.length - 1))
    setZoom(1)
    setRotation(0)
    setOpen(true)
  }

  function move(delta: number) {
    setActive((current) => (current + delta + cleanImages.length) % cleanImages.length)
    setZoom(1)
    setRotation(0)
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label} image viewer`}
        onClick={openViewer}
        className={cn(
          "absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/90 text-brand-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          className,
        )}
      >
        <Plus aria-hidden="true" className="size-5" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${label} image viewer`}
          className="fixed inset-0 z-50 bg-ink-950/95 p-3 text-white sm:p-6"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold">
                {label} - {activeIndex + 1} / {cleanImages.length}
              </p>
              <button
                type="button"
                aria-label="Close image viewer"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
              <Image
                src={activeImage}
                alt={`${label} image ${activeIndex + 1}`}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              />

              {cleanImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => move(-1)}
                    className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => move(1)}
                    className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <IconButton label="Zoom out" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}>
                <ZoomOut aria-hidden="true" className="size-4" />
              </IconButton>
              <span className="min-w-16 rounded-full bg-white/10 px-3 py-2 text-center text-xs font-semibold">
                {Math.round(zoom * 100)}%
              </span>
              <IconButton label="Zoom in" onClick={() => setZoom((value) => Math.min(3, value + 0.25))}>
                <ZoomIn aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton label="Rotate left" onClick={() => setRotation((value) => value - 90)}>
                <RotateCcw aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton label="Rotate right" onClick={() => setRotation((value) => value + 90)}>
                <RotateCw aria-hidden="true" className="size-4" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
    >
      {children}
    </button>
  )
}
