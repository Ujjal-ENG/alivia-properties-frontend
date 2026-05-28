import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Phone,
  Sparkles,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService } from "@/services/marketplace.service"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const categories = await marketplaceService.listCategories()
    const cat = categories.find(c => c.slug === slug)
    return {
      title: cat ? `${cat.name} — Suppliers | Alivia Marketplace` : "Marketplace — Alivia Properties",
      description: cat?.description ?? undefined,
    }
  } catch {
    return { title: "Marketplace — Alivia Properties" }
  }
}

export default async function MarketplaceCategoryPage({ params }: PageProps) {
  const { slug } = await params

  const [categoriesRes, suppliersRes] = await Promise.allSettled([
    marketplaceService.listCategories(),
    marketplaceService.listSuppliers({ category: slug, limit: 24 }),
  ])

  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : []
  const cat = categories.find(c => c.slug === slug)
  if (categoriesRes.status === "fulfilled" && !cat) notFound()

  const suppliers = suppliersRes.status === "fulfilled" ? suppliersRes.value.data : []
  const featuredCount = suppliers.filter(s => s.isFeatured).length
  const verifiedCount = suppliers.filter(s => s.isVerified).length

  const related = categories.filter(c => c.slug !== slug).slice(0, 6)
  const quoteHref = `${ROUTES.MARKETPLACE_QUOTE}?categorySlug=${slug}`

  return (
    <main className="bg-white">
      <div className="border-b border-border/60 bg-ink-50/50">
        <div className="container-page py-3">
          <Link
            href={ROUTES.MARKETPLACE}
            className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="size-3" /> Back to marketplace
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-r from-brand-950 via-brand-900 to-brand-700 text-white">
        <div className="container-page relative py-10 sm:py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
            Marketplace
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            {cat?.name ?? slug.replace(/-/g, " ")}
          </h1>
          {cat?.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-100">
              {cat.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-brand-100">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              {suppliers.length} {suppliers.length === 1 ? "supplier" : "suppliers"}
            </span>
            {verifiedCount > 0 && (
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                {verifiedCount} verified
              </span>
            )}
            {featuredCount > 0 && (
              <span className="rounded-full bg-gold-400/20 px-3 py-1 text-gold-200 backdrop-blur">
                {featuredCount} featured
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={quoteHref}>
              <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                <FileText className="size-4" /> Get a Quote
              </Button>
            </Link>
            <a href="tel:+8801700000000">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Phone className="size-4" /> Call desk
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <header className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-eyebrow mb-1">Suppliers &amp; service providers</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {suppliers.length > 0
                    ? `${suppliers.length} options`
                    : "Onboarding suppliers"}
                </h2>
              </div>
              <Link href={quoteHref}>
                <Button size="sm" className="gap-1.5">
                  <FileText className="size-3.5" /> Request a quote
                </Button>
              </Link>
            </header>

            {suppliers.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {suppliers.map(s => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-border/70 bg-white p-4 shadow-(--shadow-card)"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={ROUTES.MARKETPLACE_SUPPLIER(s.slug)}
                          className="font-medium text-ink-900 hover:text-brand-700"
                        >
                          {s.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-600">{s.location}</p>
                      </div>
                      {s.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          <CheckCircle2 className="size-3" /> Verified
                        </span>
                      )}
                    </div>
                    {s.tagline && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink-700">{s.tagline}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-ink-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-gold-400 text-gold-400" />
                        {s.rating.toFixed(1)} ({s.reviewCount})
                      </span>
                      {s.priceRange && <span>· {s.priceRange}</span>}
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-border/60 pt-3">
                      <Link
                        href={ROUTES.MARKETPLACE_SUPPLIER(s.slug)}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          View profile
                        </Button>
                      </Link>
                      <Link
                        href={`${ROUTES.MARKETPLACE_QUOTE}?supplierSlug=${s.slug}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full gap-1.5">
                          <FileText className="size-3.5" /> Quote
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-white p-8 text-center shadow-(--shadow-card)">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Sparkles className="size-5" />
                </span>
                <p className="mt-3 font-heading text-lg font-semibold text-ink-900">
                  We&apos;re onboarding partners
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  No verified suppliers in {cat?.name ?? "this category"} yet. Submit a quote
                  request and our marketplace team will return vetted matches within 24 hours.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href={quoteHref}>
                    <Button size="sm" className="gap-1.5">
                      <FileText className="size-3.5" /> Get a Quote
                    </Button>
                  </Link>
                  <a href="tel:+8801700000000">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Phone className="size-3.5" /> Call marketplace desk
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Need help choosing?
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-ink-900">
                Free 15-min consult
              </h3>
              <p className="mt-1 text-[12px] leading-snug text-ink-600">
                Our category specialist will compare 3 suppliers, negotiate price, and book a site
                visit on your behalf.
              </p>
              <Link href={quoteHref} className="mt-3 block">
                <Button size="sm" className="w-full gap-1.5">
                  <FileText className="size-3.5" /> Submit a quote
                </Button>
              </Link>
            </div>

            {related.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Other categories
                </p>
                <ul className="mt-3 divide-y divide-border/60">
                  {related.map(r => (
                    <li key={r.slug}>
                      <Link
                        href={ROUTES.MARKETPLACE_CATEGORY(r.slug)}
                        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-ink-50"
                      >
                        <span className="flex-1 text-sm font-medium text-ink-900">{r.name}</span>
                        <ArrowUpRight className="size-3.5 text-ink-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
