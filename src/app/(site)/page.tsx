import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Compass,
  FileCheck2,
  Handshake,
  Headset,
  MapPin,
  MessagesSquare,
  Quote,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { siteConfig } from "@/config/site.config";
import {
  FlagshipProjects,
  type FlagshipProject,
} from "@/pages-sections/home/flagship-projects";
import {
  HomeHero,
  type HeroProjectCard,
} from "@/pages-sections/home/home-hero";
import { blogService } from "@/services/blog.service";
import { projectsService } from "@/services/projects.service";
import { propertiesService } from "@/services/properties.service";
import { formatPrice, formatRent } from "@/utils/format-price";

export const dynamic = "force-dynamic";

type SoftRecord = Record<string, unknown>;

function pick<T>(obj: SoftRecord, key: string, fallback: T): T {
  const v = obj[key];
  return v === undefined || v === null ? fallback : (v as T);
}

function projectCover(p: SoftRecord): string | null {
  return (
    pick<string | null>(p, "coverImage", null) ??
    pick<string | null>(p, "coverImageUrl", null) ??
    (Array.isArray(p.galleryImages)
      ? ((p.galleryImages as string[])[0] ?? null)
      : null)
  );
}

function projectPrice(p: SoftRecord): string | null {
  const from = pick<number>(p, "priceFrom", 0);
  return from > 0 ? formatPrice(from, true) : null;
}

export default async function HomePage() {
  const [projectsRes, propertiesRes, blogRes] = await Promise.allSettled([
    projectsService.list({ limit: 6 }),
    propertiesService.list({ limit: 4 }),
    blogService.list({ limit: 3 }),
  ]);

  const projects: SoftRecord[] =
    projectsRes.status === "fulfilled" ? projectsRes.value.data : [];
  const properties: SoftRecord[] =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.data : [];
  const posts = blogRes.status === "fulfilled" ? blogRes.value.data : [];

  const backendDown =
    projectsRes.status === "rejected" &&
    propertiesRes.status === "rejected" &&
    blogRes.status === "rejected";

  const heroProjects: HeroProjectCard[] = projects.slice(0, 2).map((p) => ({
    slug: pick<string>(p, "slug", ""),
    name: pick<string>(p, "name", "Alivia Project"),
    location: pick<string>(p, "location", "Dhaka, Bangladesh"),
    status: pick<string>(p, "status", "ongoing"),
    price: projectPrice(p) ?? "Price on request",
    cover: projectCover(p),
  }));

  const flagship: FlagshipProject[] = projects.map((p) => {
    const total = pick<number | null>(p, "totalUnits", null);
    return {
      slug: pick<string>(p, "slug", ""),
      name: pick<string>(p, "name", "Alivia Project"),
      location: pick<string>(p, "location", "Dhaka, Bangladesh"),
      status: pick<string>(p, "status", "ongoing"),
      price: projectPrice(p),
      units: total ? `${total} units` : null,
      cover: projectCover(p),
    };
  });

  return (
    <main className="bg-white">
      {backendDown && (
        <div className="border-b border-amber-200 bg-amber-50/80">
          <div className="container-page py-3 text-xs text-amber-900">
            <span className="font-medium">Heads up:</span> the API at{" "}
            <span className="font-mono">
              {process.env.NEXT_PUBLIC_API_BASE_URL ??
                "http://localhost:3001/api/v1"}
            </span>{" "}
            isn&apos;t responding. Start the NestJS backend to populate this
            page.
          </div>
        </div>
      )}

      {/* 1 — Hero */}
      <HomeHero projects={heroProjects} />

      {/* 2 — Verified numbers band */}
      <VerifiedNumbers />

      {/* 3 — Trust features */}
      <TrustSection />

      {/* 4 — Flagship projects */}
      <FlagshipProjects projects={flagship} />

      {/* 5 — Investment corridors */}
      <InvestmentCorridors />

      {/* 6 — Verified listings */}
      <VerifiedListings properties={properties} />

      {/* 7 — Process */}
      <ProcessSection />

      {/* 8 — Testimonials */}
      <Testimonials />

      {/* 9 — Founder / about */}
      <FounderSection />

      {/* 10 — Expert guidance CTA */}
      <ExpertCta />

      {/* 11 — Market insights */}
      <MarketInsights posts={posts} />
    </main>
  );
}

/* ───────────────────────── 2. Verified numbers ───────────────────────── */

