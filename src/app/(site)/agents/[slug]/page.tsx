import { notFound } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, MapPin, Phone, MessageCircle, Mail, Clock, Languages, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/common/star-rating"
import { ReviewsSection } from "@/components/properties/reviews-section"
import { getAgent } from "@/services/agents.service"
import { getProperties } from "@/services/properties.service"
import { PropertyCard } from "@/components/properties/property-card"

export const dynamic = "force-dynamic"

const SPECIALTY_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  land: "Land",
  luxury: "Luxury",
  rental: "Rental",
}

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await getAgent(slug).catch(() => null)
  if (!res?.data) return notFound()
  const a = res.data

  const listings = await getProperties({ sellerId: a.id, limit: 6 }).catch(() => null)

  return (
    <div>
      <div className="relative h-44 w-full overflow-hidden bg-ink-100 sm:h-56">
        {a.coverImage && (
          <Image src={a.coverImage} alt="" fill className="object-cover" unoptimized priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
      </div>

      <div className="container-page -mt-16 pb-16">
        <div className="surface-card grid gap-4 p-5 md:grid-cols-3">
          <div className="flex items-start gap-4 md:col-span-2">
            <Avatar className="h-20 w-20 ring-4 ring-white">
              {a.avatar && <AvatarImage src={a.avatar} />}
              <AvatarFallback>{a.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h3">{a.name}</h1>
                {a.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
                {a.isFeatured && (
                  <span className="rounded bg-gold-50 px-2 py-0.5 text-[11px] font-medium text-gold-700">Featured</span>
                )}
              </div>
              <p className="text-sm text-ink-600">
                {a.companyName ?? a.licenseNumber} · {a.yearsExperience} yrs experience
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StarRating value={a.rating} count={a.reviewCount} size="sm" showValue />
                <span className="inline-flex items-center gap-1 text-xs text-ink-700">
                  <Clock className="h-3 w-3" /> ~{a.responseTimeHours}h reply
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-ink-700">
                  <Briefcase className="h-3 w-3" /> {a.activeListings} live · {a.closedDeals} closed
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">{a.bio}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.specialties.map(s => (
                  <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
                    {SPECIALTY_LABEL[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-2 rounded-xl bg-ink-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">Contact</p>
            <a href={`tel:${a.phone}`} className="flex items-center gap-2 text-sm text-ink-900 hover:text-brand-700">
              <Phone className="h-3.5 w-3.5" /> {a.phone}
            </a>
            {a.whatsApp && (
              <a href={`https://wa.me/${a.whatsApp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-ink-900 hover:text-success">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
            <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-sm text-ink-900 hover:text-brand-700">
              <Mail className="h-3.5 w-3.5" /> {a.email}
            </a>
            <div className="pt-2 text-xs text-ink-700">
              <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {a.serviceAreas.join(" · ")}</p>
              <p className="mt-1 flex items-center gap-1.5"><Languages className="h-3 w-3" /> {a.languages.join(" · ")}</p>
            </div>
            <Button className="mt-2 w-full" size="sm">Request callback</Button>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {listings && listings.data.length > 0 && (
              <section>
                <h2 className="text-h3 mb-3">Listings by {a.name.split(" ")[0]}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {listings.data.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              </section>
            )}
          </div>
          <div>
            <ReviewsSection targetType="agent" targetId={a.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
