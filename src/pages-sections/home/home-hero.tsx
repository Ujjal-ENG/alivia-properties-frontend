"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Compass,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { siteConfig } from "@/config/site.config";

export type HeroProjectCard = {
  slug: string;
  name: string;
  location: string;
  price: string;
  status: string;
  cover: string | null;
};

type Tab = "marketplace" | "properties" | "projects" | "consultation";

const TABS: { id: Tab; label: string }[] = [
  { id: "marketplace", label: "Find Suppliers" },
  { id: "properties", label: "Buy or Rent" },
  { id: "projects", label: "Alivia Apartments" },
  { id: "consultation", label: "Get Advice" },
];

const STATS = [
  { value: `${siteConfig.stats.totalListings}+`, label: "Verified listings" },
  { value: "92%", label: "Client satisfaction" },
  { value: `${siteConfig.stats.yearsExperience}+`, label: "Years experience" },
  {
    value: `${(siteConfig.stats.happyFamilies / 1000).toFixed(1)}K+`,
    label: "Happy families",
  },
];

const JOURNEYS = [
  {
    title: "Source materials & services",
    body: "Search suppliers, products, contractors, and request one guided quote.",
    href: ROUTES.MARKETPLACE,
    icon: Store,
  },
  {
    title: "Find verified properties",
    body: "Homes, plots, rentals, and commercial listings with clearer next steps.",
    href: ROUTES.PROPERTIES,
    icon: Search,
  },
  {
    title: "Talk before you decide",
    body: "Get help choosing areas, budgets, suppliers, or project options.",
    href: ROUTES.CONSULTATION,
    icon: Compass,
  },
];

function getPlaceholder(tab: Tab) {
  if (tab === "marketplace") return "Search cement, tiles, paint, contractor…";
  if (tab === "consultation") return "Tell us what you need help with…";
  if (tab === "projects") return "Search Jolshiri, handover status, project…";
  return "Search by area, district, or keyword…";
}

export function HomeHero({ projects }: { projects: HeroProjectCard[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("marketplace");
  const [query, setQuery] = useState("");
  const featured = projects[0] ?? null;
  const secondProject = projects[1] ?? null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (tab === "consultation") {
      router.push(ROUTES.CONSULTATION);
      return;
    }
    const base =
      tab === "marketplace"
        ? ROUTES.MARKETPLACE
        : tab === "projects"
          ? ROUTES.PROJECTS
          : ROUTES.PROPERTIES;
    router.push(q ? `${base}?search=${encodeURIComponent(q)}` : base);
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white via-brand-50/35 to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--color-brand-200)_34%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--color-brand-200)_28%,transparent)_1px,transparent_1px)] bg-size-[88px_88px] opacity-35"
      />

      <div className="container-page relative py-12 lg:py-18">
        <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          {/* Left */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-sm backdrop-blur">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-brand-600" />
              Marketplace-first real estate help for Bangladesh
            </span>

            <h1 className="mt-5 max-w-4xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
              Find suppliers, properties, and{" "}
              <span className="text-gold-600">trusted next steps</span>{" "}
              in one place
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600">
              Alivia helps people search building materials, request supplier
              quotes, compare verified properties, and get expert guidance
              without guessing where to start.
            </p>

            {/* Search card */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 max-w-xl rounded-3xl border border-black/5 bg-white/95 p-2.5 shadow-(--shadow-elevated) backdrop-blur"
            >
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-50 p-1 sm:grid-cols-4">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={
                      "flex-1 rounded-xl px-3 py-2 text-[0.78rem] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 " +
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
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200">
                  <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
                  <input
                    name="home-search"
                    type="search"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={getPlaceholder(tab)}
                    className="h-11 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                    aria-label="Search"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 rounded-xl px-5"
                >
                  <Search aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {tab === "marketplace" ? "Find" : "Search"}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {JOURNEYS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group min-h-28 rounded-2xl border border-brand-100 bg-white/86 p-4 shadow-sm backdrop-blur transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-200 group-hover:bg-brand-700 group-hover:text-white">
                      <item.icon aria-hidden="true" className="size-4" />
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700 motion-reduce:transition-none motion-reduce:transform-none"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </Link>
              ))}
            </div>

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

          {/* Right: decision board */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-(--shadow-elevated)">
              <div className="relative aspect-16/11 min-h-88 overflow-hidden bg-ink-100 sm:min-h-0">
                {featured?.cover ? (
                  <Image
                    src={featured.cover}
                    alt={featured.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-100 to-gold-100 text-brand-300">
                    <Building2 aria-hidden="true" className="size-16" />
                  </div>
                )}
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-950/86 via-brand-950/16 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <span className="inline-flex rounded-full bg-gold-400 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-950">
                    Start here
                  </span>
                  <h2 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
                    Tell us what you need and compare trusted options
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-50/88">
                    <MapPin aria-hidden="true" className="size-4" />
                    Suppliers, properties, projects, and advice across Bangladesh
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={ROUTES.MARKETPLACE}
                    >
                      <Button size="sm" className="gap-1.5 rounded-full bg-white text-brand-950 hover:bg-brand-50">
                        Browse Marketplace <ArrowRight aria-hidden="true" className="size-3.5" />
                      </Button>
                    </Link>
                    <Link href={ROUTES.MARKETPLACE_REQUEST}>
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        Request Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-border/60 sm:grid-cols-3">
                {[
                  { label: "Marketplace", value: "Suppliers & RFQ" },
                  { label: "Properties", value: "Buy, rent, compare" },
                  { label: "Advice", value: "Human help" },
                ].map((item) => (
                  <div key={item.label} className="bg-white px-4 py-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-500">
                      {item.label}
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold text-brand-950">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {secondProject && (
              <Link
                href={
                  secondProject.slug
                    ? ROUTES.PROJECT_DETAIL(secondProject.slug)
                    : ROUTES.PROJECTS
                }
                className="group mt-4 flex gap-4 overflow-hidden rounded-3xl border border-black/5 bg-white p-3 shadow-(--shadow-card) transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-elevated) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-ink-100">
                  {secondProject.cover ? (
                    <Image
                      src={secondProject.cover}
                      alt={secondProject.name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-300">
                      <Building2 aria-hidden="true" className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand-700">
                    {secondProject.status}
                  </span>
                  <p className="mt-1.5 truncate font-heading text-base font-semibold text-ink-900 group-hover:text-brand-700">
                    {secondProject.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                    <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                    <span className="truncate">{secondProject.location}</span>
                  </p>
                  <p className="mt-1.5 font-heading text-lg font-bold text-gold-600">
                    {secondProject.price}
                  </p>
                </div>
              </Link>
            )}

            {/* Free consultation card */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-5 text-white shadow-(--shadow-elevated)">
              <Sparkles
                aria-hidden
                className="absolute -right-4 -top-4 h-24 w-24 text-gold-400/15"
              />
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
                Limited cost, no pressure
              </p>
              <h3 className="mt-1.5 font-heading text-xl font-semibold">
                Reliable expert consultation
              </h3>
              <p className="mt-1.5 text-sm text-brand-100">
                Talk to a property advisor about your next move — buying,
                renting, or investing.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link href={ROUTES.CONSULTATION}>
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-full bg-gold-400 text-brand-950 hover:bg-gold-300"
                  >
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                    Book a slot
                  </Button>
                </Link>
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                >
                  <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                  Call now
                </a>
              </div>
            </div>

            <Link
              href={ROUTES.MARKETPLACE}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Browse all marketplace categories <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
