export const dynamic = "force-dynamic"

import { UserCheck } from "lucide-react"
import { getSellers } from "@/services/users.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminSellersTable } from "@/pages-sections/admin/admin-views"

export default async function AdminSellersPage() {
  const sellers = await getSellers()

  return (
    <div>
      <DashboardPageHeader
        icon={UserCheck}
        eyebrow="People"
        title="Sellers"
        description="Track verification, listing performance, and seller credibility."
      />
      <AdminSellersTable sellers={sellers} />
    </div>
  )
}
