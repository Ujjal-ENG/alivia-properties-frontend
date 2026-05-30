import { buyerNav } from "@/config/dashboard-nav.config"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={buyerNav} roleLabel="Buyer Workspace">
      {children}
    </DashboardShell>
  )
}
