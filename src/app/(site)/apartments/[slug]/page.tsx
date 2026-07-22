export const dynamic = "force-dynamic";

import { ProjectAtAGlance } from "@/components/projects/project-at-a-glance";
import { buildProjectFacts } from "@/components/projects/project-facts";
import { ProjectGallery } from "@/components/projects/project-gallery";
// 360° virtual tour temporarily disabled on the frontend — map option stays enabled.
// import { VirtualTour } from "@/components/properties/virtual-tour";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { siteConfig } from "@/config/site.config";
import { PROJECT_STATUS_STYLES } from "@/lib/constants";
import { parseProjectDescription } from "@/lib/project-description";
import { getProject, recordProjectView } from "@/services/projects.service";
import type { Project } from "@/types/project.types";
import { formatPrice, formatPriceRange } from "@/utils/format-price";
import { toMapEmbedUrl } from "@/utils/map-embed";
import {
  Building2,
  ChevronRight,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Convert a YouTube/Vimeo watch link to an embeddable iframe URL, else null. */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

// Admins paste the Google Maps share link into "Location" (see project-form.tsx);
// "Full Address" stays plain text. Try Location first — it's where the precise
// pin lives — then fall back to the written address.
function projectMapEmbedUrl(project: Project): string | null {
  return toMapEmbedUrl(project.location) ?? toMapEmbedUrl(project.address);
}

function projectLocationText(project: Project): string {
  return (
    [project.address, project.location, project.area, project.division].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0 && !/^https?:\/\//i.test(value.trim()),
    ) ?? "Apartment location"
  );
}

