export const dynamic = "force-dynamic"

import { ClipboardList } from "lucide-react"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { AdminMarketplaceQuotesTable } from "@/pages-sections/admin/admin-marketplace-quotes-table"
import { quotesService } from "@/services/quotes.service"
import { usersService } from "@/services/users.service"
import type { QuoteStatus } from "@/types/quote.types"

export default async function AdminMarketplaceQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const session = await auth()
  const quotes = await quotesService
    .list({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status as QuoteStatus | undefined }, session?.accessToken)
    .catch(() => ({
      data: [],
      meta: { page: 1, limit: DASHBOARD_PAGE_SIZE, total: 0, totalPages: 0 },
    }))
  // Quotes are an admin-only workflow — a request can only be assigned to a
  // member of the admin team.
  const salesReps = await usersService
    .list({ role: "ADMIN", limit: 100 }, session?.accessToken)
    .then((res) => res.data)
    .catch(() => [])

  return (
    <div>
      <DashboardPageHeader
        icon={ClipboardList}
        eyebrow="Activity"
        title="Marketplace Quotes"
        description="Review quote requests submitted from marketplace suppliers, products, and categories."
      />
      <AdminMarketplaceQuotesTable
        quotes={quotes.data}
        salesReps={salesReps}
        status={(sp.status as QuoteStatus) ?? "all"}
        key={`${page}-${sp.status ?? "all"}`}
      />
      <TablePagination meta={quotes.meta} />
    </div>
  )
}
