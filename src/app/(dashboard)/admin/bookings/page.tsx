export const dynamic = "force-dynamic"

import { CalendarCheck } from "lucide-react"
import { getBookings } from "@/services/bookings.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminBookingsTable } from "@/pages-sections/admin/admin-views"
import type { BookingStatus } from "@/types/booking.types"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const res = await getBookings({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status })

  return (
    <div>
      <DashboardPageHeader
        icon={CalendarCheck}
        eyebrow="Activity"
        title="Bookings"
        description="Confirm, cancel, and track consultation and site-visit requests."
      />
      <AdminBookingsTable
        key={`${page}-${sp.status ?? "all"}`}
        bookings={res.data}
        status={(sp.status as BookingStatus) ?? "all"}
      />
      <TablePagination meta={res.meta} />
    </div>
  )
}
