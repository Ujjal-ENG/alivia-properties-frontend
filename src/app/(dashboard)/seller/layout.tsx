import { sellerNav } from "@/config/dashboard-nav.config"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/utils/dashboard-auth"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("seller")

  return (
    <DashboardShell nav={sellerNav} roleLabel="Seller Workspace">
      {children}
    </DashboardShell>
  )
}
