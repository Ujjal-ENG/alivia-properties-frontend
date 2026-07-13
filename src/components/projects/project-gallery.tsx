"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"
import { ProjectImageLightboxButton } from "@/components/projects/project-image-lightbox-button"
import { cn } from "@/lib/utils"
import { nextProjectImageIndex } from "./project-gallery.utils"

type ProjectGalleryProps = {
  images: string[]
  label: string
}

export function ProjectGallery({ images, label }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]
  const hasMultipleImages = images.length > 1

  if (!activeImage) return null

  function move(delta: number) {
    setActiveIndex((current) => nextProjectImageIndex(current, delta, images.length))
  }

  return (
    <section aria-label={`${label} image gallery`} className="mb-10">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-ink-100 shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:aspect-[16/8.5]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${label} image ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ink-950/55 to-transparent" />

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-ink-950/65 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
          <Images aria-hidden="true" className="size-4" />
          {activeIndex + 1} / {images.length}
        </div>

        <ProjectImageLightboxButton
          images={images}
          index={activeIndex}
          label={label}
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
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:var(--color-brand-300)_transparent]">
          {images.map((image, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show ${label} image ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-[4/3] w-28 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-ink-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-36",
                  isActive
                    ? "border-brand-600 shadow-[0_10px_30px_rgba(5,150,105,0.18)]"
                    : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-gold-400" />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
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
        "absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/90 text-brand-800 shadow-lg transition-all hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none",
        side === "left" ? "left-3 md:left-5" : "right-3 md:right-5",
      )}
    >
      {children}
    </button>
  )
}
