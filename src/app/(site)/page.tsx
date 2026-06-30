import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  PackageSearch,
  Search,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { siteConfig } from "@/config/site.config"
import { blogService } from "@/services/blog.service"
import {
  marketplaceService,
  type MarketplaceCategory,
} from "@/services/marketplace.service"
import { projectsService } from "@/services/projects.service"
import { propertiesService } from "@/services/properties.service"
import type { Project } from "@/types/project.types"
import type { Property } from "@/types/property.types"
import { formatPrice, formatPriceRange, formatRent } from "@/utils/format-price"

export const dynamic = "force-dynamic"

const marketplaceLinks = [
  {
    icon: Building2,
    label: "Projects",
    body: "Shop Alivia developments by location, status, and starting price.",
    href: `${ROUTES.MARKETPLACE}#marketplace-projects`,
  },
  {
    icon: Home,
    label: "Properties",
    body: "Browse sale and rent listings with local price and area details.",
    href: `${ROUTES.MARKETPLACE}#marketplace-properties`,
  },
  {
    icon: PackageSearch,
    label: "Materials",
    body: "Find cement, steel, tiles, doors, sanitary, lift, and finishing items.",
    href: `${ROUTES.MARKETPLACE}#marketplace-categories`,
  },
  {
    icon: Wrench,
    label: "Services",
    body: "Request electricians, plumbers, painters, contractors, and technicians.",
    href: ROUTES.MARKETPLACE_REQUEST,
  },
]

