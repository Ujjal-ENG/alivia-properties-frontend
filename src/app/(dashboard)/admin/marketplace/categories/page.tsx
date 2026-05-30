export const dynamic = "force-dynamic"

import { LayoutGrid } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminMarketplaceCategoriesPanel } from "@/pages-sections/admin/admin-marketplace-categories"
import { marketplaceService } from "@/services/marketplace.service"

export default async function AdminMarketplaceCategoriesPage() {
  const session = await auth()

  const categories = session?.accessToken
    ? await marketplaceService
        .adminListCategories(session.accessToken)
        .catch(() => marketplaceService.listCategories().catch(() => []))
    : await marketplaceService.listCategories().catch(() => [])

  return (
    <div>
      <DashboardPageHeader
        icon={LayoutGrid}
        eyebrow="Marketplace"
        title="Categories"
        description="Create and manage marketplace category groups and sub-categories. Images are stored in MinIO."
      />
      <AdminMarketplaceCategoriesPanel initialCategories={categories} />
    </div>
  )
}
