export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/properties/property-card"
import { ROUTES } from "@/config/routes.config"
import { propertiesService } from "@/services/properties.service"

export default async function BuyerSavedPropertiesPage() {
  const session = await auth()
  const saved = await propertiesService.saved(session?.accessToken).catch(() => ({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  }))

  return (
    <div>
      <DashboardPageHeader
        title="Saved Properties"
        description="Properties you've saved for easy access."
        actions={(
          <Link href={ROUTES.PROPERTIES}>
            <Button variant="outline" className="rounded-full">Browse Listings</Button>
          </Link>
        )}
      />

      {saved.data.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-ink-700">No saved properties yet</p>
          <p className="mt-1 text-xs text-ink-400">Heart a listing to keep it in your shortlist.</p>
          <Link href={ROUTES.PROPERTIES} className="mt-4">
            <Button variant="outline" size="sm" className="rounded-full">Browse Listings</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.data.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      )}
    </div>
  )
}
