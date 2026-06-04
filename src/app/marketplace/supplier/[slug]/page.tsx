import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService } from "@/services/marketplace.service"
import { ApiError } from "@/services/http-client"
import type { ProductVariant } from "@/types/marketplace.types"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ slug: string }>
}

function variantMeta(variant: ProductVariant) {
  return (variant.specs ?? [])
    .map((spec) => `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}`)
    .filter(Boolean)
    .join(" / ")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const supplier = await marketplaceService.supplierBySlug(slug)
    return {
      title: `${supplier.name} — Alivia Marketplace`,
      description: supplier.tagline,
    }
  } catch {
    return { title: "Supplier — Alivia Marketplace" }
  }
}

export default async function SupplierProfilePage({ params }: PageProps) {
  const { slug } = await params

  let supplier
  try {
    supplier = await marketplaceService.supplierBySlug(slug)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const products = supplier.products ?? []
  const inStockCount = products.filter(p => p.inStock).length
  const quoteHref = `${ROUTES.MARKETPLACE_QUOTE}?supplierSlug=${supplier.slug}`

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

      <section className="relative overflow-hidden border-b border-border/60">
        {supplier.coverImage && (
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
        )}
        {!supplier.coverImage && (
          <div className="absolute inset-0 bg-linear-to-r from-brand-900 to-brand-700" />
        )}

        <div className="container-page relative py-10 sm:py-14 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-100 backdrop-blur">
              {supplier.kind === "service" || supplier.kind === "SERVICE"
                ? "Service Provider"
                : "Supplier"}
            </span>
            {supplier.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-brand-100 backdrop-blur">
                <CheckCircle2 className="size-3" /> Verified
              </span>
            )}
            {supplier.isFeatured && (
              <span className="rounded-full bg-gold-400/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-200 backdrop-blur">
                Featured
              </span>
            )}
          </div>

          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
            {supplier.name}
          </h1>
          {supplier.tagline && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100">
              {supplier.tagline}
            </p>
          )}

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
            <Star className="size-3.5 fill-gold-400 text-gold-400" />
            <span className="font-semibold">{supplier.rating.toFixed(1)}</span>
            <span className="text-[12px] text-brand-200">
              ({supplier.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-brand-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <TrendingUp className="size-3" /> {supplier.yearsInBusiness}y in business
            </span>
            {supplier.responseTimeHours !== undefined && supplier.responseTimeHours !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <Clock className="size-3" /> ~{supplier.responseTimeHours}h reply
              </span>
            )}
            {supplier.deliveryDays !== undefined && supplier.deliveryDays !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <Truck className="size-3" /> {supplier.deliveryDays}d delivery
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <MapPin className="size-3" /> {supplier.location}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={quoteHref}>
              <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                <FileText className="size-4" />
                Get a Quote
              </Button>
            </Link>
            <a href={`tel:${supplier.phone}`}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Phone className="size-4" /> Call
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <header className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-eyebrow mb-1">Products &amp; services</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {products.length > 0
                    ? `${products.length} offerings`
                    : "Catalogue coming soon"}
                </h2>
                {products.length > 0 && (
                  <p className="mt-0.5 text-sm text-ink-500">
                    {inStockCount} in stock · {products.length - inStockCount} on order
                  </p>
                )}
              </div>
              <Link href={quoteHref}>
                <Button size="sm" className="gap-1.5">
                  <FileText className="size-3.5" /> Request a quote
                </Button>
              </Link>
            </header>

            {products.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map(p => (
                  <li
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-(--shadow-card)"
                  >
                    {p.image && (
                      <div className="relative aspect-4/3 w-full bg-ink-50">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="font-medium text-ink-900">{p.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-600">{p.description}</p>
                      <div className="mt-3 text-sm">
                        <span className="font-heading text-base font-semibold text-brand-700">
                          Price on request
                        </span>
                        <span className="ml-1 text-xs text-ink-500">/ {p.unit}</span>
                      </div>
                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.variants.slice(0, 4).map((variant) => (
                            <Link
                              key={variant.id}
                              href={`${ROUTES.MARKETPLACE_QUOTE}?productId=${p.id}&productSlug=${p.slug}&supplierSlug=${supplier.slug}&variantId=${variant.id}`}
                              title={variantMeta(variant)}
                            >
                              <Button size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                                {variant.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-3">
                        <Link
                          href={`${ROUTES.MARKETPLACE_QUOTE}?productId=${p.id}&productSlug=${p.slug}&supplierSlug=${supplier.slug}`}
                        >
                          <Button size="sm" variant="outline" className="w-full gap-1.5">
                            <FileText className="size-3.5" />
                            Quote this item
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-white p-8 text-center shadow-(--shadow-card)">
                <p className="font-heading text-lg font-semibold text-ink-900">
                  No listings yet
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Send a quote request and this supplier will respond shortly.
                </p>
                <div className="mt-4">
                  <Link href={quoteHref}>
                    <Button size="sm" className="gap-1.5">
                      <FileText className="size-3.5" /> Request a quote
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Contact this {supplier.kind === "service" || supplier.kind === "SERVICE" ? "provider" : "supplier"}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink-600">
                {supplier.priceRange ?? "Price on request"} ·
                typically replies in ~{supplier.responseTimeHours ?? 24}h
              </p>
              <div className="mt-3 space-y-2">
                <Link href={quoteHref} className="block">
                  <Button size="sm" className="w-full gap-1.5">
                    <FileText className="size-3.5" /> Get a Quote
                  </Button>
                </Link>
                <a href={`tel:${supplier.phone}`} className="block">
                  <Button size="sm" variant="outline" className="w-full gap-1.5">
                    <Phone className="size-3.5" /> Call
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
                      className="w-full gap-1.5 border-green-500/40 text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </Button>
                  </a>
                )}
                {supplier.email && (
                  <a href={`mailto:${supplier.email}`} className="block">
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <Mail className="size-3.5" /> Email
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {supplier.serviceAreas?.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
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
            )}

            {supplier.brands && supplier.brands.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
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
          </aside>
        </div>
      </section>
    </main>
  )
}
