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
        description="Manage property, project, and general lead conversations."
      />
      <AdminInquiriesTable inquiries={inquiries.data} />
    </div>
  )
}
