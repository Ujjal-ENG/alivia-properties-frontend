"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"
import { cn } from "@/lib/utils"
import { SaveButton } from "@/components/properties/save-button"
import { CompareButton } from "@/components/properties/compare-button"
import { PropertyImageLightboxButton } from "@/components/properties/property-image-lightbox-button"
import type { Property } from "@/types/property.types"

type PropertyGalleryProps = {
  property: Property
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const images = property.images.filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]
  const hasMultipleImages = images.length > 1

  if (!activeImage) return null

  function move(delta: number) {
    setActiveIndex((current) => (current + delta + images.length) % images.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative h-100 overflow-hidden rounded-[1.5rem] bg-ink-100 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${property.title} image ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-950/80 via-ink-950/10 to-transparent" />

        {hasMultipleImages ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-ink-950/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Images aria-hidden="true" className="size-3.5" />
            {activeIndex + 1} / {images.length}
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div className="max-w-md text-white">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/70">
              {property.type}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {property.area}, {property.district}
            </p>
          </div>
          <div className="flex gap-2">
            <SaveButton
              propertyId={property.id}
              className="h-10 w-10 bg-white/92 text-ink-700 hover:bg-white"
            />
            <CompareButton
              property={property}
              className="h-10 w-10 bg-white/92 text-ink-700 hover:bg-white"
            />
          </div>
        </div>

        <PropertyImageLightboxButton
          images={images}
          index={activeIndex}
          label={property.title}
        />

        {hasMultipleImages ? (
          <>
            <GalleryArrow label="Previous image" side="left" onClick={() => move(-1)}>
              <ChevronLeft aria-hidden="true" className="size-5" />
            </GalleryArrow>
            <GalleryArrow label="Next image" side="right" onClick={() => move(1)}>
              <ChevronRight aria-hidden="true" className="size-5" />
            </GalleryArrow>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:var(--color-brand-300)_transparent]">
          {images.map((image, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show ${property.title} image ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-[4/3] w-20 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-ink-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-24",
                  isActive
                    ? "border-brand-600 shadow-[0_10px_24px_rgba(5,150,105,0.18)]"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image} alt="" fill sizes="96px" className="object-cover" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function GalleryArrow({
  label,
  side,
  onClick,
  children,
}: {
  label: string
  side: "left" | "right"
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/90 text-brand-800 shadow-lg transition-all hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {children}
    </button>
  )
}
