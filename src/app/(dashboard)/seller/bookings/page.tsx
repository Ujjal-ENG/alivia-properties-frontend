export const dynamic = "force-dynamic"

import { getBookings } from "@/services/bookings.service"
import { getProperties } from "@/services/properties.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBookingsTable } from "@/pages-sections/admin/admin-views"
import { getCurrentSeller } from "@/utils/dashboard-session"

export default async function SellerBookingsPage() {
  const seller = await getCurrentSeller()
  const emptyPage = { data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } }
  const [bookings, properties] = await Promise.all([
    getBookings(),
    getProperties({ sellerId: seller.id, limit: 50 }).catch(() => emptyPage),
  ])

  const propertyIds = new Set(properties.data.map((property) => property.id))
  const relatedBookings = bookings.data.filter(
    (booking) => booking.propertyId && propertyIds.has(booking.propertyId),
  )

  return (
    <div>
      <DashboardPageHeader
        title="Bookings"
        description="Track consultation requests linked to your marketplace listings."
      />
      <AdminBookingsTable bookings={relatedBookings} />
    </div>
  )
}
