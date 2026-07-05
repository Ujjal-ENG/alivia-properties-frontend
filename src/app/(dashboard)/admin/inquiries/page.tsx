export const dynamic = "force-dynamic"

import { MessageSquare } from "lucide-react"
import { getInquiries } from "@/services/inquiries.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import type { InquiryStatus, InquiryType } from "@/types/inquiry.types"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const inquiries = await getInquiries({
    page,
    limit: DASHBOARD_PAGE_SIZE,
    status: sp.status,
    type: sp.type,
  })

  return (
    <div>
      <DashboardPageHeader
        icon={MessageSquare}
        eyebrow="Activity"
        title="Inquiries"
        description="Manage property, project, general leads, plus Be a Supplier / Be an Investor applications. Filter by Supplier or Investor to see partner requests."
      />
      <AdminInquiriesTable
        key={`${page}-${sp.status ?? "all"}-${sp.type ?? "all"}`}
        inquiries={inquiries.data}
        status={(sp.status as InquiryStatus) ?? "all"}
        type={(sp.type as InquiryType) ?? "all"}
      />
      <TablePagination meta={inquiries.meta} />
    </div>
  )
}
