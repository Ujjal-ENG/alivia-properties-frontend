export const dynamic = "force-dynamic"

import { Building2 } from "lucide-react"
import { getProjects } from "@/services/projects.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminProjectsTable } from "@/pages-sections/admin/admin-views"

export default async function AdminProjectsPage() {
  const projects = await getProjects({ limit: 24 })

  return (
    <div>
      <DashboardPageHeader
        icon={Building2}
        eyebrow="Inventory"
        title="Projects"
        description="Manage Alivia’s own project showcase and status labels."
      />
      <AdminProjectsTable projects={projects.data} />
    </div>
  )
}
