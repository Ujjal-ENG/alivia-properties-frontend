export const dynamic = "force-dynamic"

import { Users } from "lucide-react"
import { DUMMY_ADMIN } from "@/data/dummy-users"
import { getUsers } from "@/services/users.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminUsersTable } from "@/pages-sections/admin/admin-views"

export default async function AdminUsersPage() {
  const users = await getUsers()
  const rows = [
    { ...DUMMY_ADMIN, roleLabel: "Admin" },
    ...users.data.sellers.map((seller) => ({ ...seller, roleLabel: "Seller" })),
    ...users.data.buyers.map((buyer) => ({ ...buyer, roleLabel: "Buyer" })),
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
