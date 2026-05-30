export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { ROUTES } from "@/config/routes.config"
import { MarketplaceQuoteDetailPanel } from "@/pages-sections/marketplace-quotes/marketplace-quote-detail-panel"
import { quotesService } from "@/services/quotes.service"
import { getCurrentSeller } from "@/utils/dashboard-session"

type SellerMarketplaceQuoteDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function SellerMarketplaceQuoteDetailPage({
  params,
}: SellerMarketplaceQuoteDetailPageProps) {
  await getCurrentSeller()
  const session = await auth()
  const { id } = await params
  const quote = await quotesService.detail(id, session?.accessToken).catch(() => null)

  if (!quote) notFound()

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        title="Marketplace quote"
        description="Respond to buyer requirements assigned to your supplier profile."
      />
      <MarketplaceQuoteDetailPanel
        quote={quote}
        token={session?.accessToken}
        role="seller"
        backHref={ROUTES.SELLER_MARKETPLACE_QUOTES}
      />
    </div>
  )
}
