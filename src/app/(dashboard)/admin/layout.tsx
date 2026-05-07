import { getDashboardStats } from "@/services/dashboard.service"
import { adminNav } from "@/config/dashboard-nav.config"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/utils/dashboard-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin")
  const stats = await getDashboardStats().catch(() => null)
  const pendingCount = stats?.data?.stats.pendingListings ?? 0

  return (
    <DashboardShell nav={adminNav} pendingCount={pendingCount} roleLabel="Admin Workspace">
      {children}
    </DashboardShell>
  )
}
