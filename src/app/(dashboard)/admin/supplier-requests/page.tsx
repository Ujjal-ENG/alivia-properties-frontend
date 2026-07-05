export const dynamic = "force-dynamic"

import { Store } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { ROUTES } from "@/config/routes.config"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getInquiries } from "@/services/inquiries.service"
import type { InquiryStatus } from "@/types/inquiry.types"

export default async function AdminSupplierRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  // Server-side filter to supplier applications only ("Be a Supplier" form).
  // Type is locked to "supplier" server-side, so we never read/pass sp.type.
  const inquiries = await getInquiries({
    page,
    limit: DASHBOARD_PAGE_SIZE,
    type: "supplier",
    status: sp.status,
  })

  return (
    <div>
      <DashboardPageHeader
        icon={Store}
        eyebrow="Partners"
        title="Supplier Requests"
        description="Applications from the “Be a Supplier” button — review, reply, and onboard new marketplace suppliers."
      />
      <AdminInquiriesTable
        key={`${page}-${sp.status ?? "all"}`}
        inquiries={inquiries.data}
        lockedType="supplier"
        basePath={ROUTES.ADMIN_INQUIRIES}
        status={(sp.status as InquiryStatus) ?? "all"}
      />
      <TablePagination meta={inquiries.meta} />
    </div>
  )
}
