export const dynamic = "force-dynamic"

import { CalendarCheck } from "lucide-react"
import { getBookings } from "@/services/bookings.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBookingsTable } from "@/pages-sections/admin/admin-views"

export default async function AdminBookingsPage() {
  const bookings = await getBookings()

  return (
    <div>
      <DashboardPageHeader
        icon={CalendarCheck}
        eyebrow="Activity"
        title="Bookings"
        description="Confirm, cancel, and track consultation and site-visit requests."
      />
      <AdminBookingsTable bookings={bookings.data} />
    </div>
  )
}
