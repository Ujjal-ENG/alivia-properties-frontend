export const dynamic = "force-dynamic"

import { getInquiries } from "@/services/inquiries.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getCurrentSeller } from "@/utils/dashboard-session"
import { ROUTES } from "@/config/routes.config"
import type { InquiryStatus } from "@/types/inquiry.types"

export default async function SellerInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await getCurrentSeller()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  // Backend scopes results to the current seller via the JWT — no sellerId param.
  const inquiries = await getInquiries({
    page,
    limit: DASHBOARD_PAGE_SIZE,
    status: sp.status,
  })

  return (
    <div>
      <DashboardPageHeader
        title="Inquiries"
        description="Review incoming buyer interest for your listings."
      />
      <AdminInquiriesTable
        key={`${page}-${sp.status ?? "all"}`}
        inquiries={inquiries.data}
        basePath={ROUTES.SELLER_INQUIRIES}
        status={(sp.status as InquiryStatus) ?? "all"}
      />
      <TablePagination meta={inquiries.meta} />
    </div>
  )
}
