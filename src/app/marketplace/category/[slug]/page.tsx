import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Clock3, FileText, Phone, Sparkles, Truck } from "lucide-react"

import { MarketplaceBreadcrumb, type Crumb } from "@/components/marketplace/MarketplaceBreadcrumb"
import { MarketplaceSupplierShowcaseCard } from "@/components/marketplace/MarketplaceSupplierShowcaseCard"
import { Button } from "@/components/ui/button"
import { CategoryImageCard } from "@/components/marketplace/CategoryImageCard"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService, type MarketplaceCategory, type TreeDepartment } from "@/services/marketplace.service"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ slug: string }> }

type Found = {
  node: MarketplaceCategory
  dept?: MarketplaceCategory
  cat?: MarketplaceCategory
  level: "DEPARTMENT" | "CATEGORY" | "SUBCATEGORY"
  children: MarketplaceCategory[]
}

function findNode(tree: TreeDepartment[], slug: string): Found | null {
  for (const dept of tree) {
    if (dept.slug === slug) return { node: dept, level: "DEPARTMENT", children: dept.categories }
    for (const cat of dept.categories) {
      if (cat.slug === slug)
        return { node: cat, dept, level: "CATEGORY", children: cat.subcategories }
      for (const sub of cat.subcategories) {
        if (sub.slug === slug)
          return { node: sub, dept, cat, level: "SUBCATEGORY", children: [] }
      }
    }
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const tree = await marketplaceService.getTree()
    const found = findNode(tree, slug)
    return {
      title: found ? `${found.node.name} — Alivia Marketplace` : "Marketplace — Alivia Properties",
      description: found?.node.description ?? undefined,
    }
  } catch {
    return { title: "Marketplace — Alivia Properties" }
  }
}

export default async function MarketplaceCategoryPage({ params }: PageProps) {
  const { slug } = await params

  let tree: TreeDepartment[] = []
  try {
    tree = await marketplaceService.getTree()
  } catch {
    /* fall through to notFound */
  }

  const found = findNode(tree, slug)
  if (tree.length > 0 && !found) notFound()
  if (!found) {
    // Backend unreachable — show a minimal shell linking to the wizard.
    return (
      <main className="bg-white">
        <div className="container-page section-y-sm text-center">
          <p className="text-sm text-ink-600">Loading marketplace…</p>
          <Link href={ROUTES.MARKETPLACE_REQUEST} className="mt-4 inline-block">
            <Button>Request a quote</Button>
          </Link>
        </div>
      </main>
    )
  }

  const { node, dept, cat, level, children } = found
  const isSubcategory = level === "SUBCATEGORY"

  // Quote link prefills the wizard at the right depth.
  const quoteHref = isSubcategory
    ? `${ROUTES.MARKETPLACE_REQUEST}?dept=${dept?.slug ?? ""}&cat=${cat?.slug ?? ""}&sub=${node.slug}`
    : level === "CATEGORY"
      ? `${ROUTES.MARKETPLACE_REQUEST}?dept=${dept?.slug ?? ""}&cat=${node.slug}`
      : `${ROUTES.MARKETPLACE_REQUEST}?dept=${node.slug}`

  const suppliers = isSubcategory
    ? await marketplaceService
        .listSuppliers({ category: node.slug, limit: 24 })
        .then((r) => r.data)
        .catch(() => [])
    : []

  const childLabel = level === "DEPARTMENT" ? "categories" : "options"
  const confidenceItems = [
    { icon: CheckCircle2, label: "Verified desk", text: "Requests route to checked suppliers only." },
    { icon: Clock3, label: "24h target", text: "Useful price replies, not cold calls." },
    { icon: Truck, label: "Area fit", text: "Matches consider delivery and visit coverage." },
  ]

  const breadcrumbTrail: Crumb[] = [
    ...(dept
      ? [{ label: dept.name, href: ROUTES.MARKETPLACE_CATEGORY(dept.slug) }]
      : []),
    ...(cat
      ? [{ label: cat.name, href: ROUTES.MARKETPLACE_CATEGORY(cat.slug) }]
      : []),
    { label: node.name },
  ]

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-r from-brand-950 via-brand-900 to-brand-700 text-white">
        <div className="container-page relative py-10 sm:py-14">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{node.name}</h1>
          {node.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-100">{node.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={quoteHref}>
              <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                <FileText aria-hidden="true" className="size-4" /> Request a Quote
              </Button>
            </Link>
            <a href="tel:+8801700000000">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Phone aria-hidden="true" className="size-4" /> Call desk
              </Button>
            </a>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {confidenceItems.map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon aria-hidden="true" className="size-4 text-gold-300" />
                  {label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-brand-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketplaceBreadcrumb trail={breadcrumbTrail} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {/* ── Drill-down: department/category show child tiles ───────────── */}
            {!isSubcategory && (
              <>
                <header className="mb-4">
                  <p className="text-eyebrow mb-1">Browse {childLabel}</p>
                  <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                    {children.length} {childLabel}
                  </h2>
                </header>
                {children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {children.map((child) => (
                      <CategoryImageCard key={child.slug} cat={child} />
                    ))}
                  </div>
                ) : (
                  <EmptyOnboarding name={node.name} quoteHref={quoteHref} />
                )}
              </>
            )}

            {/* ── Subcategory: show suppliers ────────────────────────────────── */}
            {isSubcategory && (
              <>
                <header className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-eyebrow mb-1">Shortlist verified suppliers</p>
                    <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                      {suppliers.length > 0 ? `${suppliers.length} supplier matches` : "Onboarding suppliers"}
                    </h2>
                    {suppliers.length > 0 && (
                      <p className="mt-1 max-w-2xl text-sm text-ink-600">
                        Compare stock status, sold volume, live demand, delivery speed, gallery photos, and video before you request pricing.
                      </p>
                    )}
                  </div>
                  <Link href={quoteHref}>
                    <Button size="sm" className="gap-1.5">
                      <FileText aria-hidden="true" className="size-3.5" /> Request a quote
                    </Button>
                  </Link>
                </header>

                {suppliers.length > 0 ? (
                  <ul className="grid gap-6">
                    {suppliers.map((s) => (
                      <li key={s.id}>
                        <MarketplaceSupplierShowcaseCard supplier={s} categorySlug={node.slug} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyOnboarding name={node.name} quoteHref={quoteHref} />
                )}
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-(--shadow-card)">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Fastest way to a price
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-ink-900">
                Use the guided request
              </h3>
              <p className="mt-1 text-[12px] leading-snug text-ink-600">
                Pick what you need, choose suppliers, and submit one form — verified suppliers reply
                within 24 hours.
              </p>
              <Link href={quoteHref} className="mt-3 block">
                <Button size="sm" className="w-full gap-1.5">
                  <FileText aria-hidden="true" className="size-3.5" /> Request a quote
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function EmptyOnboarding({ name, quoteHref }: { name: string; quoteHref: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-8 text-center shadow-(--shadow-card)">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Sparkles aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 font-heading text-lg font-semibold text-ink-900">
        We&apos;re onboarding partners
      </p>
      <p className="mt-1 text-sm text-ink-600">
        Nothing listed under {name} yet. Submit a request and our marketplace team will return vetted
        matches within 24 hours.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link href={quoteHref}>
          <Button size="sm" className="gap-1.5">
            <FileText aria-hidden="true" className="size-3.5" /> Request a quote
          </Button>
        </Link>
        <a href="tel:+8801700000000">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Phone aria-hidden="true" className="size-3.5" /> Call marketplace desk
          </Button>
        </a>
      </div>
    </div>
  )
}
