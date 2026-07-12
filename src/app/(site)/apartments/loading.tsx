import { SectionHeader } from "@/components/common/section-header"
import { SkProjectGrid } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <section className="section-y bg-ink-50">
      <div className="container-page space-y-8">
        <SectionHeader eyebrow="Projects" title="Our developments." subtitle="Loading projects…" />
        <SkProjectGrid count={6} />
      </div>
    </section>
  )
}
