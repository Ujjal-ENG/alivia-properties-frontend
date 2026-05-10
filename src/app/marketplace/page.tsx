import type { Metadata } from "next"
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero"
import { CategoryTabs } from "@/components/marketplace/CategoryTabs"
import { CategorySection } from "@/components/marketplace/CategorySection"
import { SupplierCTA } from "@/components/marketplace/SupplierCTA"
import { HowItWorks } from "@/components/marketplace/HowItWorks"
import { marketplaceGroups } from "@/data/marketplaceCategories"

export const metadata: Metadata = {
  title: "Marketplace — Alivia Properties",
  description:
    "Find trusted suppliers, building materials, finishing products, utility items, and property services in one place.",
}

export default function MarketplacePage() {
  return (
    <main className="bg-white">
      <MarketplaceHero />

      {/*
        CategoryTabs is intentionally outside the container-page div.
        position:sticky only works when no ancestor has overflow:hidden/auto.
        Placing it directly inside <main> avoids that risk entirely.
      */}
      <CategoryTabs groups={marketplaceGroups} />

      <div className="container-page pb-10 sm:pb-12">
        <div id="categories" className="space-y-12">
          {marketplaceGroups.map(group => (
            <CategorySection key={group.slug} group={group} />
          ))}
        </div>

        <div className="mt-14 space-y-10">
          <SupplierCTA />

          <div>
            <div className="mb-4">
              <p className="text-eyebrow mb-1">Process</p>
              <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">How it works</h2>
              <p className="mt-1 text-sm text-ink-600">Three simple steps from category to quote.</p>
            </div>
            <HowItWorks />
          </div>
        </div>
      </div>
    </main>
  )
}
