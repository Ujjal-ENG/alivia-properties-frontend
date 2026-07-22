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
  Eye,
  Tag,
  Clock,
  Navigation,
} from "lucide-react";
import { getProperty, getProperties } from "@/services/properties.service";
import { getDocuments } from "@/services/documents.service";
import { formatPrice, formatRent } from "@/utils/format-price";
import { toMapEmbedUrl } from "@/utils/map-embed";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/verified-badge";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { MortgageCalculator } from "@/components/properties/mortgage-calculator";
import { ReportListingDialog } from "@/components/properties/report-listing-dialog";
// 360° virtual tour temporarily disabled on the frontend — map option stays enabled.
// import { VirtualTour } from "@/components/properties/virtual-tour";
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

  const locationQuery = encodeURIComponent(
    [p.address, p.area, p.district, p.division].filter(Boolean).join(", "),
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
  const mapEmbedUrl = toMapEmbedUrl(p.mapPin) ?? toMapEmbedUrl(p.address);

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
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="surface-card flex flex-col gap-1.5 p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Eye className="size-3.5 text-brand-600" /> Views
                </span>
                <span className="text-xl font-semibold text-ink-900">
                  {p.viewCount.toLocaleString("en-US")}
                </span>
              </div>
              <div className="surface-card flex flex-col gap-1.5 p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Tag className="size-3.5 text-brand-600" /> Pricing
                </span>
                <span className="text-sm font-semibold text-ink-900">
                  {p.priceNegotiable ? "Negotiable" : "Fixed price"}
                </span>
              </div>
              <div className="surface-card flex flex-col gap-1.5 p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Building2 className="size-3.5 text-brand-600" /> Type
                </span>
                <span className="text-sm font-semibold capitalize text-ink-900">
                  {p.type}
                </span>
              </div>
            </div>
          </div>

          <PropertyGallery property={p} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="min-w-0 space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specCards.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="surface-card p-4 text-center transition-shadow hover:shadow-(--shadow-elevated)"
                >
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

            {/* A floor plan only makes sense for built spaces, not bare plots/land. */}
            {p.type !== "plot" && p.type !== "land" && (
              <>
                {/* 360° virtual tour temporarily disabled on the frontend — map option stays enabled.
                <VirtualTour
                  posterImage={p.images[0]}
                  panoramaUrl={p.panoramaUrl}
                  title="Virtual 360° Tour"
                />
                */}
                {floorLevels.length > 0 && <FloorPlan levels={floorLevels} />}
              </>
            )}

            <VideoReel reels={reels} />

            {documents.length > 0 && <DocumentVault documents={documents} />}

            {p.purpose === "sale" && (
              <div className="grid gap-4 *:min-w-0">
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-h3">Location</h2>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-2.5 min-h-10 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                >
                  <Navigation className="size-3.5" /> Get directions
                </a>
              </div>
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  title={`${p.title} location map`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="mt-5 h-56 w-full rounded-[1.5rem] border border-border bg-ink-50"
                />
              ) : (
                <div className="relative mt-5 h-56 overflow-hidden rounded-[1.5rem] border border-border bg-brand-aurora">
                  <div className="absolute inset-0 bg-grid-fade opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <span className="flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-md">
                      <MapPin className="size-5" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-ink-900">
                      {p.area}, {p.district}
                    </p>
                    {p.address && (
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-600">
                        {p.address}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-ink-400">
                      {p.division} Division
                    </p>
                  </div>
                </div>
              )}
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

          <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
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
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-brand-800">
                  <Tag className="size-3" />
                  {p.priceNegotiable ? "Negotiable" : "Fixed price"}
                </span>
                {p.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-brand-800">
                    <ShieldCheck className="size-3" />
                    Verified listing
                  </span>
                )}
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="font-sans text-lg font-semibold text-ink-900">
                Contact Seller
              </h3>
              <div className="mt-4 flex items-center gap-3">
                {p.sellerAvatar ? (
                  <Image
                    src={p.sellerAvatar}
                    alt={p.sellerName}
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {p.sellerName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {p.sellerName}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs text-ink-500">
                    {p.sellerVerified ? (
                      <>
                        <ShieldCheck className="size-3 text-brand-600" />
                        Verified Seller
                      </>
                    ) : (
                      "Independent Seller"
                    )}
                  </p>
                </div>
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-500">
                <Clock className="size-3.5 text-brand-500" />
                Typically replies within a few hours
              </p>

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
