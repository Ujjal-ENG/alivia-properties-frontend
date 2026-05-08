export const dynamic = "force-dynamic"

import { getInquiries } from "@/services/inquiries.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table"
import { InquiryStatusBadge } from "@/components/dashboard/inquiry-status-badge"
import { formatDateTime } from "@/utils/format-date"
import { getCurrentBuyer } from "@/utils/dashboard-session"
import type { Inquiry } from "@/types/inquiry.types"

export default async function BuyerInquiriesPage() {
  const buyer = await getCurrentBuyer()
  const inquiries = await getInquiries({ buyerId: buyer.id })

  const columns: DataTableColumn<Inquiry>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-900">{row.propertyTitle ?? row.projectName ?? "General inquiry"}</p>
          <p className="text-xs text-ink-500 capitalize">{row.type}</p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row) => <p className="line-clamp-2 max-w-xl text-sm text-ink-600">{row.message}</p>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <InquiryStatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Sent",
      render: (row) => formatDateTime(row.createdAt),
    },
  ]

  return (
    <div>
      <DashboardPageHeader
        title="My Inquiries"
        description="Track every property and project message you have sent."
      />
      <DataTable columns={columns} data={inquiries.data} />
    </div>
  )
}
