export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getProperty } from "@/services/properties.service"
import { PropertyForm } from "@/components/forms/property-form"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { getCurrentSeller } from "@/utils/dashboard-session"

interface SellerEditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function SellerEditPropertyPage({ params }: SellerEditPropertyPageProps) {
  const { id } = await params
  const seller = await getCurrentSeller()
  const property = await getProperty(id)

  if (!property.success || property.data.sellerId !== seller.id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Edit Property"
        description="Edit your listing details and availability."
        actions={(
          <Link href={ROUTES.SELLER_PROPERTIES}>
            <Button variant="outline" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
        )}
      />

      <PropertyForm mode="edit" initialProperty={property.data} />
    </div>
  )
}
