import { Building2, Users, Clock, Home } from "lucide-react"
import { siteConfig } from "@/config/site.config"

const STATS = [
  { icon: Building2, value: `${siteConfig.stats.projectsCompleted}+`, label: "Projects Delivered" },
  { icon: Users,     value: `${siteConfig.stats.happyFamilies.toLocaleString()}+`, label: "Happy Families" },
  { icon: Clock,     value: `${siteConfig.stats.yearsExperience}+`, label: "Years Experience" },
  { icon: Home,      value: `${siteConfig.stats.totalListings}+`, label: "Active Listings" },
]

export function StatsSection() {
  return (
    <section className="section-y bg-brand-700 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-brand-200">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
