export const dynamic = "force-dynamic"

import { PenLine } from "lucide-react"
import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBlogEditorForm } from "@/pages-sections/admin/admin-blog-editor-form"

export default async function AdminBlogCreatePage() {
  const session = await auth()
  if (!session?.user) notFound()

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        icon={PenLine}
        eyebrow="Content studio"
        title="Create article"
        description="Draft, preview-ready content for the public real estate journal."
      />
      <AdminBlogEditorForm token={session.accessToken} />
    </div>
  )
}
