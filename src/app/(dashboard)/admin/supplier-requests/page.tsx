export const dynamic = "force-dynamic"

import { Store } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { ROUTES } from "@/config/routes.config"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getInquiries } from "@/services/inquiries.service"

export default async function AdminSupplierRequestsPage() {
  // Server-side filter to supplier applications only ("Be a Supplier" form).
  const inquiries = await getInquiries({ type: "supplier", limit: 100 })

  return (
    <div>
      <DashboardPageHeader
        icon={Store}
        eyebrow="Partners"
        title="Supplier Requests"
        description="Applications from the “Be a Supplier” button — review, reply, and onboard new marketplace suppliers."
      />
      <AdminInquiriesTable
        inquiries={inquiries.data}
        lockedType="supplier"
        basePath={ROUTES.ADMIN_INQUIRIES}
      />
    </div>
  )
}
