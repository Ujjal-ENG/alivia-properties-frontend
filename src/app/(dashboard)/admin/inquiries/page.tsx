export const dynamic = "force-dynamic"

import { MessageSquare } from "lucide-react"
import { getInquiries } from "@/services/inquiries.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries()

  return (
    <div>
      <DashboardPageHeader
        icon={MessageSquare}
        eyebrow="Activity"
        title="Inquiries"
        description="Manage property, project, general leads, plus Be a Supplier / Be an Investor applications. Filter by Supplier or Investor to see partner requests."
      />
      <AdminInquiriesTable inquiries={inquiries.data} />
    </div>
  )
}
