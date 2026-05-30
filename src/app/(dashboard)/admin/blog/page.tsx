export const dynamic = "force-dynamic"

import { FileText } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"
import { blogService } from "@/services/blog.service"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBlogTable } from "@/pages-sections/admin/admin-views"
import { ROUTES } from "@/config/routes.config"

export default async function AdminBlogPage() {
  const session = await auth()
  const token = session?.accessToken
  const posts = await blogService.adminList({ limit: 50, status: "all" }, token).catch(() => ({
    data: [],
    meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
  }))

  return (
    <div>
      <DashboardPageHeader
        icon={FileText}
        eyebrow="Content"
        title="Blog"
        description="Create drafts, publish articles, and manage the public market journal."
        actions={
          <Link href={ROUTES.ADMIN_BLOG_CREATE}>
            <Button className="rounded-full">New article</Button>
          </Link>
        }
      />
      <AdminBlogTable posts={posts.data} token={token} />
    </div>
  )
}
