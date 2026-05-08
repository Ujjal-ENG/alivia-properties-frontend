import { buyerNav } from "@/config/dashboard-nav.config"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/utils/dashboard-auth"

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("buyer")

  return (
    <DashboardShell nav={buyerNav} roleLabel="Buyer Workspace">
      {children}
    </DashboardShell>
  )
}
