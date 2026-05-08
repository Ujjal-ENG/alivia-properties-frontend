import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { SellerProfileForm } from "@/pages-sections/seller/seller-views"
import { getCurrentSeller } from "@/utils/dashboard-session"

export default async function SellerProfilePage() {
  const seller = await getCurrentSeller()

  return (
    <div>
      <DashboardPageHeader
        title="Profile"
        description="Update your public profile, contact info, and credentials."
      />
      <SellerProfileForm seller={seller} />
    </div>
  )
}
