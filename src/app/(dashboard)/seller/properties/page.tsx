export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/auth"
import { getProperties } from "@/services/properties.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { SellerPropertiesTable } from "@/pages-sections/admin/admin-views"
import { getCurrentSeller } from "@/utils/dashboard-session"

export default async function SellerPropertiesPage() {
  const seller = await getCurrentSeller()
  const session = await auth()
  const emptyPage = { data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } }
  const properties = await getProperties(
    { sellerId: seller.id, limit: 50 },
    session?.accessToken,
  ).catch(() => emptyPage)

  return (
    <div>
      <DashboardPageHeader
        title="My Properties"
        description="Manage your active and pending property listings."
        actions={(
          <Link href={ROUTES.SELLER_PROPERTY_CREATE}>
            <Button className="rounded-full bg-brand-700 text-white hover:bg-brand-800">
              Add Property
            </Button>
          </Link>
        )}
      />
      <SellerPropertiesTable properties={properties.data} />
    </div>
  )
}
