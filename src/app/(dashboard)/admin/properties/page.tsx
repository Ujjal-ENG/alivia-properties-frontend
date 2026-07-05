export const dynamic = "force-dynamic"

import { Home } from "lucide-react"
import { auth } from "@/auth"
import { getProperties } from "@/services/properties.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminPropertiesTable } from "@/pages-sections/admin/admin-views"
import type { PropertyStatus } from "@/types/property.types"

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const session = await auth()
  const res = await getProperties(
    { page, limit: DASHBOARD_PAGE_SIZE, status: sp.status },
    session?.accessToken,
  )

  return (
    <div>
      <DashboardPageHeader
        icon={Home}
        eyebrow="Inventory"
        title="Properties"
        description="Approve, reject, verify, feature, or remove marketplace listings."
      />
      <AdminPropertiesTable
        key={`${page}-${sp.status ?? "all"}`}
        properties={res.data}
        status={(sp.status as PropertyStatus | "all") ?? "all"}
      />
      <TablePagination meta={res.meta} />
    </div>
  )
}
