export const dynamic = "force-dynamic"

import { getInquiries } from "@/services/inquiries.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getCurrentSeller } from "@/utils/dashboard-session"
import { ROUTES } from "@/config/routes.config"

export default async function SellerInquiriesPage() {
  await getCurrentSeller()
  const inquiries = await getInquiries()

  return (
    <div>
      <DashboardPageHeader
        title="Inquiries"
        description="Review incoming buyer interest for your listings."
      />
      <AdminInquiriesTable
        inquiries={inquiries.data}
        basePath={ROUTES.SELLER_INQUIRIES}
      />
    </div>
  )
}
