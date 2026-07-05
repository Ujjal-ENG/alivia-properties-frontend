export const dynamic = "force-dynamic"

import { Clock3 } from "lucide-react"
import { auth } from "@/auth"
import { getProperties } from "@/services/properties.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminPropertiesTable } from "@/pages-sections/admin/admin-views"

export default async function AdminPendingListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const session = await auth()
  const res = await getProperties(
    { page, limit: DASHBOARD_PAGE_SIZE, status: "pending" },
    session?.accessToken,
  )

  return (
    <div>
      <DashboardPageHeader
        icon={Clock3}
        eyebrow="Inventory"
        title="Pending Listings"
        description="Fast review queue for incoming seller submissions."
      />
      <AdminPropertiesTable
        key={String(page)}
        properties={res.data}
        status="pending"
        hideFilters
      />
      <TablePagination meta={res.meta} />
    </div>
  )
}
