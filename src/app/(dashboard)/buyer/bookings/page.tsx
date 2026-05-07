export const dynamic = "force-dynamic"

import { getBookings } from "@/services/bookings.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table"
import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge"
import { formatDateTime } from "@/utils/format-date"
import { getCurrentBuyer } from "@/utils/dashboard-session"
import type { Booking } from "@/types/booking.types"

export default async function BuyerBookingsPage() {
  const buyer = await getCurrentBuyer()
  const bookings = await getBookings({ userId: buyer.id })

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "type",
      header: "Consultation",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-900 capitalize">{row.consultationType}</p>
          <p className="text-xs text-ink-500">{row.propertyTitle ?? row.projectName ?? "General request"}</p>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (row) => `${row.preferredDate} · ${row.preferredTime}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <BookingStatusBadge status={row.status} />,
    },
    {
      key: "created",
      header: "Requested",
      render: (row) => formatDateTime(row.createdAt),
    },
  ]

  return (
    <div>
      <DashboardPageHeader
        title="My Bookings"
        description="See consultation requests and current confirmation status."
      />
      <DataTable columns={columns} data={bookings.data} />
    </div>
  )
}
