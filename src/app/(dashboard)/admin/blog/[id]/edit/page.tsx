export const dynamic = "force-dynamic"

import { PenLine } from "lucide-react"
import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBlogEditorForm } from "@/pages-sections/admin/admin-blog-editor-form"
import { blogService } from "@/services/blog.service"

type AdminBlogEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminBlogEditPage({ params }: AdminBlogEditPageProps) {
  const session = await auth()
  const { id } = await params
  const post = await blogService.adminDetail(id, session?.accessToken).catch(() => null)

  if (!session?.user || !post) notFound()

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        icon={PenLine}
        eyebrow="Content studio"
        title="Edit article"
        description="Update the article body, metadata, draft state, and publishing details."
      />
      <AdminBlogEditorForm post={post} token={session.accessToken} />
    </div>
  )
}
