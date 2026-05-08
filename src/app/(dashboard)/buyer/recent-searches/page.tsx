import Link from "next/link"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { RecentSearchesView } from "@/pages-sections/buyer/buyer-views"
import { getCurrentBuyer } from "@/utils/dashboard-session"

export default async function BuyerRecentSearchesPage() {
  const buyer = await getCurrentBuyer()

  return (
    <div>
      <DashboardPageHeader
        title="Recent Searches"
        description="Your recent property searches, ready to run again."
        actions={(
          <Link href={ROUTES.PROPERTIES}>
            <Button variant="outline" className="rounded-full">Search Listings</Button>
          </Link>
        )}
      />
      <RecentSearchesView fallbackItems={buyer.recentSearches} />
    </div>
  )
}
