export const dynamic = "force-dynamic"

import { getInquiries } from "@/services/inquiries.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getCurrentSeller } from "@/utils/dashboard-session"

export default async function SellerInquiriesPage() {
  const seller = await getCurrentSeller()
  const inquiries = await getInquiries({ sellerId: seller.id })

  return (
    <div>
      <DashboardPageHeader
        title="Inquiries"
        description="Review incoming buyer interest for your listings."
      />
      <AdminInquiriesTable inquiries={inquiries.data} />
    </div>
  )
}
