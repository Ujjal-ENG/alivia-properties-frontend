import { FileText } from "lucide-react"
import { DUMMY_BLOG_POSTS } from "@/data/dummy-blog-posts"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { AdminBlogTable } from "@/pages-sections/admin/admin-views"

export default function AdminBlogPage() {
  return (
    <div>
      <DashboardPageHeader
        icon={FileText}
        eyebrow="Content"
        title="Blog"
        description="Publish and manage market journal articles."
      />
      <AdminBlogTable posts={DUMMY_BLOG_POSTS} />
    </div>
  )
}
