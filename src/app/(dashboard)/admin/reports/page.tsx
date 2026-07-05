export const dynamic = "force-dynamic"

import { Flag } from "lucide-react"
import { getInquiries } from "@/services/inquiries.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import type { Inquiry } from "@/types/inquiry.types"
import type { Report, ReportStatus } from "@/data/dummy-reports"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminReportsTable } from "@/pages-sections/admin/admin-views"

// Reports are stored as inquiries with type=REPORT. The selected reason is folded
// into the message as a "Reason: …" prefix by the report form — parse it back out.
function parseReason(message: string): { reason: string; details: string } {
  const match = message.match(/^Reason:\s*(.+?)\n\n([\s\S]*)$/)
  if (match) return { reason: match[1].trim(), details: match[2].trim() }
  return { reason: "Other", details: message }
}

function toReportStatus(status: Inquiry["status"]): ReportStatus {
  if (status === "new") return "open"
  if (status === "read") return "reviewed"
  return "resolved" // replied | closed
}

function toReport(inquiry: Inquiry): Report {
  const { reason, details } = parseReason(inquiry.message)
  return {
    id: inquiry.id,
    propertyId: inquiry.propertyId ?? "",
    propertyTitle: inquiry.propertyTitle,
    reason,
    name: inquiry.name,
    email: inquiry.email,
    message: details,
    status: toReportStatus(inquiry.status),
    createdAt: inquiry.createdAt,
  }
}

// Maps the report-status pill (ReportStatus) to the single-valued inquiry-status
// the backend filters on. NOTE: the backend inquiry `status` filter is
// single-valued (no OR support), and "resolved" folds onto inquiry "replied" —
// so inquiries with status "closed" only ever show up under the "All" reports
// tab, never under "Resolved". "all"/undefined → no status filter.
function reportStatusToInquiry(s?: string): string | undefined {
  if (s === "open") return "new"
  if (s === "reviewed") return "read"
  if (s === "resolved") return "replied"
  return undefined
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const inquiries = await getInquiries({
    page,
    limit: DASHBOARD_PAGE_SIZE,
    type: "report",
    status: reportStatusToInquiry(sp.status),
  })
  const reports = inquiries.data.map(toReport)

  return (
    <div>
      <DashboardPageHeader
        icon={Flag}
        eyebrow="Activity"
        title="Reports"
        description="Review user-submitted listing issues and resolve bad inventory quickly."
      />
      <AdminReportsTable
        key={`${page}-${sp.status ?? "all"}`}
        reports={reports}
        status={(sp.status as ReportStatus) ?? "all"}
      />
      <TablePagination meta={inquiries.meta} />
    </div>
  )
}
