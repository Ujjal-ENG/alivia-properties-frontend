import Image from "next/image"
import { ShieldCheck, Building2, Users, Clock } from "lucide-react"
import { siteConfig } from "@/config/site.config"
import { SectionHeader } from "@/components/common/section-header"
import { StatsSection } from "@/pages-sections/home/stats-section"

const MILESTONES = [
  { year: "2011", title: "Company Founded",     description: "Alivia Properties established in Dhaka with a vision to transform Bangladesh real estate." },
  { year: "2013", title: "First Apartment",        description: "Delivered Alivia Gardens — our first completed residential apartment in Uttara." },
  { year: "2016", title: "Marketplace Launch",   description: "Launched the online property marketplace connecting buyers, sellers, and renters across Bangladesh." },
  { year: "2019", title: "1,000 Families",       description: "Reached the milestone of 1,000 happy families across our projects and marketplace." },
  { year: "2022", title: "Digital Expansion",    description: "Launched our fully digital property listing and verification platform." },
  { year: "2025", title: "New Developments",     description: "Alivia Heights and Alivia Skyline announced as our most ambitious projects to date." },
]

export default function AboutUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink-900 text-white py-20">
        <div className="container-page max-w-3xl text-center">
          <p className="text-eyebrow text-gold-400 mb-3">About Alivia Properties</p>
          <h1 className="text-h1 text-white mb-4">Building Trust Since 2011</h1>
          <p className="text-lead text-ink-300">
            {siteConfig.description}
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-y bg-white">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-h3">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To become Bangladesh&apos;s most trusted and innovative real estate platform — making property ownership accessible, transparent, and rewarding for every Bangladeshi family.
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-h3">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To provide verified, high-quality real estate services through transparent processes, expert guidance, and technology — ensuring every transaction is safe, fair, and efficient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Founder */}
      <section className="section-y bg-ink-50">
        <div className="container-page">
          <SectionHeader eyebrow="Leadership" title="A Word from Our Founder" />
          <div className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-border shadow-card flex flex-col sm:flex-row gap-8 items-start">
            <div className="shrink-0">
              <div className="h-20 w-20 rounded-full bg-muted overflow-hidden">
                <Image src={siteConfig.founder.avatar} alt={siteConfig.founder.name} width={80} height={80} className="object-cover" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">
                &ldquo;{siteConfig.founder.message}&rdquo;
              </p>
              <p className="font-bold text-sm">{siteConfig.founder.name}</p>
              <p className="text-xs text-brand-600">{siteConfig.founder.title}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-y bg-white">
        <div className="container-page">
          <SectionHeader eyebrow="Our Journey" title="Milestones That Shaped Us" />
          <div className="mt-10 relative max-w-2xl mx-auto">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {MILESTONES.map(({ year, title, description }) => (
                <div key={year} className="pl-14 relative">
                  <div className="absolute left-0 h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                    {year.slice(2)}
                  </div>
                  <p className="text-xs text-brand-600 font-semibold mb-0.5">{year}</p>
                  <h4 className="font-bold text-sm mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust highlights */}
      <section className="section-y-sm bg-ink-50">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: ShieldCheck, label: "RAJUK Registered",  sub: "Fully compliant" },
              { icon: Building2,   label: "14+ Years",          sub: "In real estate" },
              { icon: Users,       label: "1,800+ Families",    sub: "Served with pride" },
              { icon: Clock,       label: "12 Apartments",        sub: "Delivered on time" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
