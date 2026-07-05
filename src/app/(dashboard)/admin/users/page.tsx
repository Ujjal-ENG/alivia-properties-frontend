export const dynamic = "force-dynamic"

import { AlertCircle, Users } from "lucide-react"
import { auth } from "@/auth"
import { usersService, loadErrorMessage } from "@/services/users.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminUsersTable } from "@/pages-sections/admin/admin-views"
import type { User, UserRole } from "@/types/user.types"
import type { PaginationMeta } from "@/services/http-client"

const ROLE_LABELS: Record<UserRole, "Admin" | "Seller" | "Buyer"> = {
  admin: "Admin",
  seller: "Seller",
  buyer: "Buyer",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const session = await auth()
  const token = session?.accessToken

  let error: string | null = null
  let rows: (User & { roleLabel: "Admin" | "Seller" | "Buyer" })[] = []
  let meta: PaginationMeta | undefined

  try {
    const res = await usersService.list(
      { page, limit: DASHBOARD_PAGE_SIZE, role: sp.role ? sp.role.toUpperCase() : undefined },
      token,
    )
    rows = res.data.map((user) => ({ ...user, roleLabel: ROLE_LABELS[user.role] }))
    meta = res.meta
  } catch (err) {
    error = loadErrorMessage(err)
  }

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
        <>
          <AdminUsersTable
            key={`${page}-${sp.role ?? "all"}`}
            users={rows}
            role={(sp.role as UserRole | "all") ?? "all"}
          />
          <TablePagination meta={meta} />
        </>
      )}
    </div>
  )
}
