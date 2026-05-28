export const dynamic = "force-dynamic"

import { Users } from "lucide-react"
import { getUsers } from "@/services/users.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminUsersTable } from "@/pages-sections/admin/admin-views"

export default async function AdminUsersPage() {
  const users = await getUsers()
  const rows = [
    ...users.data.admins.map((admin) => ({ ...admin, roleLabel: "Admin" as const })),
    ...users.data.sellers.map((seller) => ({ ...seller, roleLabel: "Seller" as const })),
    ...users.data.buyers.map((buyer) => ({ ...buyer, roleLabel: "Buyer" as const })),
  ]

  return (
    <div>
      <DashboardPageHeader
        icon={Users}
        eyebrow="People"
        title="Users"
        description="Review all admin, seller, and buyer accounts from one table."
      />
      <AdminUsersTable users={rows} />
    </div>
  )
}
