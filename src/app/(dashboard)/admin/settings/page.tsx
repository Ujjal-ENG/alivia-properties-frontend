import { Settings } from "lucide-react"
import { siteConfig } from "@/config/site.config"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminSettingsForm } from "@/pages-sections/admin/admin-views"

export default function AdminSettingsPage() {
  return (
    <div>
      <DashboardPageHeader
        icon={Settings}
        eyebrow="Content"
        title="Settings"
        description="Manage platform-wide site settings."
      />
      <AdminSettingsForm
        initialValues={{
          siteName: siteConfig.name,
          contactEmail: siteConfig.contact.email,
          phone: siteConfig.contact.phone,
        }}
      />
    </div>
  )
}
