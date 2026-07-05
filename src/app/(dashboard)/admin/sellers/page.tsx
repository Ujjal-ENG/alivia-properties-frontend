export const dynamic = "force-dynamic"

import { AlertCircle, UserCheck } from "lucide-react"
import { auth } from "@/auth"
import { usersService, loadErrorMessage } from "@/services/users.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminSellersTable } from "@/pages-sections/admin/admin-views"
import type { Seller } from "@/types/user.types"
import type { PaginationMeta } from "@/services/http-client"

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const session = await auth()
  const token = session?.accessToken

  let error: string | null = null
  let sellers: Seller[] = []
  let meta: PaginationMeta | undefined

  try {
    const res = await usersService.list(
      { page, limit: DASHBOARD_PAGE_SIZE, role: "SELLER", verified: sp.verified },
      token,
    )
    sellers = res.data as Seller[]
    meta = res.meta
  } catch (err) {
    error = loadErrorMessage(err)
  }

  return (
    <div>
      <DashboardPageHeader
        icon={UserCheck}
        eyebrow="People"
        title="Sellers"
        description="Track verification, listing performance, and seller credibility."
      />
      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Couldn&apos;t load sellers</p>
            <p className="mt-0.5 text-amber-700">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <AdminSellersTable
            key={`${page}-${sp.verified ?? "all"}`}
            sellers={sellers}
            verified={(sp.verified as "all" | "true" | "false") ?? "all"}
          />
          <TablePagination meta={meta} />
        </>
      )}
    </div>
  )
}
