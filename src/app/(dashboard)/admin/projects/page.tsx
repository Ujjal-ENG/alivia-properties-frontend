export const dynamic = "force-dynamic"

import Link from "next/link"
import { Building2, Plus } from "lucide-react"
import { getProjects } from "@/services/projects.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminProjectsTable } from "@/pages-sections/admin/admin-views"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

export default async function AdminProjectsPage() {
  const projects = await getProjects({ limit: 50 })

  return (
    <div>
      <DashboardPageHeader
        icon={Building2}
        eyebrow="Inventory"
        title="Projects"
        description="Manage Alivia’s own project showcase — create, edit, publish status, and feature."
        actions={(
          <Link href={ROUTES.ADMIN_PROJECT_CREATE}>
            <Button className="rounded-full bg-brand-700 text-white hover:bg-brand-800">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </Link>
        )}
      />
      <AdminProjectsTable projects={projects.data} />
    </div>
  )
}
