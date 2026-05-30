export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Phone,
  MessageCircle,
  ChevronRight,
  Building2,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getProperty, getProperties } from "@/services/properties.service";
import { getDocuments } from "@/services/documents.service";
import { formatPrice, formatRent } from "@/utils/format-price";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/verified-badge";
import { SaveButton } from "@/components/properties/save-button";
import { CompareButton } from "@/components/properties/compare-button";
import { PropertyCard } from "@/components/properties/property-card";
import { MortgageCalculator } from "@/components/properties/mortgage-calculator";
import { ReportListingDialog } from "@/components/properties/report-listing-dialog";
import { VirtualTour } from "@/components/properties/virtual-tour";
import { FloorPlan } from "@/components/properties/floor-plan";
import { VideoReel } from "@/components/properties/video-reel";
import { DocumentVault } from "@/components/properties/document-vault";
import { EmiBankCompare } from "@/components/properties/emi-bank-compare";
import { RoiCalculator } from "@/components/properties/roi-calculator";
import { OfferFlow } from "@/components/properties/offer-flow";
import { PropertyViewTracker } from "@/components/properties/property-view-tracker";
import { ReviewsSection } from "@/components/properties/reviews-section";
import { QASection } from "@/components/properties/qa-section";
import { SellerInquiryForm } from "@/components/properties/seller-inquiry-form";
import { StructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/config/site.config";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;
  const res = await getProperty(slug);
  if (!res.success) notFound();
  const p = res.data;

  const similarRes = await getProperties({
    type: p.type,
    division: p.division,
    limit: 3,
  });
  const similar = similarRes.data.filter((s) => s.id !== p.id).slice(0, 3);

  const docsRes = await getDocuments(p.id).catch(() => null);
  const documents = docsRes?.data ?? [];

  const floorLevels =
    p.images.length >= 2
      ? [
          {
            label: "Ground",
            imageUrl: p.images[0],
            sizeSqft: Math.round(p.size * 0.55),
          },
          {
            label: "Upper",
            imageUrl: p.images[1],
            sizeSqft: Math.round(p.size * 0.45),
          },
        ]
      : [];

  const reels = p.images.slice(0, 4).map((img, i) => ({
    id: `reel-${i}`,
    videoUrl: p.videoUrl ?? "",
    poster: img,
    caption:
      i === 0
        ? "Living room walkthrough"
        : i === 1
          ? "Kitchen + utility tour"
          : i === 2
            ? "Master bedroom"
            : "Balcony view",
    duration: ["0:23", "0:31", "0:18", "0:42"][i] ?? "0:30",
  }));

  const displayPrice =
    p.purpose === "rent" ? formatRent(p.price) : formatPrice(p.price);
  const publishedDate = new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(p.createdAt));

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: `${siteConfig.url}${ROUTES.PROPERTY_DETAIL(p.slug)}`,
    image: p.images[0],
    offers: { "@type": "Offer", price: p.price, priceCurrency: "BDT" },
  };

  const specCards = [
    p.bedrooms !== undefined
      ? { icon: BedDouble, label: "Bedrooms", value: String(p.bedrooms) }
      : null,
    p.bathrooms !== undefined
      ? { icon: Bath, label: "Bathrooms", value: String(p.bathrooms) }
      : null,
    { icon: Maximize2, label: "Size", value: `${p.size} ${p.sizeUnit}` },
    p.floorNumber !== undefined
      ? { icon: Building2, label: "Floor", value: `Floor ${p.floorNumber}` }
      : null,
  ].filter(Boolean) as {
    icon: typeof BedDouble;
    label: string;
    value: string;
  }[];

  return (
    <>
      <StructuredData data={schema} />
      <PropertyViewTracker propertyId={p.id} />

      <div className="border-b border-border bg-ink-50">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.PROPERTIES} className="hover:text-foreground">
            Properties
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-48 line-clamp-1 font-medium text-foreground">
            {p.title}
          </span>
        </div>
      </div>

      <div className="container-page section-y pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {p.isFeatured && <VerifiedBadge type="featured" />}
                {p.isVerified && <VerifiedBadge type="verified" />}
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    p.purpose === "rent"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  For {p.purpose === "rent" ? "Rent" : "Sale"}
                </span>
              </div>

              <div>
                <h1 className="text-h1 text-balance max-w-4xl">{p.title}</h1>
                <p className="mt-3 text-3xl font-semibold text-brand-700">
                  {displayPrice}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    {p.address}
                  </span>
                  <span className="text-ink-300">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand-600" />
                    Listed {publishedDate}
                  </span>
                </div>
                {p.priceNegotiable && (
                  <p className="mt-2 text-sm text-ink-500">
                    Price is negotiable
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="surface-card bg-brand-aurora p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Listing note
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">
                  Verified cues, compact specs, and seller actions stay visible
                  before user scrolls into long description.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                  Views
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink-900">
                  {p.viewCount}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
            <div className="surface-card overflow-hidden sm:col-span-2 lg:col-span-2">
              <div className="relative h-100">
                {p.images[0] && (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="max-w-md text-white">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/70">
                      {p.type}
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {p.area}, {p.district}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <SaveButton
                      propertyId={p.id}
                      className="h-10 w-10 bg-white/92 text-ink-700 hover:bg-white"
                    />
                    <CompareButton
                      property={p}
                      className="h-10 w-10 bg-white/92 text-ink-700 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            {p.images.slice(1, 4).map((img, i) => (
              <div
                key={img}
                className={`surface-card relative overflow-hidden ${i === 0 ? "sm:col-span-1" : ""} h-36`}
              >
                <Image
                  src={img}
                  alt={`${p.title} ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 15vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specCards.map(({ icon: Icon, label, value }) => (
                <div key={label} className="surface-card p-4 text-center">
                  <Icon className="mx-auto h-4 w-4 text-brand-600" />
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="surface-card p-6">
              <h2 className="text-h3">Description</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                {p.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <VirtualTour
                posterImage={p.images[0]}
                title="Virtual 360° Tour"
              />
              {floorLevels.length > 0 && <FloorPlan levels={floorLevels} />}
            </div>

            <VideoReel reels={reels} />

            {documents.length > 0 && <DocumentVault documents={documents} />}

            {p.purpose === "sale" && (
              <div className="grid gap-4">
                <RoiCalculator propertyPrice={p.price} />
                <EmiBankCompare propertyPrice={p.price} />
              </div>
            )}

            <QASection propertyId={p.id} />
            <ReviewsSection targetType="property" targetId={p.id} />

            {p.facilities.length > 0 && (
              <div className="surface-card p-6">
                <h2 className="text-h3">Facilities</h2>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {p.facilities.map((facility) => (
                    <div
                      key={facility}
                      className="flex items-center gap-3 rounded-[1rem] bg-ink-50 px-4 py-3 text-sm text-ink-700"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
                      {facility}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="surface-card p-6">
              <h2 className="text-h3">Location</h2>
              <div className="mt-5 h-56 rounded-[1.5rem] border border-border bg-brand-aurora flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-5 w-5 text-brand-600" />
                  <p className="mt-3 text-sm font-medium text-ink-800">
                    {p.area}, {p.district}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                    Map placeholder
                  </p>
                </div>
              </div>
            </div>

            {similar.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-700">
                      More like this
                    </p>
                    <h2 className="mt-2 text-h3">Similar Properties</h2>
                  </div>
                  <Link href={ROUTES.PROPERTIES}>
                    <Button
                      variant="outline"
                      className="rounded-full border-brand-200 text-brand-700 hover:bg-brand-50"
                    >
                      Browse More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {similar.map((s) => (
                    <PropertyCard key={s.id} property={s} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="surface-card bg-brand-aurora p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-700">
                Price snapshot
              </p>
              <p className="mt-3 text-3xl font-semibold text-brand-700">
                {displayPrice}
              </p>
              <p className="mt-2 text-sm text-ink-500">
                {p.purpose === "rent"
                  ? "Monthly rent estimate."
                  : "Purchase-ready starting point."}
              </p>
            </div>

            <div className="surface-card p-5">
              <h3 className="font-sans text-lg font-semibold text-ink-900">
                Contact Seller
              </h3>
              <div className="mt-4 flex items-center gap-3">
                {p.sellerAvatar && (
                  <Image
                    src={p.sellerAvatar}
                    alt={p.sellerName}
                    width={44}
                    height={44}
                    className="rounded-full"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {p.sellerName}
                  </p>
                  <p className="text-xs text-ink-500">
                    {p.sellerVerified
                      ? "Verified Seller"
                      : "Independent Seller"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <a
                  href={`tel:${p.sellerPhone}`}
                  className="flex w-full items-center gap-3 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
                >
                  <Phone className="h-4 w-4" /> {p.sellerPhone}
                </a>
                {p.sellerWhatsApp && (
                  <a
                    href={`https://wa.me/880${p.sellerWhatsApp}?text=Interested in: ${p.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-3 rounded-full border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-sm font-semibold text-ink-900">
                  Send an inquiry
                </p>
                <SellerInquiryForm
                  propertyId={p.id}
                  propertyTitle={p.title}
                  sellerName={p.sellerName}
                />
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-border bg-ink-50 p-4">
                <p className="text-sm leading-relaxed text-ink-600">
                  Need neutral help before talking to seller? Book consultation
                  with Alivia team.
                </p>
                <Link href={ROUTES.CONSULTATION}>
                  <Button className="mt-4 w-full rounded-full bg-brand-600 text-white hover:bg-brand-700">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </div>

            {p.purpose === "sale" && (
              <>
                <OfferFlow
                  propertyId={p.id}
                  propertyTitle={p.title}
                  listingPrice={p.price}
                  sellerId={p.sellerId}
                  sellerName={p.sellerName}
                />
                <MortgageCalculator propertyPrice={p.price} />
              </>
            )}

            <ReportListingDialog propertyId={p.id} />
          </div>
        </div>
      </div>
    </>
  );
}
