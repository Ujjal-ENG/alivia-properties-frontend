import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Send,
  ShieldCheck,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { getSupplierBySlug } from "@/data/marketplaceSuppliers"
import { getProductsBySupplierId } from "@/data/marketplaceProducts"
import { marketplaceGroups } from "@/data/marketplaceCategories"
import { ROUTES } from "@/config/routes.config"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supplier = getSupplierBySlug(slug)
  return {
    title: supplier
      ? `${supplier.name} — Alivia Marketplace`
      : "Supplier — Alivia Marketplace",
    description: supplier?.tagline,
  }
}

export default async function SupplierProfilePage({ params }: PageProps) {
  const { slug } = await params
  const supplier = getSupplierBySlug(slug)
  if (!supplier) notFound()

  const products = getProductsBySupplierId(supplier.id)

  const categoryNames = supplier.categories
    .map(catSlug => {
      const item = marketplaceGroups.flatMap(g => g.items).find(i => i.slug === catSlug)
      return item ? { slug: catSlug, name: item.name } : null
    })
    .filter(Boolean) as { slug: string; name: string }[]

  const inStockCount = products.filter(p => p.inStock).length

  return (
    <main className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-ink-50/50">
        <div className="container-page py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-600">
            <Link href={ROUTES.MARKETPLACE} className="hover:text-ink-900">
              Marketplace
            </Link>
            <ArrowUpRight className="h-3 w-3 rotate-45 opacity-40" />
            <span className="text-ink-900 font-medium">{supplier.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0">
          <Image
            src={supplier.coverImage}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-brand-950/95 via-brand-900/85 to-brand-900/40" />
        </div>

        <div className="container-page relative py-10 sm:py-14">
          <Link
            href={ROUTES.MARKETPLACE}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-brand-200 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> Back to marketplace
          </Link>

          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-100 backdrop-blur">
                  {supplier.kind === "service" ? "Service Provider" : "Supplier"}
                </span>
                {supplier.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-brand-100 backdrop-blur">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
                {supplier.isFeatured && (
                  <span className="rounded-full bg-gold-400/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-200 backdrop-blur">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">
                {supplier.name}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100">
                {supplier.tagline}
              </p>

              {/* Rating */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                <span className="font-semibold">{supplier.rating.toFixed(1)}</span>
                <span className="text-[12px] text-brand-200">({supplier.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-brand-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <TrendingUp className="h-3 w-3" /> {supplier.yearsInBusiness}y in business
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <Clock className="h-3 w-3" /> ~{supplier.responseTimeHours}h reply
            </span>
            {supplier.deliveryDays !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <Truck className="h-3 w-3" /> {supplier.deliveryDays}d delivery
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <MapPin className="h-3 w-3" /> {supplier.location}
            </span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Products */}
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-eyebrow mb-1">Products &amp; services</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {products.length > 0
                    ? `${products.length} offerings`
                    : "No listings yet"}
                </h2>
                {products.length > 0 && (
                  <p className="mt-0.5 text-sm text-ink-500">
                    {inStockCount} in stock · {products.length - inStockCount} on order
                  </p>
                )}
              </div>
              <Link href={`${ROUTES.MARKETPLACE}?action=quote&supplier=${supplier.slug}`}>
                <Button size="sm" className="cursor-pointer gap-1.5 rounded-full">
                  <Send className="h-3.5 w-3.5" /> Request a quote
                </Button>
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="surface-card p-8 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 font-heading text-lg font-semibold text-ink-900">
                  Catalogue coming soon
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Send a quote request and this supplier will respond within {supplier.responseTimeHours}h.
                </p>
                <div className="mt-4">
                  <Link href={`${ROUTES.MARKETPLACE}?action=quote&supplier=${supplier.slug}`}>
                    <Button size="sm" className="cursor-pointer gap-1.5 rounded-full">
                      <Send className="h-3.5 w-3.5" /> Request a quote
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Contact */}
            <div className="surface-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Contact this {supplier.kind === "service" ? "provider" : "supplier"}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink-600">
                {supplier.priceRange} · typically replies in ~{supplier.responseTimeHours}h
              </p>
              <div className="mt-3 space-y-2">
                <a href={`tel:${supplier.phone}`} className="block">
                  <Button size="sm" className="w-full cursor-pointer gap-1.5 rounded-full bg-ink-900 text-white hover:bg-ink-800">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </Button>
                </a>
                {supplier.whatsApp && (
                  <a
                    href={`https://wa.me/${supplier.whatsApp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer gap-1.5 rounded-full border-success/40 text-success hover:bg-success/10"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </Button>
                  </a>
                )}
                {supplier.email && (
                  <a href={`mailto:${supplier.email}`} className="block">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer gap-1.5 rounded-full"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Service areas */}
            <div className="surface-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Service areas
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {supplier.serviceAreas.map(area => (
                  <span
                    key={area}
                    className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Brands */}
            {supplier.brands && supplier.brands.length > 0 && (
              <div className="surface-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Brands carried
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {supplier.brands.map(b => (
                    <span
                      key={b}
                      className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {supplier.certifications && supplier.certifications.length > 0 && (
              <div className="surface-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Certifications
                </p>
                <ul className="mt-2 space-y-1.5">
                  {supplier.certifications.map(cert => (
                    <li key={cert} className="flex items-center gap-2 text-[12px] text-ink-700">
                      <ShieldCheck className="h-3.5 w-3.5 flex-none text-brand-600" /> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categories */}
            {categoryNames.length > 0 && (
              <div className="surface-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Categories
                </p>
                <ul className="mt-2 divide-y divide-border/60">
                  {categoryNames.slice(0, 6).map(cat => (
                    <li key={cat.slug}>
                      <Link
                        href={ROUTES.MARKETPLACE_CATEGORY(cat.slug)}
                        className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 text-[12px] text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                      >
                        {cat.name}
                        <ArrowUpRight className="h-3 w-3 text-ink-400" />
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
