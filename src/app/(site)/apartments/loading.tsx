import { SectionHeader } from "@/components/common/section-header"
import { SkProjectGrid } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <section className="section-y bg-ink-50">
      <div className="container-page space-y-8">
        <SectionHeader eyebrow="Apartments" title="Our developments." subtitle="Loading apartments…" />
        <SkProjectGrid count={6} />
      </div>
    </section>
  )
}
