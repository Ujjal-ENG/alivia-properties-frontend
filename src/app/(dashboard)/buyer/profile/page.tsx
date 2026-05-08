import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { BuyerProfileForm } from "@/pages-sections/admin/admin-views"
import { getCurrentBuyer } from "@/utils/dashboard-session"

export default async function BuyerProfilePage() {
  const buyer = await getCurrentBuyer()

  return (
    <div>
      <DashboardPageHeader
        title="Profile"
        description="Update your profile and contact information."
      />
      <BuyerProfileForm buyer={buyer} />
    </div>
  )
}
