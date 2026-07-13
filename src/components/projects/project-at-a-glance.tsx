import {
  Bath,
  BedDouble,
  Building2,
  CalendarCheck2,
  Grid3X3,
  Home,
  Layers3,
  MapPin,
  Ruler,
  type LucideIcon,
} from "lucide-react"
import type { ProjectFact, ProjectFactKey } from "./project-facts"

const FACT_ICONS: Record<ProjectFactKey, LucideIcon> = {
  address: MapPin,
  landArea: Layers3,
  floors: Building2,
  totalUnits: Home,
  availableUnits: Grid3X3,
  unitSize: Ruler,
  bedrooms: BedDouble,
  bathrooms: Bath,
  handover: CalendarCheck2,
}

export function ProjectAtAGlance({ facts }: { facts: ProjectFact[] }) {
  if (facts.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-border px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          Essential details
        </p>
        <h2 className="mt-1 text-xl font-bold text-ink-900">Project at a glance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {facts.map((fact, index) => {
              const Icon = FACT_ICONS[fact.key]
              return (
                <tr
                  key={fact.key}
                  className={index % 2 === 0 ? "bg-ink-50/70" : "bg-white"}
                >
                  <th
                    scope="row"
                    className="w-[43%] border-b border-r border-border/80 px-4 py-3.5 align-top font-medium text-muted-foreground last:border-b-0"
                  >
                    <span className="flex items-start gap-2">
                      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      <span>{fact.label}</span>
                    </span>
                  </th>
                  <td className="border-b border-border/80 px-4 py-3.5 font-semibold leading-5 text-ink-900 last:border-b-0">
                    {fact.value}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
