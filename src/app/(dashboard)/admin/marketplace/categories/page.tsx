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
        title="Taxonomy"
        description="Manage the Department → Category → Subcategory tree. Subcategories carry the image tile and quote configuration shown in the customer wizard. Images are stored in MinIO."
      />
      <AdminMarketplaceCategoriesPanel initialCategories={categories} />
    </div>
  )
}
