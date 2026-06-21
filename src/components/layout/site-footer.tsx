import Link from "next/link"
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react"
import { siteConfig } from "@/config/site.config"
import { ROUTES } from "@/config/routes.config"

/* ── Inline SVG social icons (lucide-react v1.14 dropped these) ── */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

/* ── Data ── */

const STATS = [
  { value: `${siteConfig.stats.projectsCompleted}+`, label: "Projects Delivered" },
  { value: `${(siteConfig.stats.happyFamilies / 1000).toFixed(1)}K+`, label: "Families Served" },
  { value: `${siteConfig.stats.yearsExperience}+`, label: "Years Trusted" },
  { value: `${siteConfig.stats.totalListings}+`, label: "Active Listings" },
] as const

const QUICK_LINKS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Projects", href: ROUTES.PROJECTS },
  { label: "Properties", href: ROUTES.PROPERTIES },
  { label: "Map Search", href: ROUTES.MAP_SEARCH },
  { label: "Consultation", href: ROUTES.CONSULTATION },
  { label: "Blog", href: ROUTES.BLOG },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Contact Us", href: ROUTES.CONTACT },
]

const SERVICES = [
  { label: "Buy Property", href: `${ROUTES.PROPERTIES}?purpose=sale` },
  { label: "Rent Property", href: `${ROUTES.PROPERTIES}?purpose=rent` },
  { label: "List Your Property", href: ROUTES.REGISTER },
  { label: "Book Consultation", href: ROUTES.CONSULTATION },
  { label: "Our Projects", href: ROUTES.PROJECTS },
  { label: "Compare Properties", href: ROUTES.COMPARE },
  { label: "Seller Dashboard", href: ROUTES.SELLER_DASHBOARD },
]

const SOCIALS = [
  { href: siteConfig.social.facebook, Icon: FacebookIcon, label: "Facebook" },
  { href: siteConfig.social.instagram, Icon: InstagramIcon, label: "Instagram" },
  { href: siteConfig.social.youtube, Icon: YoutubeIcon, label: "YouTube" },
  { href: siteConfig.social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
] as const

const TRUST_TAGS = ["Verified projects", "Local market insights", "Consultation-first", "RAJUK registered"]

/* ── Component ── */

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-ink-900 text-white">
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Top brand glow */}
      <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 h-64 bg-linear-to-b from-brand-900/40 to-transparent" />

      {/* ── CTA Band ── */}
      <div className="relative border-b border-white/10">
        <div className="container-page py-14 md:py-18">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">

            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-600/40 bg-brand-800/30 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-300">
                  Bangladesh&apos;s trusted real estate platform
                </span>
              </div>

              <div>
                <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                  Find your next property
                  <span className="block text-gold-400">with confidence.</span>
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-400">
                  Verified listings, premium projects, and expert consultation — all across Bangladesh.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {TRUST_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CTAs */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={ROUTES.PROPERTIES}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.CONSULTATION}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-5 text-center transition-colors hover:bg-white/8"
              >
                <p className="font-heading text-3xl font-bold text-gold-400">{stat.value}</p>
                <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="relative container-page py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            {/* Logo mark */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 to-brand-800">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block font-heading text-base font-semibold tracking-tight text-white">
                  {siteConfig.shortName}
                  <span className="ml-1 text-gold-400">Properties</span>
                </span>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink-500">
                  Bangladesh real estate
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ink-400">
              {siteConfig.tagline}. Built for buyers, investors, sellers, and families moving with confidence.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ href, Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-brand-500/60 hover:bg-brand-700"
                >
                  <Icon className="h-4 w-4 text-ink-400 transition-colors group-hover:text-white" />
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${siteConfig.contact.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-900/30 px-4 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-800/40"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Explore
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-ink-400 transition-colors hover:text-white"
                  >
                    <span className="inline-block h-px w-0 shrink-0 bg-brand-500 transition-all duration-200 group-hover:w-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-ink-400 transition-colors hover:text-white"
                  >
                    <span className="inline-block h-px w-0 shrink-0 bg-brand-500 transition-all duration-200 group-hover:w-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="group flex min-h-11 items-start gap-3 text-sm text-ink-400 transition-colors hover:text-white"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-400 transition-colors group-hover:bg-brand-900/60">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <span className="pt-1">{siteConfig.contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="group flex min-h-11 items-start gap-3 text-sm text-ink-400 transition-colors hover:text-white"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-400 transition-colors group-hover:bg-brand-900/60">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span className="break-all pt-1">{siteConfig.contact.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink-400">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-400">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="pt-1 leading-relaxed">{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink-500">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-600">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span className="pt-1">{siteConfig.contact.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/8">
        <div className="container-page py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-ink-600 sm:flex-row">
            <p>
              © {year}{" "}
              <span className="font-medium text-ink-400">{siteConfig.name}</span>
              . All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <Link href="/privacy" className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-ink-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-ink-300">
                Terms of Use
              </Link>
              <Link href={ROUTES.CONTACT} className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-ink-300">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
