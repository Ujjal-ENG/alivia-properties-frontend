export const dynamic = "force-dynamic"

import { PackageSearch } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { SellerCataloguePanel } from "@/pages-sections/seller/seller-catalogue-panel"
import { marketplaceService } from "@/services/marketplace.service"

export default async function SellerMarketplaceCataloguePage() {
  const session = await auth()
  const token = session?.accessToken ?? ""

  const [suppliers, categories] = await Promise.all([
    token
      ? marketplaceService.sellerListSuppliers(token).catch(() => [])
      : Promise.resolve([]),
    marketplaceService.listCategories().catch(() => []),
  ])

  // Products attach to categories — the quote-able leaf nodes (they sit under a
  // department); fall back to the flat list if the tree isn't nested yet.
  const leafCategories = categories.filter((category) => category.parentSlug != null)

  return (
    <div>
      <DashboardPageHeader
        icon={PackageSearch}
        eyebrow="Marketplace"
        title="My Catalogue"
        description="Add the products and services buyers see on your supplier profile. Pick a category, upload a photo, and list size/spec variants so buyers can request a quote."
      />
      <SellerCataloguePanel
        token={token}
        initialSuppliers={suppliers}
        categories={leafCategories.length ? leafCategories : categories}
      />
    </div>
  )
}
