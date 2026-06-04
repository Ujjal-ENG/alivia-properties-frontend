export const dynamic = "force-dynamic"

import { AlertCircle, UserCheck } from "lucide-react"
import { getSellers } from "@/services/users.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminSellersTable } from "@/pages-sections/admin/admin-views"

export default async function AdminSellersPage() {
  const { sellers, error } = await getSellers()

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
        <AdminSellersTable sellers={sellers} />
      )}
    </div>
  )
}
