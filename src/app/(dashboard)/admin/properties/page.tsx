export const dynamic = "force-dynamic"

import { Home } from "lucide-react"
import { getProperties } from "@/services/properties.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminPropertiesTable } from "@/pages-sections/admin/admin-views"

export default async function AdminPropertiesPage() {
  const properties = await getProperties({ limit: 50 })

  return (
    <div>
      <DashboardPageHeader
        icon={Home}
        eyebrow="Inventory"
        title="Properties"
        description="Approve, reject, verify, feature, or remove marketplace listings."
      />
      <AdminPropertiesTable properties={properties.data} />
    </div>
  )
}
