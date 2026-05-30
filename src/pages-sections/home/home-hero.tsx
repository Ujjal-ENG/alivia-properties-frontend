"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { siteConfig } from "@/config/site.config"

export type HeroProjectCard = {
  slug: string
  name: string
  location: string
  price: string
  status: string
  cover: string | null
}

type Tab = "properties" | "projects" | "consultation"

const TABS: { id: Tab; label: string }[] = [
  { id: "properties", label: "Browse Properties" },
  { id: "projects", label: "Explore Projects" },
  { id: "consultation", label: "Book Consultation" },
]

const STATS = [
  { value: `${siteConfig.stats.totalListings}+`, label: "Verified listings" },
  { value: "92%", label: "Client satisfaction" },
  { value: `${siteConfig.stats.yearsExperience}+`, label: "Years experience" },
  {
    value: `${(siteConfig.stats.happyFamilies / 1000).toFixed(1)}K+`,
    label: "Happy families",
  },
]

export function HomeHero({ projects }: { projects: HeroProjectCard[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("properties")
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (tab === "consultation") {
      router.push(ROUTES.CONSULTATION)
      return
    }
    const base = tab === "projects" ? ROUTES.PROJECTS : ROUTES.PROPERTIES
    router.push(q ? `${base}?search=${encodeURIComponent(q)}` : base)
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gold-50/70 via-white to-brand-50/40">
      {/* soft decorative glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-gold-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl"
      />

      <div className="container-page relative py-14 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-sm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              Bangladesh&apos;s trust-first real estate platform
            </span>

            <h1 className="mt-5 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
              Discover homes, projects &amp;{" "}
              <span className="text-gold-600">addresses</span> across Bangladesh.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600">
              Premium projects, verified listings, and expert consultation — all in
              one trusted platform built for families, investors, and businesses.
            </p>

            {/* Search card */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 max-w-xl rounded-3xl border border-black/5 bg-white/95 p-2.5 shadow-(--shadow-elevated) backdrop-blur"
            >
              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-2xl bg-ink-50 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={
                      "flex-1 rounded-xl px-3 py-2 text-[0.78rem] font-semibold transition-colors " +
                      (tab === t.id
                        ? "bg-brand-700 text-white shadow-sm"
                        : "text-ink-600 hover:text-ink-900")
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="mt-2.5 flex items-center gap-2 px-1.5 pb-1">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      tab === "consultation"
                        ? "Tell us what you need help with…"
                        : "Search by area, district, or keyword…"
                    }
                    className="h-11 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                    aria-label="Search"
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2 rounded-xl px-5">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </form>

            {/* Stats */}
            <dl className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-heading text-2xl font-bold text-brand-800 sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ink-500">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: featured project cards */}
          <div className="min-w-0 space-y-4">
            {projects.slice(0, 2).map((p) => (
              <Link
                key={p.slug}
                href={p.slug ? ROUTES.PROJECT_DETAIL(p.slug) : ROUTES.PROJECTS}
                className="group flex gap-4 overflow-hidden rounded-3xl border border-black/5 bg-white p-3 shadow-(--shadow-card) transition hover:-translate-y-0.5 hover:shadow-(--shadow-elevated)"
              >
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-ink-100">
                  {p.cover ? (
                    <Image
                      src={p.cover}
                      alt={p.name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-300">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand-700">
                    {p.status}
                  </span>
                  <p className="mt-1.5 truncate font-heading text-base font-semibold text-ink-900 group-hover:text-brand-700">
                    {p.name}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </p>
                  <p className="mt-1.5 font-heading text-lg font-bold text-gold-600">
                    {p.price}
                  </p>
                </div>
              </Link>
            ))}

            {/* Free consultation card */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-5 text-white shadow-(--shadow-elevated)">
              <Sparkles
                aria-hidden
                className="absolute -right-4 -top-4 h-24 w-24 text-gold-400/15"
              />
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
                No cost, no pressure
              </p>
              <h3 className="mt-1.5 font-heading text-xl font-semibold">
                Free expert consultation
              </h3>
              <p className="mt-1.5 text-sm text-brand-100">
                Talk to a property advisor about your next move — buying, renting, or
                investing.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link href={ROUTES.CONSULTATION}>
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-full bg-gold-400 text-brand-950 hover:bg-gold-300"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Book a slot
                  </Button>
                </Link>
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call now
                </a>
              </div>
            </div>

            <Link
              href={ROUTES.PROJECTS}
              className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
            >
              View all flagship projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
