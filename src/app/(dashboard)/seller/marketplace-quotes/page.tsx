export const dynamic = "force-dynamic"

import { ClipboardList } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { ROUTES } from "@/config/routes.config"
import { AdminMarketplaceQuotesTable } from "@/pages-sections/admin/admin-marketplace-quotes-table"
import { quotesService } from "@/services/quotes.service"

export default async function SellerMarketplaceQuotesPage() {
  const session = await auth()
  const quotes = await quotesService
    .list({ limit: 100 }, session?.accessToken)
    .catch(() => ({
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    }))

  return (
    <div>
      <DashboardPageHeader
        icon={ClipboardList}
        eyebrow="Activity"
        title="Marketplace Quotes"
        description="See quote requests submitted from marketplace products, suppliers, and categories."
      />
      <AdminMarketplaceQuotesTable
        quotes={quotes.data}
        detailBasePath={ROUTES.SELLER_MARKETPLACE_QUOTES}
      />
    </div>
  )
}
