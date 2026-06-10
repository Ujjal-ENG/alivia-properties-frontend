export const dynamic = "force-dynamic"

import { PackageSearch } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminMaterialsCatalogPanel } from "@/pages-sections/admin/admin-materials-catalog-panel"
import { marketplaceService } from "@/services/marketplace.service"

export default async function AdminMarketplaceSuppliersPage() {
  const session = await auth()
  const token = session?.accessToken ?? ""

  const [categories, suppliers] = await Promise.all([
    marketplaceService
      .adminListCategories(token)
      .catch(() => marketplaceService.listCategories().catch(() => [])),
    // limit is capped at 100 by PaginationQueryDto; fall back to the public
    // suppliers endpoint if the admin call fails (e.g. missing/expired token).
    marketplaceService
      .adminListSuppliers({ limit: 100 }, token)
      .then((res) => res.data)
      .catch(() =>
        marketplaceService
          .listSuppliers({ limit: 100 })
          .then((res) => res.data)
          .catch(() => []),
      ),
  ])

  // Suppliers attach to sub-categories (the quote-able leaves); groups are
  // organisational only. Fall back to all categories if none are nested yet.
  const subCategories = categories.filter((category) => category.parentSlug != null)

  return (
    <div>
      <DashboardPageHeader
        icon={PackageSearch}
        eyebrow="Marketplace"
        title="Suppliers & Services"
        description="Manage Bangladesh suppliers, service providers, and their catalogue lines across every marketplace sub-category. Buyer-facing quote variants are configured under Marketplace -> Categories."
      />
      <AdminMaterialsCatalogPanel
        token={token}
        categories={subCategories.length ? subCategories : categories}
        initialSuppliers={suppliers}
      />
    </div>
  )
}
