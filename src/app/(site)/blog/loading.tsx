import { SectionHeader } from "@/components/common/section-header"
import { SkBlogGrid } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <section className="section-y">
      <div className="container-page space-y-8">
        <SectionHeader eyebrow="Blog" title="Market insights." subtitle="Loading articles…" />
        <SkBlogGrid count={6} />
      </div>
    </section>
  )
}
