import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { ROUTES } from "@/config/routes.config";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb + prominent "Back to Marketplace" button, shown as a bar below a
 * page header. `trail` is the path *under* Marketplace (the Marketplace root is
 * prepended automatically); the last item is treated as the current page.
 */
export function MarketplaceBreadcrumb({ trail }: { trail: Crumb[] }) {
  const items: Crumb[] = [
    { label: "Marketplace", href: ROUTES.MARKETPLACE },
    ...trail,
  ];

  return (
    <div className="border-b border-border/60 bg-ink-50/60">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            {items.map((crumb, i) => {
              const isLast = i === items.length - 1;
              return (
                <li
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {i > 0 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-ink-400"
                    />
                  )}
                  {isLast || !crumb.href ? (
                    <span
                      className="font-semibold text-ink-900"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="font-medium text-ink-500 transition-colors hover:text-brand-700"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <Link
          href={ROUTES.MARKETPLACE}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-700 shadow-sm transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
