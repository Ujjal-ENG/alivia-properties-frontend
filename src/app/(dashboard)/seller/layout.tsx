import { sellerNav } from "@/config/dashboard-nav.config"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={sellerNav} roleLabel="Seller Workspace">
      {children}
    </DashboardShell>
  )
}
