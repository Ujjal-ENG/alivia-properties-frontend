import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight,
  FileText,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService } from "@/services/marketplace.service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Marketplace — Alivia Properties",
  description:
    "Find trusted suppliers, building materials, finishing products, utility items, and property services in one place.",
}

export default async function MarketplacePage() {
  // Pull live data from the backend (localhost:3001) — fall back to empty arrays
  // when the API is unreachable so the page still renders.
  const [categoriesRes, suppliersRes, productsRes] = await Promise.allSettled([
    marketplaceService.listCategories(),
    marketplaceService.listSuppliers({ limit: 8 }),
    marketplaceService.listProducts({ limit: 8 }),
  ])

  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : []
  const suppliers = suppliersRes.status === "fulfilled" ? suppliersRes.value.data : []
  const productMeta =
    productsRes.status === "fulfilled" ? productsRes.value.meta : null
  const supplierMeta =
    suppliersRes.status === "fulfilled" ? suppliersRes.value.meta : null

  const backendDown =
    categoriesRes.status === "rejected" &&
    suppliersRes.status === "rejected" &&
    productsRes.status === "rejected"

  return (
    <main className="bg-linear-to-b from-brand-50/60 via-white to-white">
      {/* Hero */}
      <section className="border-b border-border/60 bg-linear-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="container-page py-12 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                Alivia Marketplace
              </p>
              <h1 className="mt-3 font-heading text-3xl font-semibold sm:text-5xl">
                Verified suppliers for everything you&apos;re building.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-brand-100 sm:text-base">
                Sand, steel, tiles, fittings, security, finishing services — discover trusted
                Bangladeshi suppliers and request a quote in seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={ROUTES.MARKETPLACE_QUOTE}>
                  <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                    <FileText className="size-4" />
                    Get a Quote
                  </Button>
                </Link>
                <a href="tel:+8801700000000">
                  <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Phone className="size-4" />
                    Call marketplace desk
                  </Button>
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-4 text-xs text-brand-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck className="size-3.5" />
                  Verified businesses
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Timer className="size-3.5" />
                  ~24h response time
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Sparkles className="size-3.5" />
                  Free, no obligation
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                Marketplace at a glance
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-brand-100">Categories</dt>
                  <dd className="mt-1 font-heading text-2xl font-semibold">{categories.length}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-brand-100">Suppliers</dt>
                  <dd className="mt-1 font-heading text-2xl font-semibold">{supplierMeta?.total ?? suppliers.length}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-brand-100">Products</dt>
                  <dd className="mt-1 font-heading text-2xl font-semibold">{productMeta?.total ?? 0}</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-white/95 p-4 text-ink-900">
                <p className="text-eyebrow mb-1">Need it fast?</p>
                <p className="text-sm font-medium text-ink-800">
                  Submit one quote — we&apos;ll route it to verified suppliers.
                </p>
                <Link href={ROUTES.MARKETPLACE_QUOTE} className="mt-2 inline-block">
                  <Button size="sm" className="w-full gap-1.5">
                    <FileText className="size-3.5" />
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {backendDown && (
        <section className="border-b border-amber-200 bg-amber-50/80">
          <div className="container-page py-3 text-xs text-amber-900">
            <span className="font-medium">Heads up:</span> the marketplace API isn&apos;t responding right now.
            You can still submit a quote request — we&apos;ll route it manually.
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container-page section-y-sm">
        <header className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow mb-1">Browse by category</p>
            <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
              Pick a build stage to find suppliers
            </h2>
          </div>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-white p-8 text-center text-sm text-ink-600">
            No categories yet. Run the backend seeder or submit a quote and we&apos;ll match you manually.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link
                  href={ROUTES.MARKETPLACE_CATEGORY(cat.slug)}
                  className="group flex h-full items-center justify-between rounded-2xl border border-border/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-(--shadow-card)"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{cat.name}</p>
                    {cat.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-600">{cat.description}</p>
                    )}
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-ink-400 transition-colors group-hover:text-brand-700" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Featured suppliers */}
      {suppliers.length > 0 && (
        <section className="container-page section-y-sm">
          <header className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-eyebrow mb-1">Featured suppliers</p>
              <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                Verified businesses ready to quote
              </h2>
            </div>
            <Link href={ROUTES.MARKETPLACE_QUOTE}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="size-3.5" />
                Request a Quote
              </Button>
            </Link>
          </header>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suppliers.map(s => (
              <li
                key={s.id}
                className="flex flex-col rounded-2xl border border-border/70 bg-white p-4 shadow-(--shadow-card)"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink-900">{s.name}</p>
                    <p className="mt-0.5 text-xs text-ink-600">{s.location}</p>
                  </div>
                  {s.isVerified && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      Verified
                    </span>
                  )}
                </div>
                {s.tagline && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-700">{s.tagline}</p>
                )}
                <div className="mt-4 flex gap-2 border-t border-border/60 pt-3">
                  <Link
                    href={ROUTES.MARKETPLACE_SUPPLIER(s.slug)}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">View</Button>
                  </Link>
                  <Link
                    href={`${ROUTES.MARKETPLACE_QUOTE}?supplierSlug=${s.slug}`}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full gap-1.5">
                      <FileText className="size-3.5" />
                      Quote
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="container-page section-y-sm">
        <div className="rounded-3xl border border-border/70 bg-white p-6 shadow-(--shadow-card) sm:p-10">
          <p className="text-eyebrow mb-2">How it works</p>
          <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
            From request to quote in three steps
          </h2>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Tell us what you need",
                desc: "Pick a supplier, product, or category and submit one form with your spec.",
              },
              {
                step: "2",
                title: "We route to verified suppliers",
                desc: "Only confirmed Bangladeshi businesses receive your request — no spam.",
              },
              {
                step: "3",
                title: "Compare and choose",
                desc: "You hear back via phone or email — typically within 24 hours.",
              },
            ].map(item => (
              <li
                key={item.step}
                className="rounded-2xl border border-border/60 bg-brand-50/60 p-4"
              >
                <div className="inline-flex size-9 items-center justify-center rounded-full bg-brand-700 font-heading text-base font-semibold text-white">
                  {item.step}
                </div>
                <p className="mt-3 font-medium text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-ink-600">{item.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex justify-center">
            <Link href={ROUTES.MARKETPLACE_QUOTE}>
              <Button size="lg" className="gap-2">
                <FileText className="size-4" />
                Get a Quote now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
