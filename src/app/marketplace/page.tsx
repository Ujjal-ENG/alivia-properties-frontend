import type { Metadata } from "next"
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero"
import { CategoryTabs } from "@/components/marketplace/CategoryTabs"
import { CategorySection } from "@/components/marketplace/CategorySection"
import { SupplierCTA } from "@/components/marketplace/SupplierCTA"
import { HowItWorks } from "@/components/marketplace/HowItWorks"
import { marketplaceGroups } from "@/data/marketplaceCategories"
import { marketplaceProducts } from "@/data/marketplaceProducts"
import { marketplaceSuppliers } from "@/data/marketplaceSuppliers"

export const metadata: Metadata = {
  title: "Marketplace — Alivia Properties",
  description:
    "Find trusted suppliers, building materials, finishing products, utility items, and property services in one place.",
}

export default function MarketplacePage() {
  const allCategories = marketplaceGroups.flatMap(group =>
    group.items.map(item => ({
      ...item,
      group: group.group,
    })),
  )

  const featuredCategories = ["sand", "lighting", "solar", "electrician"].flatMap(slug => {
    const match = allCategories.find(item => item.slug === slug)
    return match ? [match] : []
  })

  return (
    <main className="bg-linear-to-b from-brand-50/60 via-white to-white">
      <MarketplaceHero
        categoryCount={allCategories.length}
        featuredItems={featuredCategories}
        groupCount={marketplaceGroups.length}
        productCount={marketplaceProducts.length}
        supplierCount={marketplaceSuppliers.length}
      />

      {/*
        CategoryTabs is intentionally outside the container-page div.
        position:sticky only works when no ancestor has overflow:hidden/auto.
        Placing it directly inside <main> avoids that risk entirely.
      */}
      <CategoryTabs groups={marketplaceGroups} />

      <div className="container-page pb-14 pt-8 sm:pb-16 sm:pt-10">
        <section
          id="categories"
          className="rounded-[2rem] border border-border/70 bg-white/90 p-4 shadow-(--shadow-card) backdrop-blur sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-eyebrow mb-2">Browse By Build Stage</p>
              <h2 className="font-heading text-2xl font-semibold text-balance text-ink-900 sm:text-3xl">
                Real supplier discovery with category imagery that matches what buyers actually need.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-[15px]">
                Start from sand, steel, tiles, utilities, security, or service crews. Every lane uses
                real category visuals so users understand each section faster.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                `${marketplaceGroups.length} Master Groups`,
                `${allCategories.length} Live Categories`,
                `${marketplaceSuppliers.length} Suppliers`,
                `${marketplaceProducts.length} Products`,
              ].map(stat => (
                <span
                  key={stat}
                  className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800"
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-8 lg:space-y-10">
            {marketplaceGroups.map(group => (
              <CategorySection key={group.slug} group={group} />
            ))}
          </div>
        </section>

        <div className="mt-14 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <SupplierCTA />

          <section className="rounded-[2rem] border border-border/70 bg-white p-5 shadow-(--shadow-card) sm:p-6">
            <div className="mb-4 border-b border-border/60 pb-4">
              <p className="text-eyebrow mb-1">Process</p>
              <h2 className="font-heading text-2xl font-semibold text-balance text-ink-900 sm:text-3xl">
                How It Works
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Search, shortlist, then request a quote without losing trust signals.
              </p>
            </div>
            <HowItWorks />
          </section>
        </div>
      </div>
    </main>
  )
}
