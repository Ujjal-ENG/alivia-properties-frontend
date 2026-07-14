import {
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { supplierInitials } from "@/components/marketplace/supplier-media-utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import type { Supplier } from "@/types/marketplace.types";

export function MarketplaceSupplierSummaryCard({
  supplier,
  categorySlug,
}: {
  supplier: Supplier;
  categorySlug: string;
}) {
  const imageSrc =
    supplier.coverImage ?? supplier.gallery?.[0] ?? supplier.logo;
  const profileHref = ROUTES.MARKETPLACE_SUPPLIER(supplier.slug);
  const quoteHref = `${ROUTES.MARKETPLACE_QUOTE}?supplierSlug=${supplier.slug}&categorySlug=${categorySlug}`;
  const supplierType =
    supplier.kind === "service" || supplier.kind === "SERVICE"
      ? "Service Team"
      : "Material Supplier";

  return (
    <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-(--shadow-card) transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-(--shadow-elevated) motion-reduce:transform-none motion-reduce:transition-none">
      <div className="grid gap-5 p-5 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:p-6">
        <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-brand-100 md:aspect-square">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`${supplier.name} cover image`}
              fill
              unoptimized
              sizes="(max-width: 767px) 100vw, 180px"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center font-heading text-4xl font-semibold text-brand-700">
              {supplierInitials(supplier.name)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              {supplierType}
            </span>
            {supplier.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                Verified
              </span>
            ) : null}
          </div>

          <Link
            href={profileHref}
            className="mt-3 block break-words font-heading text-2xl font-semibold text-ink-900 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {supplier.name}
          </Link>

          {supplier.tagline ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-700">
              {supplier.tagline}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5 text-brand-600" />
              {supplier.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star
                aria-hidden="true"
                className="size-3.5 fill-gold-400 text-gold-400"
              />
              {supplier.rating.toFixed(1)} / 5 ({supplier.reviewCount})
            </span>
            {supplier.responseTimeHours != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3
                  aria-hidden="true"
                  className="size-3.5 text-brand-600"
                />
                Replies in about {supplier.responseTimeHours}h
              </span>
            ) : null}
            {supplier.deliveryDays != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Truck
                  aria-hidden="true"
                  className="size-3.5 text-brand-600"
                />
                Delivery in {supplier.deliveryDays} day
                {supplier.deliveryDays === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
          <Button render={<Link href={profileHref} />} className="gap-2">
            View supplier
          </Button>
          <Button
            render={<Link href={quoteHref} />}
            variant="outline"
            className="gap-2"
          >
            <FileText aria-hidden="true" className="size-4" />
            Request quote
          </Button>
        </div>
      </div>
    </article>
  );
}
