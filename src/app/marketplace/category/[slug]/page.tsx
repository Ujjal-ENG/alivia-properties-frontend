import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Phone, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconByName } from "@/components/marketplace/icon-by-name"
import { SupplierFilterSection } from "@/components/marketplace/SupplierFilterSection"
import { marketplaceGroups } from "@/data/marketplaceCategories"
import { getSuppliersForCategory } from "@/data/marketplaceSuppliers"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = marketplaceGroups.flatMap(g => g.items).find(i => i.slug === slug)
  return {
    title: item ? `${item.name} — Suppliers | Alivia Marketplace` : "Marketplace — Alivia Properties",
    description: item?.description,
  }
}

export default async function MarketplaceCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const allItems = marketplaceGroups.flatMap(g =>
    g.items.map(i => ({ ...i, group: g.group, groupSlug: g.slug })),
  )
  const item = allItems.find(i => i.slug === slug)
  if (!item) notFound()

  const suppliers = getSuppliersForCategory(slug)
  const featuredCount = suppliers.filter(s => s.isFeatured).length
  const verifiedCount = suppliers.filter(s => s.isVerified).length

  const related = marketplaceGroups
    .find(g => g.slug === item.groupSlug)
    ?.items.filter(i => i.slug !== item.slug)
    .slice(0, 6) ?? []

  return (
    <main className="bg-white">
      <div className="border-b border-border/60 bg-ink-50/50">
        <div className="container-page py-3">
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-3 w-3" /> Back to marketplace
          </Link>
        </div>
      </div>

      {/* Category hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-brand-950/95 via-brand-900/85 to-brand-900/40" />
        </div>
        <div className="container-page relative py-10 sm:py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
            {item.group}
          </p>
          <div className="mt-3 flex items-start gap-4">
            <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/95 text-brand-700 shadow-sm">
              <IconByName name={item.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
                {item.name}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100">
                {item.description}
              </p>
            </div>
          </div>

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
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Suppliers list */}
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-eyebrow mb-1">Suppliers & service providers</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {suppliers.length > 0
                    ? `${suppliers.length} options near you`
                    : "Onboarding suppliers"}
                </h2>
              </div>
              <Link href={`/marketplace?action=quote&category=${item.slug}`}>
                <Button size="sm" className="cursor-pointer gap-1.5 rounded-full">
                  <Send className="h-3.5 w-3.5" /> Request a quote
                </Button>
              </Link>
            </div>

            <SupplierFilterSection
              suppliers={suppliers}
              emptySlot={
                <div className="surface-card p-8 text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-heading text-lg font-semibold text-ink-900">
                    We&apos;re onboarding partners
                  </p>
                  <p className="mt-1 text-sm text-ink-600">
                    No verified suppliers in {item.name} yet. Submit a quote request and our marketplace team
                    will return 3 vetted matches within 24 hours.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href={`/marketplace?action=quote&category=${item.slug}`}>
                      <Button size="sm" className="cursor-pointer gap-1.5 rounded-full">
                        <Send className="h-3.5 w-3.5" /> Request a quote
                      </Button>
                    </Link>
                    <a href="tel:+8801700000000">
                      <Button size="sm" variant="outline" className="cursor-pointer gap-1.5 rounded-full">
                        <Phone className="h-3.5 w-3.5" /> Call marketplace desk
                      </Button>
                    </a>
                  </div>
                </div>
              }
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="surface-card p-5">
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
              <a href="tel:+8801700000000" className="mt-3 block">
                <Button size="sm" className="w-full cursor-pointer gap-1.5 rounded-full">
                  <Phone className="h-3.5 w-3.5" /> Call marketplace desk
                </Button>
              </a>
            </div>

            <div className="surface-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                More in {item.group}
              </p>
              <ul className="mt-3 divide-y divide-border/60">
                {related.map(r => (
                  <li key={r.slug}>
                    <Link
                      href={`/marketplace/category/${r.slug}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-ink-50"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
                        <IconByName name={r.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-ink-900">{r.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
