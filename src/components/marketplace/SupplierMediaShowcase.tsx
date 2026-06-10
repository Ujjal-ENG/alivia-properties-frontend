"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  ImageIcon,
  Maximize2,
  Play,
  Video,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MediaLightbox } from "@/components/marketplace/MediaLightbox";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/marketplace.types";
import {
  buildSupplierMediaItems,
  isDirectSupplierVideo,
  supplierInitials,
  toSupplierVideoEmbedUrl,
} from "@/components/marketplace/supplier-media-utils";

export function SupplierMediaShowcase({
  supplier,
  className,
}: {
  supplier: Supplier;
  className?: string;
}) {
  const { items, images } = useMemo(
    () => buildSupplierMediaItems(supplier),
    [supplier],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeItem = items[activeIndex] ?? items[0] ?? null;
  const embedUrl = toSupplierVideoEmbedUrl(supplier.videoUrl);

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 shadow-[0_30px_90px_rgba(7,28,21,0.35)] backdrop-blur-md",
          className,
        )}
      >
        <div className="relative aspect-16/11 overflow-hidden bg-brand-100">
          {activeItem ? (
            activeItem.type === "image" ? (
              <button
                type="button"
                aria-label={`Open ${supplier.name} photo in full screen`}
                onClick={() => setLightboxIndex(images.indexOf(activeItem.src))}
                className="group/zoom absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                <Image
                  src={activeItem.src}
                  alt={`${supplier.name} media`}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/zoom:opacity-100 motion-reduce:transition-none">
                  <Maximize2 aria-hidden="true" className="size-3" />
                  Tap to zoom
                </span>
              </button>
            ) : activeItem.poster ? (
              <Image
                src={activeItem.poster}
                alt={`${supplier.name} video preview`}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-100 via-brand-200 to-gold-100">
                <span className="font-heading text-7xl font-semibold text-brand-700/35">
                  {supplierInitials(supplier.name)}
                </span>
              </div>
            )
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-100 via-brand-200 to-gold-100">
              <span className="font-heading text-7xl font-semibold text-brand-700/35">
                {supplierInitials(supplier.name)}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />

          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <Camera aria-hidden="true" className="size-3.5" />
              {images.length} Photo{images.length === 1 ? "" : "s"}
            </span>
            {supplier.videoUrl && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Video aria-hidden="true" className="size-3.5" />
                Video Ready
              </span>
            )}
          </div>

          {supplier.isVerified && (
            <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-brand-700">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Verified Supplier
            </span>
          )}

          {activeItem?.type === "video" && (
            <button
              type="button"
              aria-label={`Play ${supplier.name} video`}
              onClick={() => setVideoOpen(true)}
              className="absolute left-1/2 top-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-brand-700 shadow-xl transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            >
              <Play
                aria-hidden="true"
                className="size-7 translate-x-0.5 fill-current"
              />
            </button>
          )}
        </div>

        <div className="border-t border-white/12 bg-ink-950/70 p-4">
          {items.length > 1 ? (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {items.map((item, index) => {
                const thumbSrc = item.type === "image" ? item.src : item.poster;
                return (
                  <button
                    key={`${item.type}-${index}`}
                    type="button"
                    aria-label={
                      item.type === "video"
                        ? `Show ${supplier.name} video`
                        : `Show photo ${index + 1} for ${supplier.name}`
                    }
                    aria-pressed={index === activeIndex}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "relative aspect-4/3 overflow-hidden rounded-2xl border-2 bg-ink-900 transition-[border-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                      index === activeIndex
                        ? "border-gold-300"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt=""
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs font-semibold text-gold-200">
                        {supplierInitials(supplier.name)}
                      </span>
                    )}
                    {item.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/90 text-brand-700">
                          <Play
                            aria-hidden="true"
                            className="size-3 translate-x-px fill-current"
                          />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-brand-50/85">
              <ImageIcon aria-hidden="true" className="size-4 text-gold-300" />
              More product visuals appear here as gallery uploads are added from
              admin.
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <MediaLightbox
          images={images}
          index={lightboxIndex ?? 0}
          open={lightboxIndex !== null}
          onOpenChange={(v) =>
            setLightboxIndex(v ? (lightboxIndex ?? 0) : null)
          }
          onIndexChange={setLightboxIndex}
          label={supplier.name}
        />
      )}

      {supplier.videoUrl && (
        <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
          <DialogContent className="max-w-4xl bg-black p-2 sm:p-3">
            <DialogTitle className="sr-only">{supplier.name} Video</DialogTitle>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${supplier.name} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full rounded-2xl border-0 bg-black"
              />
            ) : isDirectSupplierVideo(supplier.videoUrl) ? (
              <video
                src={supplier.videoUrl}
                controls
                playsInline
                className="aspect-video w-full rounded-2xl bg-black"
              />
            ) : (
              <div className="rounded-2xl bg-white p-5 text-sm text-ink-700">
                <p className="font-medium text-ink-900">
                  Video preview unavailable.
                </p>
                <a
                  href={supplier.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-brand-700 underline underline-offset-4 hover:text-brand-800"
                >
                  Open video in a new tab
                </a>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
