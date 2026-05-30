"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building2, Layers, MapPin } from "lucide-react"

import { ROUTES } from "@/config/routes.config"

export type FlagshipProject = {
  slug: string
  name: string
  location: string
  status: string
  price: string | null
  units: string | null
  cover: string | null
}

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
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow mb-2">Developer portfolio</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Flagship projects, curated in one gallery.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-600">
            Ongoing launches, upcoming landmarks, and completed communities — all in
            one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-ink-100 bg-ink-50/80 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors " +
                (filter === f.id
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-ink-600 hover:text-ink-900")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-white p-10 text-center text-sm text-ink-600">
          No projects in this category yet.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug || p.name}>
              <Link
                href={p.slug ? ROUTES.PROJECT_DETAIL(p.slug) : ROUTES.PROJECTS}
                className="group block overflow-hidden rounded-3xl border border-black/5 bg-white shadow-(--shadow-card) transition hover:-translate-y-1 hover:shadow-(--shadow-elevated)"
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
                      <Building2 className="h-10 w-10" />
                    </div>
                  )}
                  <span
                    className={
                      "absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider capitalize " +
                      (STATUS_STYLE[p.status.toLowerCase()] ?? "bg-white/90 text-ink-700")
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-heading text-lg font-semibold text-ink-900 group-hover:text-brand-700">
                    {p.name}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="h-3 w-3" /> {p.location}
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
                          <Layers className="h-3.5 w-3.5" />
                          {p.units ?? "Details inside"}
                        </span>
                      )}
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
