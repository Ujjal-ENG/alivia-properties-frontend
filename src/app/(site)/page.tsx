import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { siteConfig } from "@/config/site.config"
import { propertiesService } from "@/services/properties.service"
import { projectsService } from "@/services/projects.service"
import { blogService } from "@/services/blog.service"

export const dynamic = "force-dynamic"

type SoftRecord = Record<string, unknown>

function pick<T>(obj: SoftRecord, key: string, fallback: T): T {
  const v = obj[key]
  return (v === undefined || v === null ? fallback : (v as T))
}

export default async function HomePage() {
  const [projectsRes, propertiesRes, blogRes] = await Promise.allSettled([
    projectsService.list({ limit: 3 }),
    propertiesService.list({ limit: 6 }),
    blogService.list({ limit: 3 }),
  ])

  const projects: SoftRecord[] =
    projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  const properties: SoftRecord[] =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.data : []
  const posts =
    blogRes.status === "fulfilled" ? blogRes.value.data : []

  const backendDown =
    projectsRes.status === "rejected" &&
    propertiesRes.status === "rejected" &&
    blogRes.status === "rejected"

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="container-page py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                {siteConfig.shortName} · Real estate, reimagined
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl lg:text-6xl">
                {siteConfig.tagline}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-brand-100 sm:text-lg">
                Browse exclusive Alivia developer projects, discover verified marketplace listings,
                and request quotes from trusted Bangladeshi suppliers — all in one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={ROUTES.PROPERTIES}>
                  <Button size="lg" className="gap-2 bg-gold-400 text-ink-900 hover:bg-gold-300">
                    <Building2 className="size-4" />
                    Browse properties
                  </Button>
                </Link>
                <Link href={ROUTES.MARKETPLACE_QUOTE}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <FileText className="size-4" />
                    Get a Quote
                  </Button>
                </Link>
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-center">
                {[
                  { label: "Years experience", value: `${siteConfig.stats.yearsExperience}+` },
                  { label: "Projects completed", value: `${siteConfig.stats.projectsCompleted}` },
                  { label: "Happy families", value: `${siteConfig.stats.happyFamilies}+` },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/5 px-3 py-4 backdrop-blur">
                    <dt className="text-[10px] uppercase tracking-wider text-brand-100">{stat.label}</dt>
                    <dd className="mt-1 font-heading text-2xl font-semibold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                Why Alivia
              </p>
              <ul className="mt-3 space-y-3 text-sm text-brand-50">
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-300" />
                  <span>
                    <strong className="font-semibold text-white">Verified listings.</strong>{" "}
                    Trade licenses and ownership documents confirmed.
                  </span>
                </li>
                <li className="flex gap-3">
                  <TrendingUp className="mt-0.5 size-5 shrink-0 text-gold-300" />
                  <span>
                    <strong className="font-semibold text-white">Bangladesh expertise.</strong>{" "}
                    Local price intelligence across Dhaka, Chattogram and beyond.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-gold-300" />
                  <span>
                    <strong className="font-semibold text-white">Marketplace built-in.</strong>{" "}
                    Source materials and services from one place.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-2xl bg-white/95 p-4 text-ink-900">
                <p className="text-eyebrow mb-1">Talk to us</p>
                <p className="text-sm font-medium">Speak to a consultant about your next move.</p>
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="mt-3 inline-block w-full">
                  <Button size="sm" className="w-full gap-1.5">
                    <Phone className="size-3.5" />
                    {siteConfig.contact.phone}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {backendDown && (
        <section className="border-b border-amber-200 bg-amber-50/80">
          <div className="container-page py-3 text-xs text-amber-900">
            <span className="font-medium">Heads up:</span> the API at{" "}
            <span className="font-mono">{process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1"}</span>{" "}
            isn&apos;t responding. Start the NestJS backend to populate this page.
          </div>
        </section>
      )}

      {/* Featured projects */}
      <section className="container-page section-y-sm">
        <header className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow mb-1">Featured developer projects</p>
            <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
              Curated Alivia projects in Bangladesh
            </h2>
          </div>
          <Link href={ROUTES.PROJECTS}>
            <Button variant="outline" size="sm" className="gap-1.5">
              All projects <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </header>

        {projects.length === 0 ? (
          <EmptyTile label="No projects published yet." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => {
              const slug = pick<string>(p, "slug", "")
              const title = pick<string>(p, "title", "Untitled project")
              const cover = pick<string | null>(p, "coverImage", null)
              const location = pick<string>(p, "location", "Bangladesh")
              const status = pick<string>(p, "status", "ongoing")
              return (
                <li key={slug || title}>
                  <Link
                    href={slug ? ROUTES.PROJECT_DETAIL(slug) : ROUTES.PROJECTS}
                    className="group block overflow-hidden rounded-2xl border border-border/70 bg-white shadow-(--shadow-card) transition hover:-translate-y-0.5"
                  >
                    {cover && (
                      <div className="relative aspect-16/10 w-full bg-ink-100">
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                        {status}
                      </span>
                      <p className="mt-2 font-medium text-ink-900 group-hover:text-brand-700">{title}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-600">
                        <MapPin className="size-3" /> {location}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Featured properties */}
      <section className="container-page section-y-sm">
        <header className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow mb-1">Marketplace highlights</p>
            <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
              Verified properties from across Bangladesh
            </h2>
          </div>
          <Link href={ROUTES.PROPERTIES}>
            <Button variant="outline" size="sm" className="gap-1.5">
              All properties <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </header>

        {properties.length === 0 ? (
          <EmptyTile label="No properties listed yet." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map(p => {
              const slug = pick<string>(p, "slug", "")
              const title = pick<string>(p, "title", "Property")
              const cover =
                pick<string | null>(p, "coverImage", null) ??
                (Array.isArray(p.images) ? ((p.images as Array<{ url?: string }>)[0]?.url ?? null) : null)
              const price = pick<number>(p, "price", 0)
              const purpose = pick<string>(p, "purpose", "")
              const city = pick<string>(p, "city", pick<string>(p, "district", "Bangladesh"))
              const bedrooms = pick<number | undefined>(p, "bedrooms", undefined)
              return (
                <li key={slug || title}>
                  <Link
                    href={slug ? ROUTES.PROPERTY_DETAIL(slug) : ROUTES.PROPERTIES}
                    className="group block overflow-hidden rounded-2xl border border-border/70 bg-white shadow-(--shadow-card) transition hover:-translate-y-0.5"
                  >
                    {cover && (
                      <div className="relative aspect-16/10 w-full bg-ink-100">
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                        {purpose && <span>{purpose}</span>}
                        <span className="text-ink-400">·</span>
                        <span className="inline-flex items-center gap-1 text-ink-600 normal-case tracking-normal">
                          <MapPin className="size-3" />
                          {city}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-ink-900 group-hover:text-brand-700">{title}</p>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-heading text-base font-semibold text-brand-700">
                          ৳{price.toLocaleString("en-BD")}
                        </span>
                        {bedrooms !== undefined && (
                          <span className="text-xs text-ink-600">{bedrooms} bed</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Marketplace CTA */}
      <section className="container-page section-y-sm">
        <div className="rounded-3xl border border-border/70 bg-linear-to-br from-brand-50 via-white to-gold-50 p-6 shadow-(--shadow-card) sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-eyebrow mb-2">Alivia Marketplace</p>
              <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
                Building? Get a quote from verified suppliers in 24 hours.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-700">
                Sand, steel, tiles, fittings, security, finishing services — submit one form and
                we&apos;ll route your request to trusted Bangladeshi businesses.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={ROUTES.MARKETPLACE_QUOTE}>
                  <Button size="lg" className="gap-2">
                    <FileText className="size-4" />
                    Get a Quote
                  </Button>
                </Link>
                <Link href={ROUTES.MARKETPLACE}>
                  <Button size="lg" variant="outline" className="gap-2">
                    Browse marketplace <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-ink-700">
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-brand-700" />
                Verified businesses with confirmed credentials.
              </li>
              <li className="flex items-start gap-3">
                <Star className="mt-0.5 size-5 text-gold-700" />
                Free, no obligation — compare multiple quotes.
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 text-brand-700" />
                ~24h response time during business days.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="container-page section-y-sm">
        <header className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow mb-1">From the blog</p>
            <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
              Insights on the Bangladesh property market
            </h2>
          </div>
          <Link href={ROUTES.BLOG}>
            <Button variant="outline" size="sm" className="gap-1.5">
              All posts <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </header>

        {posts.length === 0 ? (
          <EmptyTile label="No blog posts yet." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <li key={post.id}>
                <Link
                  href={ROUTES.BLOG_POST(post.slug)}
                  className="group block overflow-hidden rounded-2xl border border-border/70 bg-white shadow-(--shadow-card) transition hover:-translate-y-0.5"
                >
                  {post.coverImage && (
                    <div className="relative aspect-16/10 w-full bg-ink-100">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      {post.category}
                    </span>
                    <p className="mt-2 font-medium text-ink-900 group-hover:text-brand-700">{post.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-600">{post.excerpt}</p>
                    <p className="mt-2 text-[11px] text-ink-500">
                      {post.author} · {post.readMinutes} min read
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Contact CTA */}
      <section className="border-t border-border/60 bg-ink-50/50">
        <div className="container-page py-12 text-center">
          <p className="text-eyebrow mb-2">Let&apos;s talk</p>
          <h2 className="font-heading text-2xl font-semibold text-ink-900 sm:text-3xl">
            Plan your next move with Alivia
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            We help families, investors and businesses across Bangladesh.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.CONTACT}>
              <Button size="lg">Contact us</Button>
            </Link>
            <Link href={ROUTES.CONSULTATION}>
              <Button size="lg" variant="outline">
                Book a consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function EmptyTile({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-white p-8 text-center text-sm text-ink-600">
      {label}
    </div>
  )
}
