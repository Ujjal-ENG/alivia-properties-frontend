import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Star,
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
              <div className="aspect-4/3 w-full bg-ink-100" />
            )}
          </div>

          <div>
            {product.category?.name && (
              <p className="text-eyebrow mb-2">{product.category.name}</p>
            )}
            <h1 className="font-heading text-3xl font-semibold text-ink-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-ink-700 sm:text-base">{product.description}</p>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-2xl font-semibold text-brand-700">
                Price on request
              </span>
              <span className="text-sm text-ink-500">quoted after quantity and delivery location</span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                  <CheckCircle2 className="size-3" /> In stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  On order
                </span>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {product.brand && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">Brand</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{product.brand}</dd>
                </div>
              )}
              {product.moq !== undefined && product.moq !== null && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">MOQ</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">
                    {product.moq} {product.unit}
                  </dd>
                </div>
              )}
              {product.leadTimeDays !== undefined && product.leadTimeDays !== null && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">Lead time</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{product.leadTimeDays} days</dd>
                </div>
              )}
              {product.rating !== undefined && (
                <div className="rounded-xl border border-border/60 bg-white px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-ink-500">Rating</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1 font-medium text-ink-900">
                    <Star className="size-3.5 fill-gold-400 text-gold-400" />
                    {product.rating.toFixed(1)} ({product.reviewCount})
                  </dd>
                </div>
              )}
            </dl>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Choose variant
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
                          <FileText className="size-3.5" /> Quote variant
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
                  <FileText className="size-4" /> Get a Quote
                </Button>
              </Link>
              {supplier && (
                <Link href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}>
                  <Button size="lg" variant="outline" className="gap-2">
                    Visit supplier <ArrowUpRight className="size-4" />
                  </Button>
                </Link>
              )}
            </div>

            {supplier && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-brand-50/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Sold by
                </p>
                <p className="mt-1 font-medium text-ink-900">{supplier.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`tel:${supplier.phone ?? ""}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Phone className="size-3.5" /> Call
                    </Button>
                  </a>
                  {supplier.email && (
                    <a href={`mailto:${supplier.email}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Mail className="size-3.5" /> Email
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
