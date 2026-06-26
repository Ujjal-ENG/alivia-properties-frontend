export const dynamic = "force-dynamic"

import { after } from "next/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Building2, Layers, Home, Phone, MessageCircle, ChevronRight } from "lucide-react"
import { getProject, recordProjectView } from "@/services/projects.service"
import { formatPriceRange } from "@/utils/format-price"
import { PROJECT_STATUS_STYLES } from "@/lib/constants"
import { ROUTES } from "@/config/routes.config"
import { Button } from "@/components/ui/button"
import { StructuredData } from "@/components/seo/structured-data"
import { siteConfig } from "@/config/site.config"

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

/** Convert a YouTube/Vimeo watch link to an embeddable iframe URL, else null. */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, "")
    if (host === "youtube.com") {
      const id = u.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params
  const res = await getProject(slug)
  if (!res.success) notFound()
  const project = res.data

  // Count this view *after* the response is sent, so the view-count write never
  // adds latency to the page render. Errors are swallowed — a failed analytics
  // ping must not surface to the visitor.
  after(() => {
    void recordProjectView(slug).catch(() => {})
  })

  const status = PROJECT_STATUS_STYLES[project.status]
  const handover = project.handoverDate
    ? new Date(project.handoverDate).toLocaleDateString("en-BD", { month: "long", year: "numeric" })
    : "TBA"

  // Video tour: external link → iframe embed when it's YouTube/Vimeo, otherwise a
  // direct <video>. Uploaded clips always render as <video>.
  const videoEmbed = project.videoUrl ? toEmbedUrl(project.videoUrl) : null
  const directVideos = [
    ...(project.videos ?? []),
    ...(project.videoUrl && !videoEmbed ? [project.videoUrl] : []),
  ]
  const hasVideo = Boolean(videoEmbed) || directVideos.length > 0

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.description,
    url: `${siteConfig.url}${ROUTES.PROJECT_DETAIL(project.slug)}`,
    image: project.coverImage,
    address: { "@type": "PostalAddress", addressLocality: project.area, addressRegion: project.division, addressCountry: "BD" },
  }

  return (
    <>
      <StructuredData data={schema} />

      {/* Breadcrumb */}
      <div className="bg-ink-50 border-b border-border">
        <div className="container-page py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.PROJECTS} className="hover:text-foreground">Projects</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{project.name}</span>
        </div>
      </div>

      <div className="container-page section-y">
        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8 h-72 md:h-96">
          <div className="col-span-2 row-span-2 relative">
            <Image src={project.galleryImages[0] ?? project.coverImage} alt={project.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          {project.galleryImages.slice(1, 5).map((img, i) => (
            <div key={i} className="relative hidden md:block">
              <Image src={img} alt={`${project.name} ${i + 2}`} fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.classes}`}>{status.label}</span>
                {project.featured && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 border border-gold-200">Featured</span>}
              </div>
              <h1 className="text-h1 mb-1">{project.name}</h1>
              <p className="text-lead italic text-muted-foreground">{project.tagline}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-600" />
                {project.address}
              </div>
            </div>

            {/* Overview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar,  label: "Handover",  value: handover },
                { icon: Building2, label: "Floors",    value: project.totalFloors != null ? `${project.totalFloors} Floors` : "—" },
                { icon: Home,      label: "Total Units", value: project.totalUnits != null ? `${project.totalUnits} Units` : "—" },
                { icon: Layers,    label: "Land Size",  value: project.landSize != null ? `${project.landSize} ${project.landSizeUnit ?? "katha"}` : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-ink-50 rounded-xl p-4 text-center">
                  <Icon className="h-4 w-4 text-brand-600 mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-h3 mb-3">About This Project</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
            </div>

            {/* Video tour */}
            {hasVideo && (
              <div>
                <h2 className="text-h3 mb-4">Video Tour</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {videoEmbed && (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-border sm:col-span-2">
                      <iframe
                        src={videoEmbed}
                        title={`${project.name} video tour`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {directVideos.map((src, i) => (
                    <video
                      key={i}
                      src={src}
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-xl border border-border bg-black object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unit price table */}
            <div>
              <h2 className="text-h3 mb-4">Unit Types & Pricing</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-xs uppercase text-muted-foreground">
                    <tr>
                      {["Type", "Size", "Price Range", "Available"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(project.units ?? []).map((unit) => (
                      <tr key={unit.type ?? unit.name} className="hover:bg-ink-50">
                        <td className="px-4 py-3 font-medium">{unit.type ?? unit.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{unit.size}</td>
                        <td className="px-4 py-3 text-brand-700 font-semibold">
                          {unit.priceFrom != null && unit.priceTo != null
                            ? formatPriceRange(unit.priceFrom, unit.priceTo)
                            : unit.price != null
                              ? formatPriceRange(unit.price, unit.price)
                              : "—"}
                        </td>
                        <td className="px-4 py-3">{unit.available ?? "—"}/{unit.total ?? unit.available ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-h3 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(project.amenities ?? []).map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-h3 mb-4">Specifications</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                {Object.entries(project.specifications ?? {}).map(([key, value], i) => (
                  <div key={key} className={`grid grid-cols-2 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-ink-50" : "bg-white"}`}>
                    <span className="font-medium text-muted-foreground">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div>
              <h2 className="text-h3 mb-4">Nearby Landmarks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(project.nearbyLandmarks ?? []).map((l) => (
                  <div key={l.name} className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3 text-sm">
                    <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                    <span className="flex-1 font-medium">{l.name}</span>
                    <span className="text-muted-foreground">{l.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-brand-700 text-white rounded-2xl p-5 space-y-2">
              <p className="text-brand-200 text-sm">Price Range</p>
              <p className="text-2xl font-bold">{formatPriceRange(project.priceFrom ?? 0, project.priceTo ?? project.priceFrom ?? 0)}</p>
              <p className="text-brand-300 text-xs">Prices may vary per unit type and floor</p>
            </div>

            {/* Contact card */}
            <div className="bg-white rounded-2xl p-5 border border-border space-y-4">
              <h3 className="font-bold">Enquire About This Project</h3>
              <div className="space-y-2">
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors text-sm font-semibold">
                  <Phone className="h-4 w-4" /> {siteConfig.contact.phone}
                </a>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsApp}?text=I'm interested in ${project.name}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
                </a>
                <Link href={`${ROUTES.CONSULTATION}?project=${project.slug}`}>
                  <Button className="w-full mt-1" variant="outline">Book Site Visit</Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center">{siteConfig.contact.officeHours}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
