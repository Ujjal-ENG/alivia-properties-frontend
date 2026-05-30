export const dynamic = "force-dynamic"

import { getInquiries } from "@/services/inquiries.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table"
import { InquiryStatusBadge } from "@/components/dashboard/inquiry-status-badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { formatDateTime } from "@/utils/format-date"
import { getCurrentBuyer } from "@/utils/dashboard-session"
import Link from "next/link"
import { Eye } from "lucide-react"
import type { Inquiry } from "@/types/inquiry.types"

export default async function BuyerInquiriesPage() {
  await getCurrentBuyer()
  const inquiries = await getInquiries()

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
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Link href={ROUTES.BUYER_INQUIRY_DETAIL(row.id)}>
          <Button size="sm" variant="outline" className="rounded-full">
            <Eye className="size-3.5" />
            View
          </Button>
        </Link>
      ),
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