function VerifiedNumbers() {
  const items = [
    {
      value: `${siteConfig.stats.projectsCompleted}+`,
      label: "Projects completed",
    },
    {
      value: `${siteConfig.stats.happyFamilies.toLocaleString("en-US")}+`,
      label: "Happy families",
    },
    {
      value: `${siteConfig.stats.yearsExperience}+`,
      label: "Years of experience",
    },
    { value: `${siteConfig.stats.totalListings}+`, label: "Verified listings" },
  ];
  return (
    <section className="bg-brand-950 text-white">
      <div className="container-page py-14 md:py-16">
        <div className="mb-9 max-w-2xl">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
            By the numbers
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            Verified numbers families and investors rely on.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-white/10 bg-white/4 px-5 py-7 transition-colors hover:bg-white/[0.07]"
            >
              <p className="font-heading text-4xl font-bold text-gold-400">
                {s.value}
              </p>
              <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-200">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. Trust features ───────────────────────── */

function TrustSection() {
  const features = [
    {
      icon: ScrollText,
      title: "RAJUK registered",
      body: "Approved developer with land titles and approvals you can verify.",
    },
    {
      icon: BadgeCheck,
      title: "Verified listings only",
      body: "Ownership and trade documents confirmed before a listing goes live.",
    },
    {
      icon: ShieldCheck,
      title: "No hidden surprises",
      body: "Transparent pricing, clear paperwork, and honest guidance throughout.",
    },
    {
      icon: TrendingUp,
      title: "Local market intelligence",
      body: "Price benchmarks and area insights across Dhaka and beyond.",
    },
    {
      icon: Users,
      title: "Years of reliability",
      body: "Thousands of families served with a consultation-first approach.",
    },
    {
      icon: Handshake,
      title: "End-to-end support",
      body: "From first search to handover — guidance at every step of the journey.",
    },
  ];
  return (
    <section className="bg-ink-50/60">
      <div className="container-page section-y-sm">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-eyebrow mb-2">Why Alivia</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Reliability arrives before friction does.
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            We removed hesitation early so the right next step always feels
            obvious.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-black/5 bg-white p-6 shadow-(--shadow-card) transition hover:-translate-y-0.5 hover:shadow-(--shadow-elevated)"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-ink-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href={ROUTES.PROPERTIES}>
            <Button size="lg" className="gap-2 rounded-full">
              <Building2 className="h-4 w-4" />
              Browse verified listings
            </Button>
          </Link>
          <Link href={ROUTES.CONSULTATION}>
            <Button size="lg" variant="outline" className="gap-2 rounded-full">
              Talk to an expert <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 5. Investment corridors ───────────────────────── */

function InvestmentCorridors() {
  const corridors = [
    {
      name: "Bashundhara R/A",
      tag: "Family living",
      body: "Planned residential blocks, schools, and rising long-term value.",
    },
    {
      name: "Gulshan & Banani",
      tag: "Prime central",
      body: "Premium addresses, corporate hubs, and strong rental demand.",
    },
    {
      name: "Purbachal New Town",
      tag: "High growth",
      body: "Bangladesh's largest planned township with major upside ahead.",
    },
    {
      name: "Uttara & Mirpur",
      tag: "Value picks",
      body: "Connected, fast-developing corridors with accessible entry points.",
    },
  ];
  return (
    <section className="bg-brand-50/50">
      <div className="container-page section-y-sm">
        <div className="mb-9 max-w-2xl">
          <p className="text-eyebrow mb-2">Where to look</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Dhaka&apos;s top investment corridors, curated.
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            Prestige, prices, and upside — where smart capital is going in the
            capital.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {corridors.map((c) => (
            <Link
              key={c.name}
              href={`${ROUTES.PROPERTIES}?search=${encodeURIComponent(c.name)}`}
              className="group rounded-3xl border border-black/5 bg-white p-6 shadow-(--shadow-card) transition hover:-translate-y-1 hover:shadow-(--shadow-elevated)"
            >
              <span className="inline-flex rounded-full bg-gold-50 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-gold-700">
                {c.tag}
              </span>
              <h3 className="mt-4 inline-flex items-center gap-1.5 font-heading text-xl font-semibold text-ink-900 group-hover:text-brand-700">
                <MapPin className="h-4 w-4 text-brand-600" />
                {c.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {c.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                Explore listings <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 6. Verified listings ───────────────────────── */

function VerifiedListings({ properties }: { properties: SoftRecord[] }) {
  return (
    <section className="container-page section-y-sm">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow mb-2">Marketplace</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Verified listings from trusted sellers.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-600">
            Apartments, plots, and commercial spaces — with real sellers, clear
            pricing, and verified trust cues.
          </p>
        </div>
        <Link href={ROUTES.PROPERTIES}>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
            Browse marketplace <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* listings grid */}
        {properties.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-white p-10 text-center text-sm text-ink-600">
            No properties listed yet.
          </div>
        ) : (
          <ul className="grid min-w-0 gap-5 sm:grid-cols-2">
            {properties.slice(0, 4).map((p) => {
              const slug = pick<string>(p, "slug", "");
              const title = pick<string>(p, "title", "Property");
              const cover =
                pick<string | null>(p, "coverImage", null) ??
                (Array.isArray(p.images)
                  ? ((p.images as Array<{ url?: string } | string>)
                      .map((i) => (typeof i === "string" ? i : i?.url))
                      .find(Boolean) ?? null)
                  : null);
              const price = pick<number>(p, "price", 0);
              const purpose = pick<string>(p, "purpose", "sale");
              const area = pick<string>(p, "area", "");
              const district = pick<string>(
                p,
                "district",
                pick<string>(p, "city", "Bangladesh"),
              );
              const bedrooms = pick<number | undefined>(
                p,
                "bedrooms",
                undefined,
              );
              const verified =
                pick<boolean>(p, "isVerified", false) ||
                pick<string>(p, "status", "") === "verified";
              return (
                <li key={slug || title}>
                  <Link
                    href={
                      slug ? ROUTES.PROPERTY_DETAIL(slug) : ROUTES.PROPERTIES
                    }
                    className="group block overflow-hidden rounded-3xl border border-black/5 bg-white shadow-(--shadow-card) transition hover:-translate-y-1 hover:shadow-(--shadow-elevated)"
                  >
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-ink-100">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-200">
                          <Building2 className="h-10 w-10" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-brand-700 backdrop-blur">
                        For {purpose}
                      </span>
                      {verified && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-700/95 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white backdrop-blur">
                          <BadgeCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="truncate font-heading text-base font-semibold text-ink-900 group-hover:text-brand-700">
                        {title}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                        <MapPin className="h-3 w-3" />
                        {[area, district].filter(Boolean).join(", ") ||
                          "Bangladesh"}
                      </p>
                      <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                        <span className="font-heading text-lg font-bold text-gold-600">
                          {purpose === "rent"
                            ? formatRent(price)
                            : formatPrice(price, true)}
                        </span>
                        {bedrooms !== undefined && (
                          <span className="text-xs text-ink-600">
                            {bedrooms} bed
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* dark side CTA */}
        <aside className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-800 to-brand-950 p-7 text-white shadow-(--shadow-elevated)">
          <Sparkles
            aria-hidden
            className="absolute -right-6 -top-6 h-28 w-28 text-gold-400/15"
          />
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
            Selling or renting?
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold">
            List with people who actually verify.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-100">
            Reach serious, qualified buyers and tenants. We verify your listing,
            then put it in front of the right audience.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-brand-50">
            {[
              "Free listing verification",
              "Qualified buyer matching",
              "Dedicated seller dashboard",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 shrink-0 text-gold-300" />
                {t}
              </li>
            ))}
          </ul>
          <Link href={ROUTES.REGISTER} className="mt-6 block">
            <Button className="w-full gap-2 rounded-full bg-gold-400 text-brand-950 hover:bg-gold-300">
              List your property <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </aside>
      </div>
    </section>
  );
}

/* ───────────────────────── 7. Process ───────────────────────── */

function ProcessSection() {
  const steps = [
    {
      n: "01",
      icon: Search,
      title: "Search with context",
      body: "Filter by area, budget, and purpose — with honest local insight, not noise.",
    },
    {
      n: "02",
      icon: Compass,
      title: "Compare with confidence",
      body: "Side-by-side details, verified documents, and transparent pricing.",
    },
    {
      n: "03",
      icon: MessagesSquare,
      title: "Talk before you commit",
      body: "Free consultation with advisors who know the market street by street.",
    },
    {
      n: "04",
      icon: Handshake,
      title: "Move with guided support",
      body: "Paperwork, handover, and after-sales help — we stay until you settle in.",
    },
  ];
  return (
    <section className="container-page section-y-sm">
      <div className="mb-10 max-w-2xl">
        <p className="text-eyebrow mb-2">How it works</p>
        <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
          From first browse to final decision.
        </h2>
        <p className="mt-3 text-sm text-ink-600">
          A calm, guided path — without pressure — from curiosity to keys in
          hand.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="relative rounded-3xl border border-black/5 bg-white p-6 shadow-(--shadow-card)"
          >
            <span className="absolute right-5 top-4 font-heading text-3xl font-bold text-brand-50">
              {s.n}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold text-ink-900">
              {s.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── 8. Testimonials ───────────────────────── */

function Testimonials() {
  const reviews = [
    {
      name: "Farhan Hossain",
      role: "Homeowner, Bashundhara R/A",
      quote:
        "Alivia made apartment search feel smaller and clearer. We moved from confused to confident within a few days.",
    },
    {
      name: "Nusrat Jahan",
      role: "Investor, Gulshan",
      quote:
        "Proper paperwork, honest price advice, and zero pressure. Exactly the kind of partner you want for a big decision.",
    },
    {
      name: "Tanvir Ahmed",
      role: "Tenant, Uttara",
      quote:
        "The verified listings and quick support saved me weeks. Everything was exactly as described — no surprises.",
    },
  ];
  return (
    <section className="bg-ink-50/60">
      <div className="container-page section-y-sm">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-eyebrow mb-2">Social proof</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Trusted by homeowners, investors, and tenants.
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            Real experiences from families and investors across Bangladesh.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-3xl border border-black/5 bg-white p-6 shadow-(--shadow-card)"
            >
              <Quote className="h-7 w-7 text-gold-400" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gold-400 text-gold-400"
                  />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 font-heading text-sm font-bold text-white">
                  {r.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    {r.name}
                  </span>
                  <span className="block text-xs text-ink-500">{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 9. Founder / about ───────────────────────── */

function FounderSection() {
  const { founder } = siteConfig;
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Trust by default",
      body: "Verification and transparency built into every step.",
    },
    {
      icon: Headset,
      title: "Consultation first",
      body: "Advice before sales — your decision, fully supported.",
    },
    {
      icon: FileCheck2,
      title: "Clean paperwork",
      body: "Clear documents and honest pricing, every time.",
    },
  ];
  return (
    <section className="bg-brand-950 text-white">
      <div className="container-page section-y-sm">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* founder card */}
          <div className="rounded-3xl border border-white/10 bg-white/4 p-7">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-800">
                {founder.avatar ? (
                  <Image
                    src={founder.avatar}
                    alt={founder.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center font-heading text-xl font-bold text-gold-300">
                    MR
                  </span>
                )}
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-white">
                  {founder.name}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-brand-300">
                  {founder.title}
                </p>
              </div>
            </div>
            <Quote className="mt-6 h-7 w-7 text-gold-400/70" />
            <p className="mt-2 text-sm leading-relaxed text-brand-100">
              {founder.message}
            </p>
          </div>

          {/* copy + pillars */}
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
              Our promise
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Building trust-first real estate experiences for Bangladesh.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-200">
              {siteConfig.description}
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-white/3 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-brand-300">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>

            <Link href={ROUTES.ABOUT} className="mt-7 inline-block">
              <Button className="gap-2 rounded-full bg-white text-brand-950 hover:bg-brand-50">
                More about Alivia <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 10. Expert guidance CTA ───────────────────────── */

function ExpertCta() {
  return (
    <section className="container-page section-y-sm">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-800 to-brand-900 p-8 text-white shadow-(--shadow-elevated) sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
              No-cost guidance
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Ready to talk? Expert guidance is free.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
              Free consultations for budget alignment, project comparison, and
              guided site visits — when your shortlist starts getting serious.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ROUTES.CONSULTATION}>
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-gold-400 text-brand-950 hover:bg-gold-300"
                >
                  <CalendarDays className="h-4 w-4" />
                  Book free consultation
                </Button>
              </Link>
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <Headset className="h-4 w-4" />
                  {siteConfig.contact.phone}
                </Button>
              </a>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-1">
            {[
              {
                t: "Budget alignment",
                d: "Match the right area to your real budget.",
              },
              {
                t: "Project comparison",
                d: "Weigh options with clear, honest data.",
              },
              {
                t: "Guided site visits",
                d: "See it in person with an advisor along.",
              },
            ].map((i) => (
              <li
                key={i.t}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4"
              >
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
                <div>
                  <p className="text-sm font-semibold text-white">{i.t}</p>
                  <p className="text-xs text-brand-200">{i.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 11. Market insights ───────────────────────── */

type Blogish = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  coverImage?: string | null;
  readTime?: number;
  readMinutes?: number;
  author?: string | { name: string };
};

function MarketInsights({ posts }: { posts: Blogish[] }) {
  return (
    <section className="container-page section-y-sm">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow mb-2">Knowledge</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
            Market insights for smarter property decisions.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-600">
            Expert articles for homebuyers, investors, and tenants across
            Bangladesh.
          </p>
        </div>
        <Link href={ROUTES.BLOG}>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
            All articles <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-white p-10 text-center text-sm text-ink-600">
          No articles published yet.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={ROUTES.BLOG_POST(post.slug)}
                className="group block overflow-hidden rounded-3xl border border-black/5 bg-white shadow-(--shadow-card) transition hover:-translate-y-1 hover:shadow-(--shadow-elevated)"
              >
                {post.coverImage && (
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-ink-100">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-brand-700">
                      {post.category}
                    </span>
                  )}
                  <p className="mt-2.5 font-heading text-base font-semibold text-ink-900 group-hover:text-brand-700">
                    {post.title}
                  </p>
                  {post.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-600">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-[0.7rem] text-ink-500">
                    {typeof post.author === "string"
                      ? post.author
                      : (post.author?.name ?? "Alivia")}{" "}
                    · {post.readTime ?? post.readMinutes ?? 5} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
