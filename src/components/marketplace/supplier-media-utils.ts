import type { Supplier } from "@/types/marketplace.types"

export function supplierInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function formatCompactBd(value: number) {
  return new Intl.NumberFormat("en-BD", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

export function buildSupplierMedia(supplier: Pick<Supplier, "coverImage" | "gallery" | "products">) {
  const sources = [
    supplier.coverImage,
    ...(supplier.gallery ?? []),
    ...((supplier.products ?? []).map((product) => product.image) ?? []),
  ].filter(Boolean) as string[]

  return Array.from(new Set(sources))
}

/** A single slide in the supplier showcase — either a still photo or the video. */
export type SupplierMediaItem =
  | { type: "image"; src: string }
  | { type: "video"; url: string; poster: string | null }

/**
 * Ordered slide list for the showcase. The video (when present) is its OWN
 * slide — so the play overlay only appears while the video slide is active,
 * never on top of a plain photo. The video uses the first photo as its poster.
 */
export function buildSupplierMediaItems(
  supplier: Pick<Supplier, "coverImage" | "gallery" | "products" | "videoUrl">,
): { items: SupplierMediaItem[]; images: string[] } {
  const images = buildSupplierMedia(supplier)
  const items: SupplierMediaItem[] = images.map((src) => ({ type: "image", src }))

  if (supplier.videoUrl) {
    items.unshift({ type: "video", url: supplier.videoUrl, poster: images[0] ?? null })
  }

  return { items, images }
}

export function toSupplierVideoEmbedUrl(url?: string | null) {
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) return parsed.toString()
      const videoId = parsed.searchParams.get("v")
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "")
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop()
      if (videoId) return `https://player.vimeo.com/video/${videoId}`
    }
  } catch {
    return null
  }

  return null
}

export function isDirectSupplierVideo(url?: string | null) {
  if (!url) return false
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url) || url.includes("gtv-videos-bucket")
}
