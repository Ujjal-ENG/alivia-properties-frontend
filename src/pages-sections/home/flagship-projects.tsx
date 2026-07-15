"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building2, Eye, Flame, Layers, MapPin, MessageCircle, Sparkles, Star } from "lucide-react"

import { ROUTES } from "@/config/routes.config"
import { isRecent } from "@/utils/format-date"
import { formatPrice } from "@/utils/format-price"
import { pickLocationText } from "@/utils/project-location"
import type { Project } from "@/types/project.types"

export type FlagshipProject = {
  slug: string
  name: string
  location: string
  status: string
  price: string | null
  units: string | null
  cover: string | null
  availableUnits?: number | null
  totalUnits?: number | null
  isFeatured?: boolean
  createdAt?: string
}

/** Normalise a full `Project` into the flat shape the flagship card renders. */
export function toFlagshipProject(p: Project): FlagshipProject {
  const total = p.totalUnits ?? null
  const from = p.priceFrom ?? 0
  return {
    slug: p.slug ?? "",
    name: p.name ?? "Alivia Apartment",
    location: pickLocationText(
      [p.location, p.area, p.division],
      "Jolshiri Abashon, Rupganj",
    ),
    status: p.status ?? "ongoing",
    price: from > 0 ? formatPrice(from, true) : null,
    units: total ? `${total} units` : null,
    cover: p.coverImage ?? p.coverImageUrl ?? p.galleryImages?.[0] ?? null,
    availableUnits: p.availableUnits ?? null,
    totalUnits: total,
    isFeatured: p.isFeatured ?? p.featured ?? false,
    createdAt: p.createdAt,
  }
}

type Merch =
  | { kind: "low-stock"; label: string }
  | { kind: "featured"; label: string }
  | { kind: "new"; label: string }
  | null

function merchBadge(p: FlagshipProject): Merch {
  const { availableUnits: a, totalUnits: t } = p
  if (typeof a === "number" && typeof t === "number" && t > 0 && a > 0 && a / t <= 0.25) {
    return { kind: "low-stock", label: `Only ${a} unit${a === 1 ? "" : "s"} left` }
  }
  if (p.isFeatured) return { kind: "featured", label: "Featured" }
  if (isRecent(p.createdAt, 30)) return { kind: "new", label: "New launch" }
  return null
}

const MERCH_STYLE: Record<string, string> = {
  "low-stock": "bg-red-600 text-white",
  featured: "bg-gold-400 text-brand-950",
  new: "bg-brand-700 text-white",
}

const MERCH_ICON = { "low-stock": Flame, featured: Star, new: Sparkles }

type Filter = "all" | "ongoing" | "upcoming" | "completed"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
]

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-blue-50 text-blue-700",
  upcoming: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
}

/**
 * Circular icon button shown over the card image. It lives in an overlay
 * that is a sibling of the card link (not nested), so the markup stays
 * valid. Collapsed it is a 44px white circle; on hover / keyboard focus
 * the label slides open to its left, turning it into a pill. `aria-label`
 * keeps it usable while collapsed and on touch, where hover never fires.
 */
function ImageCta({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Eye
  label: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group/cta pointer-events-none flex h-11 items-center overflow-hidden rounded-full bg-white text-brand-700 shadow-[0_6px_20px_-4px_rgba(2,6,23,0.25)] outline-none transition-colors duration-200 hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-400 group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap pl-4 text-sm font-semibold text-ink-900 opacity-0 transition-all duration-300 group-hover/cta:max-w-40 group-hover/cta:opacity-100 group-focus-visible/cta:max-w-40 group-focus-visible/cta:opacity-100">
        {label}
      </span>
      <span className="grid size-11 shrink-0 place-items-center">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    </Link>
  )
}

/**
 * The flagship apartment card. Self-contained `<article>` so it can be dropped
 * into any grid — the landing "Find your next landmark" section and the
 * /apartments listing both render it, keeping the two pages visually identical.
 */
export function FlagshipProjectCard({ project: p }: { project: FlagshipProject }) {
  const merch = merchBadge(p)
  const MerchIcon = merch ? MERCH_ICON[merch.kind] : null

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-(--shadow-card) transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-(--shadow-elevated) motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={p.slug ? ROUTES.PROJECT_DETAIL(p.slug) : ROUTES.PROJECTS}
        className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-ink-100">
          {p.cover ? (
            <Image
              src={p.cover}
              alt={p.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-200">
              <Building2 aria-hidden="true" className="h-10 w-10" />
            </div>
          )}
          <div className="absolute left-0 top-0 flex flex-col items-start gap-2 p-3">
            <span
              className={
                "inline-flex rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider " +
                (STATUS_STYLE[p.status.toLowerCase()] ?? "bg-white/90 text-ink-700")
              }
            >
              {p.status}
            </span>
            {merch && MerchIcon && (
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider shadow-sm " +
                  MERCH_STYLE[merch.kind]
                }
              >
                <MerchIcon aria-hidden="true" className="h-3 w-3" />
                {merch.label}
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <p className="font-heading text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
            {p.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
            <span className="truncate">{p.location}</span>
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <div>
              {p.price ? (
                <>
                  <p className="text-[0.62rem] uppercase tracking-wider text-ink-400">
                    Starting from
                  </p>
                  <p className="font-heading text-base font-bold text-gold-600">
                    {p.price}
                  </p>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                  <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                  {p.units ?? "Details inside"}
                </span>
              )}
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      {/* Action buttons over the image: the icon circles fade in when the
          card is hovered/focused; each expands to its label on its own hover.
          Pure CSS (group-hover) — no state, so hovering never re-renders. */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        <ImageCta
          href={p.slug ? ROUTES.PROJECT_DETAIL(p.slug) : ROUTES.PROJECTS}
          icon={Eye}
          label="View Details"
        />
        <ImageCta
          href={p.slug ? `${ROUTES.PROJECT_DETAIL(p.slug)}#enquire` : ROUTES.CONTACT}
          icon={MessageCircle}
          label="Contact Seller"
        />
      </div>
    </article>
  )
}

export function FlagshipProjects({ projects }: { projects: FlagshipProject[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.status.toLowerCase() === filter),
    [projects, filter],
  )

  return (
    <section className="container-page section-y-sm">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow mb-1.5">Explore Alivia</p>
          <h2 className="text-balance font-heading text-3xl font-bold uppercase leading-tight tracking-tight text-brand-950 sm:text-4xl">
            Find your next <span className="text-gold-600">landmark.</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-600">
            Browse ongoing, upcoming, and completed Alivia projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-ink-100 bg-ink-50/80 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={
                  "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 " +
                  (filter === f.id
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-ink-600 hover:text-ink-900")
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <Link
            href={ROUTES.PROJECTS}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-brand-700 px-4 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            View all apartments
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-white px-5 py-8 text-center shadow-sm sm:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Building2 aria-hidden="true" className="size-5" />
          </div>
          <h3 className="mt-4 font-heading text-xl font-semibold text-brand-950">
            Apartments are being prepared
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
            We are updating this gallery with current Alivia developments. Open
            the full projects page to browse every available listing.
          </p>
          <Link
            href={ROUTES.PROJECTS}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            View projects
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug || p.name} className="min-w-0">
              <FlagshipProjectCard project={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
