export const dynamic = "force-dynamic"

import { AlertCircle, Users } from "lucide-react"
import { getUsers } from "@/services/users.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminUsersTable } from "@/pages-sections/admin/admin-views"

export default async function AdminUsersPage() {
  const { data, error } = await getUsers()
  const rows = [
    ...data.admins.map((admin) => ({ ...admin, roleLabel: "Admin" as const })),
    ...data.sellers.map((seller) => ({ ...seller, roleLabel: "Seller" as const })),
    ...data.buyers.map((buyer) => ({ ...buyer, roleLabel: "Buyer" as const })),
  ]

  return (
    <div>
      <DashboardPageHeader
        icon={Users}
        eyebrow="People"
        title="Users"
        description="Review all admin, seller, and buyer accounts from one table."
      />
      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Couldn&apos;t load users</p>
            <p className="mt-0.5 text-amber-700">{error}</p>
          </div>
        </div>
      ) : (
        <AdminUsersTable users={rows} />
      )}
    </div>
  )
}
