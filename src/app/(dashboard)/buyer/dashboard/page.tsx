export const dynamic = "force-dynamic"

import { getBuyerStats } from "@/services/dashboard.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { BuyerDashboardLocalView } from "@/pages-sections/buyer/buyer-views"
import { getCurrentBuyer } from "@/utils/dashboard-session"

export default async function BuyerDashboardPage() {
  const buyer = await getCurrentBuyer()
  const stats = await getBuyerStats(buyer.id)

  return (
    <div>
      <DashboardPageHeader
        title="Buyer Dashboard"
        description="Your shortlist, searches, bookings, and inquiries — in one place."
      />
      <BuyerDashboardLocalView
        buyer={buyer}
        inquiryCount={stats.totalInquiries}
        bookingCount={stats.totalBookings}
      />
    </div>
  )
}
