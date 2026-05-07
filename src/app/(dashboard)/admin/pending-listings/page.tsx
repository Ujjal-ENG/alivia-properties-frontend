export const dynamic = "force-dynamic"

import { Clock3 } from "lucide-react"
import { getProperties } from "@/services/properties.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminPropertiesTable } from "@/pages-sections/admin/admin-views"

export default async function AdminPendingListingsPage() {
  const properties = await getProperties({ status: "pending", limit: 50 })

  return (
    <div>
      <DashboardPageHeader
        icon={Clock3}
        eyebrow="Inventory"
        title="Pending Listings"
        description="Fast review queue for incoming seller submissions."
      />
      <AdminPropertiesTable properties={properties.data} defaultStatus="pending" />
    </div>
  )
}
