export const dynamic = "force-dynamic"

import { TrendingUp } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { ROUTES } from "@/config/routes.config"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"
import { getInquiries } from "@/services/inquiries.service"

export default async function AdminInvestorRequestsPage() {
  // Server-side filter to investor applications only ("Be an Investor" form).
  const inquiries = await getInquiries({ type: "investor", limit: 100 })

  return (
    <div>
      <DashboardPageHeader
        icon={TrendingUp}
        eyebrow="Partners"
        title="Investor Requests"
        description="Applications from the “Be an Investor” button — review interest, budget, and follow up with curated opportunities."
      />
      <AdminInquiriesTable
        inquiries={inquiries.data}
        lockedType="investor"
        basePath={ROUTES.ADMIN_INQUIRIES}
      />
    </div>
  )
}