/** Group landmarks by their drive-time bucket, preserving first-seen order. */
function groupLandmarks(
  landmarks: { name: string; group: string }[],
): { group: string; names: string[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, string[]>();
  for (const { name, group } of landmarks) {
    if (!buckets.has(group)) {
      buckets.set(group, []);
      order.push(group);
    }
    buckets.get(group)!.push(name);
  }
  return order.map((group) => ({ group, names: buckets.get(group)! }));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const res = await getProject(slug);
  if (!res.success) notFound();
  const project = res.data;

  // Count this view *after* the response is sent, so the view-count write never
  // adds latency to the page render. Errors are swallowed — a failed analytics
  // ping must not surface to the visitor.
  after(() => {
    void recordProjectView(slug).catch(() => {});
  });

  const status = PROJECT_STATUS_STYLES[project.status];
  const handover = project.handoverDate
    ? new Date(project.handoverDate).toLocaleDateString("en-BD", {
        month: "long",
        year: "numeric",
      })
    : "TBA";

  // Video tour: external link → iframe embed when it's YouTube/Vimeo, otherwise a
  // direct <video>. Uploaded clips always render as <video>.
  const videoEmbed = project.videoUrl ? toEmbedUrl(project.videoUrl) : null;
  const directVideos = [
    ...(project.videos ?? []),
    ...(project.videoUrl && !videoEmbed ? [project.videoUrl] : []),
  ];
  const hasVideo = Boolean(videoEmbed) || directVideos.length > 0;
  const galleryImages = Array.from(
    new Set(
      [project.coverImage, ...project.galleryImages].filter(
        (image): image is string => Boolean(image),
      ),
    ),
  );
  const mapEmbedUrl = projectMapEmbedUrl(project);
  const locationText = projectLocationText(project);
  const projectFacts = buildProjectFacts({
    address: project.address,
    locationText,
    landSize: project.landSize,
    landSizeUnit: project.landSizeUnit,
    totalFloors: project.totalFloors,
    totalUnits: project.totalUnits,
    availableUnits: project.availableUnits,
    soldUnits: project.soldUnits,
    handover: project.handoverDate ? handover : undefined,
    units: project.units,
  });
  const landmarkGroups = groupLandmarks(project.nearbyLandmarks ?? []);
  const aboutProject = parseProjectDescription(project.description);
  const specificationEntries = Object.entries(project.specifications ?? {});
  const hasAboutProjectContent =
    aboutProject.specs.length > 0 ||
    aboutProject.highlights.length > 0 ||
    aboutProject.paragraphs.length > 0;
  const hasUnits = (project.units ?? []).length > 0;
  const hasViews = (project.views ?? []).length > 0;
  const hasAmenities = (project.amenities ?? []).length > 0;
  const hasSpecifications = specificationEntries.length > 0;
  const hasNearbyLandmarks = (project.nearbyLandmarks ?? []).length > 0;

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.description,
    url: `${siteConfig.url}${ROUTES.PROJECT_DETAIL(project.slug)}`,
    image: project.coverImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: project.area,
      addressRegion: project.division,
      addressCountry: "BD",
    },
  };

  return (
    <>
      <StructuredData data={schema} />

      {/* Breadcrumb */}
      <div className="bg-ink-50 border-b border-border">
        <div className="container-page py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.PROJECTS} className="hover:text-foreground">
            Apartments
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{project.name}</span>
        </div>
      </div>

      <div className="container-page section-y">
        {/* Gallery */}
        {galleryImages.length > 0 ? (
          <ProjectGallery images={galleryImages} label={project.name} />
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.classes}`}
                >
                  {status.label}
                </span>
                {project.featured && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 border border-gold-200">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-h1 mb-1">{project.name}</h1>
              <p className="text-lead italic text-muted-foreground">
                {project.tagline}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-600" />
                {locationText}
              </div>
            </div>

            {/* Description */}
            {hasAboutProjectContent ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-h3 mb-2">About This Apartment</h2>
                  <p className="text-sm text-muted-foreground">
                    A cleaner overview of the key details, layout, and standout
                    project points.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-border bg-linear-to-br from-white via-ink-50/60 to-white p-5 md:p-6">
                  {aboutProject.specs.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {aboutProject.specs.map((item) => (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="rounded-[1.25rem] border border-border/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                            {item.label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-ink-800">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {aboutProject.highlights.length > 0 ? (
                    <div
                      className={aboutProject.specs.length > 0 ? "mt-5" : ""}
                    >
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Highlights
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aboutProject.highlights.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50/70 px-3 py-1.5 text-xs font-medium text-brand-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {aboutProject.paragraphs.length > 0 ? (
                    <div
                      className={
                        aboutProject.specs.length > 0 ||
                        aboutProject.highlights.length > 0
                          ? "mt-5 space-y-3"
                          : "space-y-3"
                      }
                    >
                      {aboutProject.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-sm leading-relaxed text-muted-foreground"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* 360° virtual tour temporarily disabled on the frontend — map option stays enabled.
            <VirtualTour
              posterImage={galleryImages[0]}
              panoramaUrl={project.panoramaUrl}
              title="Virtual 360° Tour"
            />
            */}

            {mapEmbedUrl ? (
              <div>
                <h2 className="text-h3 mb-4">Location Map</h2>
                <iframe
                  src={mapEmbedUrl}
                  title={`${project.name} location map`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-80 w-full rounded-xl border border-border bg-ink-50"
                />
              </div>
            ) : null}

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
            {hasUnits ? (
              <div>
                <h2 className="text-h3 mb-4">Unit Types & Pricing</h2>
                <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin [scrollbar-color:var(--color-brand-300)_transparent]">
                  <table className="w-full text-sm">
                    <thead className="bg-ink-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        {["Type", "Size", "Price Range", "Available"].map(
                          (h) => (
                            <th
                              key={h}
                              className="whitespace-nowrap px-4 py-2.5 text-left font-semibold"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(project.units ?? []).map((unit) => (
                        <tr
                          key={unit.type ?? unit.name}
                          className="hover:bg-ink-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            {unit.type ?? unit.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {unit.size}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-brand-700 font-semibold">
                            {unit.priceFrom != null && unit.priceTo != null
                              ? formatPriceRange(unit.priceFrom, unit.priceTo)
                              : unit.price != null
                                ? formatPriceRange(unit.price, unit.price)
                                : "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {unit.available ?? "—"}/
                            {unit.total ?? unit.available ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Views & pricing — premium outlooks that lift the plot price */}
            {hasViews ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-h3 mb-2">Views &amp; Pricing</h2>
                  <p className="text-sm text-muted-foreground">
                    Premium outlooks that influence the final price — pick the
                    view that fits your budget.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(project.views ?? []).map((view) => (
                    <div
                      key={view.name}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gold-200 bg-linear-to-br from-gold-50 via-white to-brand-50/40 px-4 py-3.5 shadow-[0_12px_32px_rgba(212,175,55,0.12)]"
                    >
                      <span className="flex items-center gap-2.5 font-semibold text-ink-900">
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
                          <Eye aria-hidden="true" className="size-4.5" />
                        </span>
                        {view.name}
                      </span>
                      {view.pricePremium != null && view.pricePremium > 0 ? (
                        <span className="shrink-0 rounded-full bg-gold-400 px-3 py-1 text-sm font-bold text-brand-950">
                          +{formatPrice(view.pricePremium, true)}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                          Included
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Amenities */}
            {hasAmenities ? (
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
            ) : null}

            {/* Specifications */}
            {hasSpecifications ? (
              <div>
                <h2 className="text-h3 mb-4">Specifications</h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  {specificationEntries.map(([key, value], i) => (
                    <div
                      key={key}
                      className={`grid grid-cols-2 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-ink-50" : "bg-white"}`}
                    >
                      <span className="font-medium text-muted-foreground">
                        {key}
                      </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Nearby */}
            {hasNearbyLandmarks ? (
              <div>
                <h2 className="text-h3 mb-4">Landmarks Nearby</h2>
                <div className="space-y-6">
                  {landmarkGroups.map(({ group, names }) => (
                    <div key={group}>
                      <p className="text-eyebrow mb-2 text-brand-700">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {names.map((name, i) => (
                          <div
                            key={`${name}-${i}`}
                            className="flex items-center gap-2 text-sm"
                          >
                            <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                            <span className="font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="space-y-5 lg:sticky lg:top-24">
              {project.developerName ? (
                <section className="relative isolate overflow-hidden rounded-2xl border border-brand-200 bg-linear-to-br from-brand-50 via-white to-gold-50 p-5 shadow-[0_0_0_1px_rgba(5,150,105,0.04),0_18px_60px_rgba(5,150,105,0.16),0_0_45px_rgba(212,175,55,0.12)]">
                  <div className="absolute -right-12 -top-12 -z-10 size-36 rounded-full bg-gold-300/25 blur-3xl" />
                  <div className="absolute -bottom-16 -left-10 -z-10 size-40 rounded-full bg-brand-300/25 blur-3xl" />
                  <div className="flex items-start gap-3">
                    <div className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-[0_8px_24px_rgba(5,150,105,0.28)]">
                      <Building2 aria-hidden="true" className="size-5" />
                      <Sparkles
                        aria-hidden="true"
                        className="absolute -right-1.5 -top-1.5 size-4 text-gold-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                        Developed by
                      </p>
                      <p className="mt-1 wrap-break-word text-lg font-bold leading-snug text-ink-950">
                        {project.developerName}
                      </p>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        The team responsible for bringing this project to life.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <ProjectAtAGlance facts={projectFacts} />

              {/* Price card */}
              <div className="bg-brand-700 text-white rounded-2xl p-5 space-y-2">
                <p className="text-brand-200 text-sm">Price Range</p>
                <p className="text-2xl font-bold">
                  {formatPriceRange(
                    project.priceFrom ?? 0,
                    project.priceTo ?? project.priceFrom ?? 0,
                  )}
                </p>
                <p className="text-brand-300 text-xs">
                  Prices may vary per unit type and floor
                </p>
              </div>

              {/* Contact card */}
              <div
                id="enquire"
                className="scroll-mt-24 bg-white rounded-2xl p-5 border border-border space-y-4"
              >
                <h3 className="font-bold">Enquire About This Apartment</h3>
                <div className="space-y-2">
                  <a
                    href={`tel:${siteConfig.contact.phoneRaw}`}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors text-sm font-semibold"
                  >
                    <Phone className="h-4 w-4" /> {siteConfig.contact.phone}
                  </a>
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsApp}?text=I'm interested in ${project.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />{" "}
                    WhatsApp
                  </a>
                  <Link href={`${ROUTES.CONSULTATION}?project=${project.slug}`}>
                    <Button className="w-full mt-1" variant="outline">
                      Book Site Visit
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {siteConfig.contact.officeHours}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
