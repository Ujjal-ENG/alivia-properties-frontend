import Link from "next/link"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { SavedPropertiesView } from "@/pages-sections/buyer/buyer-views"
import { getCurrentBuyer } from "@/utils/dashboard-session"

export default async function BuyerSavedPropertiesPage() {
  const buyer = await getCurrentBuyer()

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
      <SavedPropertiesView fallbackIds={buyer.savedProperties} />
    </div>
  )
}
