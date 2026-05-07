import { Flag } from "lucide-react"
import { DUMMY_REPORTS } from "@/data/dummy-reports"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminReportsTable } from "@/pages-sections/admin/admin-views"

export default function AdminReportsPage() {
  return (
    <div>
      <DashboardPageHeader
        icon={Flag}
        eyebrow="Activity"
        title="Reports"
        description="Review user-submitted listing issues and resolve bad inventory quickly."
      />
      <AdminReportsTable reports={DUMMY_REPORTS} />
    </div>
  )
}