export default async function HomePage() {
  const [
    projectsRes,
    propertiesRes,
    categoriesRes,
    suppliersRes,
    productsRes,
    blogRes,
  ] = await Promise.allSettled([
    projectsService.list({ limit: 4 }),
    propertiesService.list({ limit: 4 }),
    marketplaceService.listCategories(),
    marketplaceService.listSuppliers({ limit: 1 }),
    marketplaceService.listProducts({ limit: 1 }),
    blogService.list({ limit: 2 }),
  ])

  const projects = projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  const properties =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.data : []
  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : []
  const supplierTotal =
    suppliersRes.status === "fulfilled" ? suppliersRes.value.meta.total : 0
  const productTotal =
    productsRes.status === "fulfilled" ? productsRes.value.meta.total : 0
  const posts = blogRes.status === "fulfilled" ? blogRes.value.data : []
  const backendDown =
    projectsRes.status === "rejected" &&
    propertiesRes.status === "rejected" &&
    categoriesRes.status === "rejected"

  const departmentTotal = categories.filter((c) => categoryLevel(c) === "DEPARTMENT").length
  const categoryTotal = categories.filter((c) => categoryLevel(c) === "CATEGORY").length
  const previewCategories = categories
    .filter((c) => categoryLevel(c) !== "DEPARTMENT")
    .slice(0, 8)

  return (
    <main className="bg-white">
      {backendDown && (
        <div className="border-b border-amber-200 bg-amber-50/80">
          <div className="container-page py-3 text-xs text-amber-900">
            <span className="font-medium">Heads up:</span> the API at{" "}
            <span className="font-mono">
              {process.env.NEXT_PUBLIC_API_BASE_URL ??
                "http://localhost:3001/api/v1"}
            </span>{" "}
            is not responding. Start the NestJS backend to populate live marketplace
            content.
          </div>
        </div>
      )}

      <section
        id="marketplace-first-home"
        className="relative overflow-hidden bg-brand-950 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_oklch,var(--color-gold-300)_24%,transparent)_0%,transparent_42%),radial-gradient(circle_at_82%_30%,color-mix(in_oklch,var(--color-brand-300)_22%,transparent)_0%,transparent_48%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px]"
        />

        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="text-eyebrow mb-3 text-gold-300">Alivia Marketplace</p>
              <h1 className="text-balance font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Shop projects, properties, materials, and services from one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
                Start with Alivia projects, compare verified listings, then source
                construction materials or service quotes through the same marketplace.
              </p>

              <div className="liquid-glass-dark mt-7 max-w-2xl rounded-[1.75rem] border border-white/15 p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={ROUTES.MARKETPLACE}
                    className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl bg-white px-4 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <Search aria-hidden="true" className="size-4 text-brand-700" />
                    Search the marketplace
                  </Link>
                  <Link href={ROUTES.MARKETPLACE_REQUEST} className="shrink-0">
                    <Button className="h-12 w-full gap-2 rounded-2xl bg-gold-400 px-5 text-ink-900 hover:bg-gold-300 sm:w-auto">
                      <FileText aria-hidden="true" className="size-4" />
                      Request Quote
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Projects", "Properties", "Materials", "Services"].map((item) => (
                  <Link
                    key={item}
                    href={
                      item === "Projects"
                        ? `${ROUTES.MARKETPLACE}#marketplace-projects`
                        : item === "Properties"
                          ? `${ROUTES.MARKETPLACE}#marketplace-properties`
                          : item === "Services"
                            ? ROUTES.MARKETPLACE_REQUEST
                            : `${ROUTES.MARKETPLACE}#marketplace-categories`
                    }
                    className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white transition-colors duration-200 hover:border-gold-300/70 hover:bg-gold-300 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <MarketplaceStatsPanel
              projects={projects.length}
              properties={properties.length}
              departments={departmentTotal}
              categories={categoryTotal}
              suppliers={supplierTotal}
              products={productTotal}
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-white">
        <div className="container-page py-7">
          <div className="grid gap-3 md:grid-cols-4">
            {marketplaceLinks.map(({ icon: Icon, label, body, href }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-2xl border border-border/70 bg-ink-50/70 p-4 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-700 text-white">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <h2 className="mt-4 font-sans text-base font-bold text-ink-900">
                  {label}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-900">
                  Browse
                  <ArrowRight aria-hidden="true" className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeRail
        eyebrow="Featured projects"
        title="Start with Alivia developments"
        href={ROUTES.PROJECTS}
        cta="View all projects"
      >
        {projects.length > 0 ? (
          projects.map((project) => <ProjectTile key={project.id} project={project} />)
        ) : (
          <EmptyTile label="No projects loaded yet" href={ROUTES.PROJECTS} />
        )}
      </HomeRail>

      <HomeRail
        eyebrow="Verified properties"
        title="Then compare listings"
        href={ROUTES.PROPERTIES}
        cta="Browse properties"
      >
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyTile key={property.id} property={property} />
          ))
        ) : (
          <EmptyTile label="No properties loaded yet" href={ROUTES.PROPERTIES} />
        )}
      </HomeRail>

      <section className="bg-ink-50">
        <div className="container-page section-y-sm">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-eyebrow mb-2">Construction marketplace</p>
              <h2 className="text-balance font-heading text-3xl font-bold text-brand-950">
                Source materials and services after you choose the asset.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Browse quote-ready departments or send one request and let Alivia
                route it to the right suppliers and service providers.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`${ROUTES.MARKETPLACE}#marketplace-categories`}>
                  <Button className="gap-2">
                    <PackageSearch aria-hidden="true" className="size-4" />
                    Browse categories
                  </Button>
                </Link>
                <Link href={ROUTES.MARKETPLACE_REQUEST}>
                  <Button variant="outline" className="gap-2">
                    <ClipboardList aria-hidden="true" className="size-4" />
                    Start RFQ
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {previewCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={ROUTES.MARKETPLACE_CATEGORY(category.slug)}
                  className="rounded-2xl border border-border/70 bg-white p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <p className="line-clamp-1 text-sm font-bold text-ink-900">
                    {category.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">
                    {category.description ?? "Quote-ready marketplace category"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-brand-950 text-white">
        <div className="container-page py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-eyebrow mb-2 text-gold-300">Buyer confidence</p>
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                One marketplace, three buying jobs.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-100">
                Projects, properties, and construction sourcing stay connected so
                buyers can move from discovery to quote without jumping between
                disconnected experiences.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: BadgeCheck, label: "Verified supply" },
                { icon: ShieldCheck, label: "Local guidance" },
                { icon: Store, label: "Seller access" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold"
                >
                  <Icon aria-hidden="true" className="mb-3 size-5 text-gold-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {posts.length > 0 && (
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={ROUTES.BLOG_POST(post.slug)}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 transition-colors duration-200 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
                    {post.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-sans text-base font-bold text-white">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-100">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.MARKETPLACE}>
              <Button
                size="lg"
                className="w-full gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300 sm:w-auto"
              >
                Open Marketplace
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </Link>
            <a href={`tel:${siteConfig.contact.phoneRaw}`}>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                Call Marketplace Desk
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function MarketplaceStatsPanel({
  projects,
  properties,
  departments,
  categories,
  suppliers,
  products,
}: {
  projects: number
  properties: number
  departments: number
  categories: number
  suppliers: number
  products: number
}) {
  const stats = [
    { label: "Projects", value: projects },
    { label: "Properties", value: properties },
    { label: "Departments", value: departments },
    { label: "Categories", value: categories },
    { label: "Suppliers", value: suppliers },
    { label: "Products", value: products },
  ]

  return (
    <aside className="liquid-glass-dark rounded-[2rem] border border-white/15 bg-white/10 p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold-300">
        Marketplace board
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-white">
        Browse the asset first, source the build next.
      </h2>
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
    </aside>
  )
}

function HomeRail({
  eyebrow,
  title,
  href,
  cta,
  children,
}: {
  eyebrow: string
  title: string
  href: string
  cta: string
  children: ReactNode
}) {
  return (
    <section className="container-page section-y-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-heading text-3xl font-bold text-brand-950">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  )
}

function ProjectTile({ project }: { project: Project }) {
  const price =
    project.priceFrom && project.priceTo
      ? formatPriceRange(project.priceFrom, project.priceTo)
      : project.priceFrom
        ? formatPrice(project.priceFrom, true)
        : "Price on request"
  const cover = project.coverImage ?? project.coverImageUrl ?? project.galleryImages[0]

  return (
    <Link
      href={ROUTES.PROJECT_DETAIL(project.slug)}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-4/3 bg-ink-100">
        {cover ? (
          <Image
            src={cover}
            alt={project.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-50 text-brand-700">
            <Building2 aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          {titleCase(project.status)}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink-900">
          {project.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{project.location}</span>
        </p>
        <p className="mt-3 text-sm font-bold text-brand-700">{price}</p>
      </div>
    </Link>
  )
}

function PropertyTile({ property }: { property: Property }) {
  const price =
    property.purpose === "rent"
      ? formatRent(property.price)
      : formatPrice(property.price, true)
  const cover = property.images[0]

  return (
    <Link
      href={ROUTES.PROPERTY_DETAIL(property.slug)}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-4/3 bg-ink-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-50 text-brand-700">
            <Home aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
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
        <p className="mt-3 text-sm font-bold text-brand-700">{price}</p>
      </div>
    </Link>
  )
}

function EmptyTile({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-ink-50 p-5 text-center text-sm font-semibold text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {label}
    </Link>
  )
}

function categoryLevel(category: MarketplaceCategory) {
  return category.level ?? (category.parentSlug ? "SUBCATEGORY" : "DEPARTMENT")
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
