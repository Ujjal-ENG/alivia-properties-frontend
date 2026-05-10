import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react"
import { ProductActions } from "@/components/marketplace/ProductActions"
import { ProductCard } from "@/components/marketplace/ProductCard"
import {
  getProductBySlug,
  getProductsBySupplierId,
} from "@/data/marketplaceProducts"
import { marketplaceSuppliers } from "@/data/marketplaceSuppliers"
import { marketplaceGroups } from "@/data/marketplaceCategories"
import { ROUTES } from "@/config/routes.config"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  return {
    title: product ? `${product.name} — Alivia Marketplace` : "Product — Alivia Marketplace",
    description: product?.description,
  }
}

export default async function MarketplaceProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const supplier = marketplaceSuppliers.find(s => s.id === product.supplierId)
  if (!supplier) notFound()

  const category = marketplaceGroups
    .flatMap(g => g.items.map(i => ({ ...i, group: g.group, groupSlug: g.slug })))
    .find(i => i.slug === product.categorySlug)

  const otherFromSupplier = getProductsBySupplierId(product.supplierId)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

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
            <Link
              href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}
              className="hover:text-ink-900"
            >
              {supplier.name}
            </Link>
            <ArrowUpRight className="h-3 w-3 rotate-45 opacity-40" />
            <span className="line-clamp-1 font-medium text-ink-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="container-page py-8 sm:py-12">
        <Link
          href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="h-3 w-3" /> Back to {supplier.name}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* ── Left: image + meta ── */}
          <div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border/60 bg-ink-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-950 shadow-sm">
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <span className="absolute right-3 top-3 rounded-full bg-ink-900/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  On order
                </span>
              )}
            </div>

            {/* Title + brand + rating */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                    {product.brand}
                  </span>
                )}
                {category && (
                  <Link
                    href={ROUTES.MARKETPLACE_CATEGORY(category.slug)}
                    className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700 hover:bg-ink-200"
                  >
                    {category.name}
                  </Link>
                )}
                {product.rating !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold text-ink-900">
                    <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                    {product.rating.toFixed(1)}
                    {product.reviewCount !== undefined && (
                      <span className="font-normal text-ink-500">({product.reviewCount})</span>
                    )}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-ink-700">{product.description}</p>

              {/* Spec row */}
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <SpecTile
                  Icon={Package}
                  label="Min order"
                  value={product.moq !== undefined ? `${product.moq} ${product.unit}` : `1 ${product.unit}`}
                />
                <SpecTile
                  Icon={Truck}
                  label="Lead time"
                  value={product.leadTimeDays !== undefined ? `${product.leadTimeDays} days` : "Same day"}
                />
                <SpecTile
                  Icon={Clock}
                  label="Reply time"
                  value={`~${supplier.responseTimeHours}h`}
                />
              </div>
            </div>

            {/* Supplier card */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-ink-50/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Sold by
              </p>
              <Link
                href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}
                className="mt-2 flex items-center gap-3 group/sup"
              >
                <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Package className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-ink-900 group-hover/sup:text-brand-700">
                      {supplier.name}
                    </p>
                    {supplier.isVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-[12px] text-ink-600">
                    {supplier.tagline}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                      {supplier.rating.toFixed(1)} ({supplier.reviewCount})
                    </span>
                    <span>{supplier.yearsInBusiness}y in business</span>
                    <span>{supplier.location}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-400 group-hover/sup:text-brand-700" />
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <TrustChip Icon={ShieldCheck} text="Verified suppliers" />
              <TrustChip Icon={Truck} text="Bangladesh-wide delivery" />
              <TrustChip Icon={CheckCircle2} text="No prepayment required" />
            </div>
          </div>

          {/* ── Right: actions sidebar ── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ProductActions
              product={product}
              supplierName={supplier.name}
              supplierPhone={supplier.phone}
              supplierWhatsApp={supplier.whatsApp}
            />
          </aside>
        </div>

        {/* More from this supplier */}
        {otherFromSupplier.length > 0 && (
          <div className="mt-14">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-eyebrow mb-1">More from this supplier</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                  Other items by {supplier.name}
                </h2>
              </div>
              <Link
                href={ROUTES.MARKETPLACE_SUPPLIER(supplier.slug)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherFromSupplier.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

/* ─────────────────────────────────────────────────────── */

interface SpecTileProps {
  Icon: React.ElementType
  label: string
  value: string
}
function SpecTile({ Icon, label, value }: SpecTileProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  )
}

interface TrustChipProps {
  Icon: React.ElementType
  text: string
}
function TrustChip({ Icon, text }: TrustChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-2 text-[11px] font-semibold text-ink-700">
      <Icon className="h-3.5 w-3.5 text-brand-700" /> {text}
    </div>
  )
}
