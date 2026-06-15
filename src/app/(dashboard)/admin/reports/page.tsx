export const dynamic = "force-dynamic"

import { Flag } from "lucide-react"
import { getInquiries } from "@/services/inquiries.service"
import type { Inquiry } from "@/types/inquiry.types"
import type { Report, ReportStatus } from "@/data/dummy-reports"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
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

export default async function AdminReportsPage() {
  const inquiries = await getInquiries({ type: "report", limit: 100 })
  const reports = inquiries.data.map(toReport)

  return (
    <div>
      <DashboardPageHeader
        icon={Flag}
        eyebrow="Activity"
        title="Reports"
        description="Review user-submitted listing issues and resolve bad inventory quickly."
      />
      <AdminReportsTable reports={reports} />
    </div>
  )
}
