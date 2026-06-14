import type { Metadata } from "next"
import Link from "next/link"
import {
  FileText,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryGroupSection } from "@/components/marketplace/CategoryGroupSection"
import { CategoryGroupTabs } from "@/components/marketplace/CategoryGroupTabs"
import {
  MarketplaceSearchDeck,
  type MarketplaceSearchItem,
} from "@/components/marketplace/MarketplaceSearchDeck"
import { ROUTES } from "@/config/routes.config"
import { marketplaceService, type MarketplaceCategory } from "@/services/marketplace.service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Marketplace — Alivia Properties",
  description:
    "Find trusted suppliers, building materials, finishing products, utility items, and property services in one place.",
}

export default async function MarketplacePage() {
  const [categoriesRes, suppliersRes, productsRes] = await Promise.allSettled([
    marketplaceService.listCategories(),
    marketplaceService.listSuppliers({ limit: 1 }),
    marketplaceService.listProducts({ limit: 1 }),
  ])

  const categories: MarketplaceCategory[] =
    categoriesRes.status === "fulfilled" ? categoriesRes.value : []
  const supplierTotal =
    suppliersRes.status === "fulfilled" ? suppliersRes.value.meta.total : 0
  const productTotal =
    productsRes.status === "fulfilled" ? productsRes.value.meta.total : 0

  // Build the Department → Category view (subcategories live one level deeper,
  // surfaced on the category page + the quote wizard).
  const lvl = (c: MarketplaceCategory): "DEPARTMENT" | "CATEGORY" | "SUBCATEGORY" =>
    c.level ?? (c.parentSlug ? "SUBCATEGORY" : "DEPARTMENT")

  const groups = categories
    .filter((c) => lvl(c) === "DEPARTMENT")
    .sort((a, b) => a.order - b.order)

  const childrenByGroup = categories
    .filter((c) => lvl(c) === "CATEGORY")
    .reduce<Record<string, MarketplaceCategory[]>>((acc, c) => {
      const key = c.parentSlug!
      ;(acc[key] ??= []).push(c)
      return acc
    }, {})

  Object.values(childrenByGroup).forEach((arr) => arr.sort((a, b) => a.order - b.order))

  const totalCategories = categories.filter((c) => lvl(c) === "CATEGORY").length
  const parentNameBySlug = new Map(categories.map((c) => [c.slug, c.name]))
  const searchItems: MarketplaceSearchItem[] = categories
    .filter((c) => lvl(c) !== "DEPARTMENT")
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      level: lvl(c),
      parentName: c.parentSlug ? parentNameBySlug.get(c.parentSlug) : null,
    }))

  const tabs = groups.map((g) => ({
    slug: g.slug,
    name: g.name,
    count: childrenByGroup[g.slug]?.length ?? 0,
  }))

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,color-mix(in_oklch,var(--color-brand-400)_28%,transparent)_0%,transparent_58%),radial-gradient(circle_at_82%_18%,color-mix(in_oklch,var(--color-gold-300)_24%,transparent)_0%,transparent_48%)]" />

        <div className="container-page relative py-12 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left copy */}
            <div>
              <p className="text-eyebrow mb-3 text-gold-300">Alivia Marketplace</p>
              <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Search suppliers by{" "}
                <span className="text-gold-300">real build category</span>,
                <br className="hidden sm:block" /> not guesswork.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
                Real supplier discovery with category imagery that matches what buyers
                actually need. Sand, steel, tiles, fittings, security, finishing
                services — verified Bangladeshi suppliers, one quote away.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={ROUTES.MARKETPLACE_REQUEST}>
                  <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                    <FileText aria-hidden="true" className="size-4" />
                    Get a Free Quote
                  </Button>
                </Link>
                <a href="tel:+8801700000000">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    Call Marketplace Desk
                  </Button>
                </a>
              </div>

              {searchItems.length > 0 && <MarketplaceSearchDeck items={searchItems} />}

              {/* Trust pills */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-brand-100">
                {[
                  { icon: ShieldCheck, label: "Verified businesses" },
                  { icon: Timer, label: "~24h response time" },
                  { icon: Sparkles, label: "Free, no obligation" },
                  { icon: Truck, label: "Dhaka-wide delivery" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right stats panel */}
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              {/* Stats grid */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                {[
                  { label: "Departments", value: groups.length },
                  { label: "Categories", value: totalCategories },
                  { label: "Suppliers", value: supplierTotal },
                  { label: "Products", value: productTotal },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-brand-800/60 px-5 py-4 text-center">
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-brand-200">
                      {label}
                    </dt>
                    <dd className="mt-1 font-heading text-3xl font-bold text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Quick CTA card */}
              <div className="mt-4 rounded-2xl bg-white p-4 text-ink-900">
                <div className="flex items-center gap-2">
                  <Star aria-hidden="true" className="size-4 fill-gold-400 text-gold-400" />
                  <p className="text-xs font-semibold text-ink-800">Need it fast?</p>
                </div>
                <p className="mt-1 text-sm text-ink-700">
                  Submit one quote — we&apos;ll route it to verified suppliers.
                </p>
                <Link href={ROUTES.MARKETPLACE_QUOTE} className="mt-3 block">
                  <Button size="sm" className="w-full gap-1.5">
                    <FileText aria-hidden="true" className="size-3.5" />
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky category tab navigation ───────────────────────── */}
      {tabs.length > 0 && <CategoryGroupTabs tabs={tabs} />}

      {/* ── Category sections ────────────────────────────────────── */}
      <div className="container-page py-10 space-y-12">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-ink-500">
            No categories yet. Run{" "}
            <code className="rounded bg-ink-100 px-1 font-mono text-xs">pnpm db:seed</code>{" "}
            in the backend to populate.
          </div>
        ) : (
          groups.map((group, i) => (
            <CategoryGroupSection
              key={group.slug}
              group={group}
              items={childrenByGroup[group.slug] ?? []}
              index={i}
            />
          ))
        )}
      </div>

      {/* ── Are you a service provider? ──────────────────────────── */}
      <section className="border-t border-border/60 bg-brand-950 text-white">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-eyebrow mb-2 text-gold-300">For Businesses</p>
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                Are you a service provider?
              </h2>
              <p className="mt-2 max-w-md text-sm text-brand-200">
                List your business on Alivia Marketplace and connect directly with
                buyers who need exactly what you offer.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href={ROUTES.MARKETPLACE_QUOTE}>
                <Button
                  size="lg"
                  className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300"
                >
                  <Sparkles aria-hidden="true" className="size-4" />
                  Get Listed Free
                </Button>
              </Link>
              <a href="tel:+8801700000000">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  Talk to us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="container-page section-y-sm">
        <div className="rounded-3xl border border-border/70 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-eyebrow mb-2">How it works</p>
          <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
            From request to quote in three steps
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Pick a category",
                desc: "Browse by build stage — raw materials, finishing, utilities, safety, or services.",
              },
              {
                step: "2",
                title: "Submit one form",
                desc: "Tell us what you need. We route it to verified Bangladeshi suppliers — no spam.",
              },
              {
                step: "3",
                title: "Compare & choose",
                desc: "Suppliers respond via phone or email, typically within 24 hours.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-border/60 bg-brand-50/60 p-5"
              >
                <div className="inline-flex size-9 items-center justify-center rounded-full bg-brand-700 font-heading text-base font-semibold text-white">
                  {item.step}
                </div>
                <p className="mt-3 font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-ink-600">{item.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex justify-center">
            <Link href={ROUTES.MARKETPLACE_QUOTE}>
              <Button size="lg" className="gap-2">
                <FileText aria-hidden="true" className="size-4" />
                Get a Quote Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
