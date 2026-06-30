import type { Metadata } from "next"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  FileText,
  Home,
  MapPin,
  Maximize2,
  PackageSearch,
  PencilRuler,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
  Truck,
  WalletCards,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryGroupSection } from "@/components/marketplace/CategoryGroupSection"
import { CategoryGroupTabs } from "@/components/marketplace/CategoryGroupTabs"
import {
  MarketplaceSearchDeck,
  type MarketplaceSearchItem,
} from "@/components/marketplace/MarketplaceSearchDeck"
import { ROUTES } from "@/config/routes.config"
import { siteConfig } from "@/config/site.config"
import { marketplaceService, type MarketplaceCategory } from "@/services/marketplace.service"
import { projectsService } from "@/services/projects.service"
import { propertiesService } from "@/services/properties.service"
import type { Project } from "@/types/project.types"
import type { Property } from "@/types/property.types"
import { formatPrice, formatPriceRange, formatRent } from "@/utils/format-price"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Marketplace — Alivia Properties",
  description:
    "Find trusted suppliers, building materials, finishing products, utility items, and property services in one place.",
}

type MarketplacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams
  const initialSearch =
    typeof params?.search === "string"
      ? params.search
      : Array.isArray(params?.search)
        ? (params.search[0] ?? "")
        : ""

  const [projectsRes, propertiesRes, categoriesRes, suppliersRes, productsRes] =
    await Promise.allSettled([
      projectsService.list({ limit: 6 }),
      propertiesService.list({ limit: 6 }),
      marketplaceService.listCategories(),
      marketplaceService.listSuppliers({ limit: 1 }),
      marketplaceService.listProducts({ limit: 1 }),
    ])

  const projects: Project[] =
    projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  const properties: Property[] =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.data : []
  const categories: MarketplaceCategory[] =
    categoriesRes.status === "fulfilled" ? categoriesRes.value : []
  const projectTotal =
    projectsRes.status === "fulfilled" ? projectsRes.value.meta.total : projects.length
  const propertyTotal =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.meta.total : properties.length
  const supplierTotal =
    suppliersRes.status === "fulfilled" ? suppliersRes.value.meta.total : 0
  const productTotal =
    productsRes.status === "fulfilled" ? productsRes.value.meta.total : 0

  // Build the Department → Category view (subcategories live one level deeper,
  // surfaced on the category page + the quote wizard).
  const lvl = (c: MarketplaceCategory): "DEPARTMENT" | "CATEGORY" | "SUBCATEGORY" =>
    c.level ?? (c.parentSlug ? "SUBCATEGORY" : "DEPARTMENT")

  const groups = categories
    .filter((c) => lvl(c) === "DEPARTMENT")
    .sort((a, b) => a.order - b.order)

  const childrenByGroup = categories
    .filter((c) => lvl(c) === "CATEGORY")
    .reduce<Record<string, MarketplaceCategory[]>>((acc, c) => {
      const key = c.parentSlug!
      ;(acc[key] ??= []).push(c)
      return acc
    }, {})

  Object.values(childrenByGroup).forEach((arr) => arr.sort((a, b) => a.order - b.order))

  const totalCategories = categories.filter((c) => lvl(c) === "CATEGORY").length
  const parentNameBySlug = new Map(categories.map((c) => [c.slug, c.name]))
  const searchItems: MarketplaceSearchItem[] = categories
    .filter((c) => lvl(c) !== "DEPARTMENT")
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      level: lvl(c),
      parentName: c.parentSlug ? parentNameBySlug.get(c.parentSlug) : null,
    }))

  const tabs = groups.map((g) => ({
    slug: g.slug,
    name: g.name,
    count: childrenByGroup[g.slug]?.length ?? 0,
  }))
  const highIntentSlugs = [
    "cement",
    "steel",
    "tile",
    "doors",
    "sanitary",
    "lift",
    "electrician",
    "painter",
  ]
  const highIntentItems = highIntentSlugs
    .map((slug) => searchItems.find((item) => item.slug === slug))
    .filter((item): item is MarketplaceSearchItem => Boolean(item))

  return (
    <main id="main-content">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,color-mix(in_oklch,var(--color-brand-400)_24%,transparent)_0%,transparent_58%),radial-gradient(circle_at_82%_18%,color-mix(in_oklch,var(--color-gold-300)_20%,transparent)_0%,transparent_48%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
        />

        <div className="container-page relative py-12 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left copy */}
            <div className="min-w-0">
              <p className="text-eyebrow mb-3 text-gold-300">Alivia Marketplace</p>
              <h1 className="text-balance font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Shop projects, properties, materials, services, and quotes faster.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
                Start with Alivia developments, compare verified property
                listings, then source construction materials or services from the
                same marketplace desk.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={ROUTES.MARKETPLACE_REQUEST}>
                  <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                    <FileText aria-hidden="true" className="size-4" />
                    Request a Quote
                  </Button>
                </Link>
                <Link href="#marketplace-categories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Browse Categories
                  </Button>
                </Link>
                <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    Call Marketplace Desk
                  </Button>
                </a>
              </div>

              {searchItems.length > 0 && (
                <MarketplaceSearchDeck items={searchItems} initialQuery={initialSearch} />
              )}

              {highIntentItems.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="flex min-h-9 items-center rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                    Popular
                  </span>
                  {highIntentItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={ROUTES.MARKETPLACE_CATEGORY(item.slug)}
                      className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white transition-[background-color,border-color,color] duration-200 hover:border-gold-300/70 hover:bg-gold-300 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Trust pills */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-brand-100">
                {[
                  { icon: ShieldCheck, label: "Verified businesses" },
                  { icon: Timer, label: "~24h response time" },
                  { icon: Sparkles, label: "Guided RFQ support" },
                  { icon: Truck, label: "Dhaka-wide delivery" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right stats panel */}
            <MarketplaceCommandPanel
              projectTotal={projectTotal}
              propertyTotal={propertyTotal}
              departmentTotal={groups.length}
              categoryTotal={totalCategories}
              supplierTotal={supplierTotal}
              productTotal={productTotal}
            />
          </div>
        </div>
      </section>

      <MarketplaceRail
        id="marketplace-projects"
        eyebrow="Projects"
        title="First, choose a development"
        body="Start with Alivia projects and compare location, status, inventory, and starting price."
        href={ROUTES.PROJECTS}
        cta="View all projects"
      >
        {projects.length > 0 ? (
          projects.map((project) => <ProjectMarketCard key={project.id} project={project} />)
        ) : (
          <MarketplaceEmptyCard label="No projects loaded yet" href={ROUTES.PROJECTS} />
        )}
      </MarketplaceRail>

      <MarketplaceRail
        id="marketplace-properties"
        eyebrow="Properties"
        title="Then compare property listings"
        body="Browse sale and rent options with price, area, size, and bedroom signals kept visible."
        href={ROUTES.PROPERTIES}
        cta="Browse properties"
      >
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyMarketCard key={property.id} property={property} />
          ))
        ) : (
          <MarketplaceEmptyCard label="No properties loaded yet" href={ROUTES.PROPERTIES} />
        )}
      </MarketplaceRail>

      {/* ── Sticky category tab navigation ───────────────────────── */}
      {tabs.length > 0 && <CategoryGroupTabs tabs={tabs} />}

      {/* ── Category sections ────────────────────────────────────── */}
      <div id="marketplace-categories" className="container-page scroll-mt-28 space-y-12 py-10">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-ink-500">
            No categories yet. Run{" "}
            <code className="rounded bg-ink-100 px-1 font-mono text-xs">pnpm db:seed</code>{" "}
            in the backend to populate.
          </div>
        ) : (
          groups.map((group, i) => (
            <CategoryGroupSection
              key={group.slug}
              group={group}
              items={childrenByGroup[group.slug] ?? []}
              index={i}
            />
          ))
        )}
      </div>

      {/* ── Are you a service provider? ──────────────────────────── */}
      <section className="border-t border-border/60 bg-brand-950 text-white">
        <div className="container-page py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <p className="text-eyebrow mb-2 text-gold-300">For Businesses</p>
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                Suppliers and service providers can meet ready buyers here.
              </h2>
              <p className="mt-2 max-w-md text-sm text-brand-200">
                List your business, show the categories you serve, and receive
                quote-ready leads from people who already know what they need.
              </p>
            </div>
            <div className="mobile-liquid-glass-dark flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/8 p-4 sm:flex-row sm:items-center sm:justify-end">
              <Link href={ROUTES.MARKETPLACE_QUOTE}>
                <Button
                  size="lg"
                  className="w-full gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300 sm:w-auto"
                >
                  <Sparkles aria-hidden="true" className="size-4" />
                  Get Listed Free
                </Button>
              </Link>
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  Talk to us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="container-page section-y-sm">
        <div className="mobile-liquid-glass rounded-3xl border border-border/70 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-eyebrow mb-2">How it works</p>
          <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
            From request to quote in three steps
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Pick a category",
                desc: "Browse by build stage — raw materials, finishing, utilities, safety, or services.",
              },
              {
                step: "2",
                title: "Submit one form",
                desc: "Tell us what you need. We route it to verified Bangladeshi suppliers — no spam.",
              },
              {
                step: "3",
                title: "Compare & choose",
                desc: "Suppliers respond via phone or email, typically within 24 hours.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-border/60 bg-brand-50/60 p-5"
              >
                <div className="inline-flex size-9 items-center justify-center rounded-full bg-brand-700 font-heading text-base font-semibold text-white">
                  {item.step}
                </div>
                <p className="mt-3 font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-ink-600">{item.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex justify-center">
            <Link href={ROUTES.MARKETPLACE_QUOTE}>
              <Button size="lg" className="gap-2">
                <FileText aria-hidden="true" className="size-4" />
                Get a Quote Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function MarketplaceRail({
  id,
  eyebrow,
  title,
  body,
  href,
  cta,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  body: string
  href: string
  cta: string
  children: ReactNode
}) {
  return (
    <section id={id} className="container-page scroll-mt-28 py-8 first:pt-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-heading text-3xl font-bold text-brand-950">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

function ProjectMarketCard({ project }: { project: Project }) {
  const cover = project.coverImage ?? project.coverImageUrl ?? project.galleryImages[0]
  const price =
    project.priceFrom && project.priceTo
      ? formatPriceRange(project.priceFrom, project.priceTo)
      : project.priceFrom
        ? formatPrice(project.priceFrom, true)
        : "Price on request"

  return (
    <Link
      href={ROUTES.PROJECT_DETAIL(project.slug)}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-4/3 bg-ink-100">
        {cover ? (
          <Image
            src={cover}
            alt={project.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-50 text-brand-700">
            <Building2 aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <div className="min-w-0 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
          {titleCase(project.status)}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink-900">
          {project.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{project.location}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-600">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">
            {price}
          </span>
          {project.totalUnits ? (
            <span className="rounded-full bg-ink-50 px-2.5 py-1">
              {project.totalUnits} units
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function PropertyMarketCard({ property }: { property: Property }) {
  const cover = property.images[0]
  const price =
    property.purpose === "rent"
      ? formatRent(property.price)
      : formatPrice(property.price, true)

  return (
    <Link
      href={ROUTES.PROPERTY_DETAIL(property.slug)}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-4/3 bg-ink-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-50 text-brand-700">
            <Home aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <div className="min-w-0 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
          {property.purpose === "rent" ? "For rent" : "For sale"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink-900">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-brand-600" />
          <span className="truncate">
            {property.area}, {property.district}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-600">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">
            {price}
          </span>
          {property.bedrooms ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
              <BedDouble aria-hidden="true" className="size-3.5 text-brand-600" />
              {property.bedrooms}
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
              <Bath aria-hidden="true" className="size-3.5 text-brand-600" />
              {property.bathrooms}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
            <Maximize2 aria-hidden="true" className="size-3.5 text-brand-600" />
            {property.size} {property.sizeUnit}
          </span>
        </div>
      </div>
    </Link>
  )
}

function MarketplaceEmptyCard({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-ink-50 p-5 text-center text-sm font-semibold text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {label}
    </Link>
  )
}

function MarketplaceCommandPanel({
  projectTotal,
  propertyTotal,
  departmentTotal,
  categoryTotal,
  supplierTotal,
  productTotal,
}: {
  projectTotal: number
  propertyTotal: number
  departmentTotal: number
  categoryTotal: number
  supplierTotal: number
  productTotal: number
}) {
  const stats = [
    { label: "Projects", value: projectTotal },
    { label: "Properties", value: propertyTotal },
    { label: "Departments", value: departmentTotal },
    { label: "Categories", value: categoryTotal },
    { label: "Suppliers", value: supplierTotal },
    { label: "Products", value: productTotal },
  ]
  const steps = [
    { icon: PackageSearch, title: "Find item", body: "Search category or browse by build stage." },
    { icon: PencilRuler, title: "Share specs", body: "Quantity, area, timeline, and attachments." },
    { icon: WalletCards, title: "Compare quotes", body: "Choose by fit, speed, price, and trust." },
  ]

  return (
    <aside className="mobile-liquid-glass-dark rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold-300">
            Procurement board
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white">
            Know the next move before you call.
          </h2>
        </div>
        <span className="hidden rounded-full bg-gold-400 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-950 sm:inline-flex">
          Live catalogue
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/12 bg-brand-900/70 px-4 py-3">
            <dt className="text-[10px] font-semibold uppercase tracking-widest text-brand-200">
              {label}
            </dt>
            <dd className="mt-1 font-heading text-3xl font-bold text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 space-y-2">
        {steps.map(({ icon: Icon, title, body }) => (
          <div key={title} className="mobile-liquid-glass-dark flex gap-3 rounded-2xl border border-white/10 bg-white/8 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-800">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs leading-relaxed text-brand-100">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Link href={ROUTES.MARKETPLACE_REQUEST} className="mt-5 block">
        <Button className="w-full gap-2 rounded-2xl bg-white text-brand-950 hover:bg-brand-50">
          Start Guided Request
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </Link>
    </aside>
  )
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
