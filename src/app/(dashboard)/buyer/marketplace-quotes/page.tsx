export const dynamic = "force-dynamic"

import { ClipboardList } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { BuyerMarketplaceQuotesTable } from "@/pages-sections/buyer/buyer-marketplace-quotes-table"
import { quotesService } from "@/services/quotes.service"
import type { QuoteStatus } from "@/types/quote.types"

export default async function BuyerMarketplaceQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const session = await auth()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const quotes = await quotesService
    .list({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status as QuoteStatus | undefined }, session?.accessToken)
    .catch(() => ({
      data: [],
      meta: { page: 1, limit: DASHBOARD_PAGE_SIZE, total: 0, totalPages: 0 },
    }))

  return (
    <div>
      <DashboardPageHeader
        icon={ClipboardList}
        eyebrow="Activity"
        title="Marketplace Quotes"
        description="Track your marketplace quote requests, supplier responses, and current status."
      />
      <BuyerMarketplaceQuotesTable
        quotes={quotes.data}
        status={(sp.status as QuoteStatus | undefined) ?? "all"}
      />
      <TablePagination meta={quotes.meta} />
    </div>
  )
}
