import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

import { MarketplaceBreadcrumb, type Crumb } from "@/components/marketplace/MarketplaceBreadcrumb"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService } from "@/services/marketplace.service"
import { ApiError } from "@/services/http-client"
import type { ProductVariant } from "@/types/marketplace.types"
import { formatPrice } from "@/utils/format-price"
import { isServiceKind, providerLabel } from "@/utils/marketplace-kind"

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
    const product = await marketplaceService.productBySlug(slug)
    return {
      title: `${product.name} — Alivia Marketplace`,
      description: product.description,
    }
  } catch {
    return { title: "Product — Alivia Marketplace" }
  }
}

export default async function MarketplaceProductPage({ params }: PageProps) {
  const { slug } = await params

  let product
  try {
    product = await marketplaceService.productBySlug(slug)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const supplier = product.supplier
  const quoteHref = `${ROUTES.MARKETPLACE_QUOTE}?productId=${product.id}&productSlug=${product.slug}${supplier ? `&supplierSlug=${supplier.slug}` : ""}`
  const serviceMode = isServiceKind(supplier?.kind)
  const providerText = providerLabel(supplier?.kind)

  const breadcrumbTrail: Crumb[] = [
    ...(supplier
      ? [{ label: supplier.name, href: ROUTES.MARKETPLACE_SUPPLIER(supplier.slug) }]
      : []),
    { label: product.name },
  ]

  return (
    <main className="bg-white">
      <MarketplaceBreadcrumb trail={breadcrumbTrail} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-(--shadow-card)">
            {product.image ? (
              <div className="relative aspect-4/3 w-full bg-ink-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-4 bg-linear-to-br from-brand-50 via-white to-gold-50 px-6 text-center">
                <span className="flex size-20 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-(--shadow-card)">
                  {serviceMode ? (
                    <Wrench aria-hidden="true" className="size-9" />
                  ) : (
                    <Package aria-hidden="true" className="size-9" />
                  )}
                </span>
                <span className="max-w-xs text-sm font-semibold text-brand-800">
                  {product.name}
                </span>
                <span className="text-xs text-ink-500">
                  {serviceMode ? "Service image coming soon" : "Product image coming soon"}
                </span>
              </div>
            )}
          </div>

          <div>
            {product.category?.name && (
              <p className="text-eyebrow mb-2">{product.category.name}</p>
            )}
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              {serviceMode ? "Service Package" : "Catalogue Product"}
            </span>
            <h1 className="font-heading text-3xl font-semibold text-ink-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-ink-700 sm:text-base">{product.description}</p>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-2xl font-semibold text-red-700">
                {product.price > 0 ? formatPrice(product.price, true) : "Price on request"}
                <span className="ml-1 text-sm font-medium text-red-500">/ {product.unit}</span>
              </span>
              <span className="text-sm text-ink-500">
                {serviceMode
                  ? "final rate confirmed after scope, area, and schedule"
                  : "quoted after quantity and delivery location"}
              </span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                  <CheckCircle2 aria-hidden="true" className="size-3" /> {serviceMode ? "Available now" : "In stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  {serviceMode ? "Schedule needed" : "On order"}
                </span>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {product.brand && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">{serviceMode ? "Team" : "Brand"}</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{product.brand}</dd>
                </div>
              )}
              {product.moq !== undefined && product.moq !== null && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">{serviceMode ? "Minimum booking" : "MOQ"}</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">
                    {product.moq} {product.unit}
                  </dd>
                </div>
              )}
              {product.leadTimeDays !== undefined && product.leadTimeDays !== null && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">{serviceMode ? "Visit lead" : "Lead time"}</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{product.leadTimeDays} days</dd>
                </div>
              )}
              {product.rating !== undefined && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">Rating</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1 font-medium text-ink-900">
                    <Star aria-hidden="true" className="size-3.5 fill-gold-400 text-gold-400" />
                    {product.rating.toFixed(1)} ({product.reviewCount})
                  </dd>
                </div>
              )}
            </dl>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  {serviceMode ? "Choose package" : "Choose variant"}
                </p>
                <div className="mt-3 grid gap-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex flex-col gap-3 rounded-xl border border-border/70 bg-ink-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900">{variant.name}</p>
                        <p className="mt-0.5 text-xs text-ink-500">{variantMeta(variant)}</p>
                      </div>
                      <Link href={`${quoteHref}&variantId=${variant.id}`}>
                        <Button size="sm" className="w-full gap-1.5 rounded-full sm:w-auto">
                          <FileText aria-hidden="true" className="size-3.5" /> {serviceMode ? "Quote package" : "Quote variant"}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={quoteHref}>
                <Button size="lg" className="gap-2">
                  <FileText aria-hidden="true" className="size-4" /> {serviceMode ? "Get Service Quote" : "Get Product Quote"}
                </Button>
              </Link>
              {supplier && (
                <Link href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}>
                  <Button size="lg" variant="outline" className="gap-2">
                    Visit {providerText.toLowerCase()} <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-border/70 bg-ink-50/80 p-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Checked seller", value: supplier?.name ?? "Alivia desk" },
                { icon: Clock3, label: serviceMode ? "Visit lead" : "Lead time", value: product.leadTimeDays ? `${product.leadTimeDays} days` : "Confirm fast" },
                { icon: Truck, label: "Quote includes", value: serviceMode ? "Scope & schedule" : "Quantity & delivery" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-white px-3 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                    <Icon aria-hidden="true" className="size-3.5" />
                    {label}
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
                </div>
              ))}
            </div>

            {supplier && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-brand-50/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  {serviceMode ? "Provided by" : "Sold by"}
                </p>
                <p className="mt-1 font-medium text-ink-900">{supplier.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`tel:${supplier.phone ?? ""}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Phone aria-hidden="true" className="size-3.5" /> Call
                    </Button>
                  </a>
                  {supplier.email && (
                    <a href={`mailto:${supplier.email}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Mail aria-hidden="true" className="size-3.5" /> Email
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
