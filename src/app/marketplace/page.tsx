import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  ChevronDown,
  CircleDollarSign,
  Headphones,
  Menu,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import {
  marketplaceService,
  type MarketplaceCategory,
  type ProductWithSupplier,
} from "@/services/marketplace.service";
import { projectsService } from "@/services/projects.service";
import { propertiesService } from "@/services/properties.service";
import { PropertyCard } from "@/components/properties/property-card";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  FlagshipProjects,
  type FlagshipProject,
} from "@/pages-sections/home/flagship-projects";
import { formatPrice } from "@/utils/format-price";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace - Alivia Properties",
  description:
    "Browse verified suppliers, source construction categories, and request quotes from one construction marketplace.",
};

type MarketplacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DepartmentGroup = {
  group: MarketplaceCategory;
  items: MarketplaceCategory[];
};

const FALLBACK_HERO_IMAGE = "/marketplace-reference/hero-building.png";
const FALLBACK_LOGO_MARK = "/marketplace-reference/logo-mark.png";

const FALLBACK_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "dept-materials",
    slug: "materials",
    name: "Materials",
    description: "Cement, steel, aggregates, blocks, and core build supplies.",
    level: "DEPARTMENT",
    order: 1,
  },
  {
    id: "cat-construction-materials",
    slug: "construction-materials",
    name: "Construction Materials",
    description: "2,500+ products",
    level: "CATEGORY",
    parentSlug: "materials",
    image: {
      key: "cat-materials",
      url: "/marketplace-reference/cat-materials.png",
    },
    order: 1,
  },
  {
    id: "dept-equipment",
    slug: "equipment-tools",
    name: "Equipment & Tools",
    description: "Heavy equipment, site tools, and rental support.",
    level: "DEPARTMENT",
    order: 2,
  },
  {
    id: "cat-equipment",
    slug: "equipment-tools",
    name: "Equipment & Tools",
    description: "1,800+ products",
    level: "CATEGORY",
    parentSlug: "equipment-tools",
    image: {
      key: "cat-equipment",
      url: "/marketplace-reference/cat-equipment.png",
    },
    order: 2,
  },
  {
    id: "dept-safety",
    slug: "safety-ppe",
    name: "Safety & PPE",
    description: "Helmets, gloves, harnesses, boots, and site safety gear.",
    level: "DEPARTMENT",
    order: 3,
  },
  {
    id: "cat-safety",
    slug: "safety-ppe",
    name: "Safety & PPE",
    description: "950+ products",
    level: "CATEGORY",
    parentSlug: "safety-ppe",
    image: { key: "cat-safety", url: "/marketplace-reference/cat-safety.png" },
    order: 3,
  },
  {
    id: "dept-electrical",
    slug: "electrical-lighting",
    name: "Electrical & Lighting",
    description: "Wiring, fixtures, switches, panels, and lighting.",
    level: "DEPARTMENT",
    order: 4,
  },
  {
    id: "cat-electrical",
    slug: "electrical-lighting",
    name: "Electrical & Lighting",
    description: "1,200+ products",
    level: "CATEGORY",
    parentSlug: "electrical-lighting",
    image: {
      key: "cat-electrical",
      url: "/marketplace-reference/cat-electrical.png",
    },
    order: 4,
  },
  {
    id: "dept-plumbing",
    slug: "plumbing-hvac",
    name: "Plumbing & HVAC",
    description: "Pipes, pumps, fixtures, ducts, and climate systems.",
    level: "DEPARTMENT",
    order: 5,
  },
  {
    id: "cat-plumbing",
    slug: "plumbing-hvac",
    name: "Plumbing & HVAC",
    description: "1,100+ products",
    level: "CATEGORY",
    parentSlug: "plumbing-hvac",
    image: {
      key: "cat-plumbing",
      url: "/marketplace-reference/cat-plumbing.png",
    },
    order: 5,
  },
  {
    id: "dept-interior",
    slug: "interior-finishing",
    name: "Interior & Finishing",
    description:
      "Tiles, paints, doors, sanitary, kitchen, and finishing items.",
    level: "DEPARTMENT",
    order: 6,
  },
  {
    id: "cat-interior",
    slug: "interior-finishing",
    name: "Interior & Finishing",
    description: "1,300+ products",
    level: "CATEGORY",
    parentSlug: "interior-finishing",
    image: {
      key: "cat-interior",
      url: "/marketplace-reference/cat-interior.png",
    },
    order: 6,
  },
  {
    id: "dept-services",
    slug: "services",
    name: "Services",
    description: "Contractors, installers, repair teams, and project services.",
    level: "DEPARTMENT",
    order: 7,
  },
  {
    id: "cat-services",
    slug: "services",
    name: "Services",
    description: "900+ services",
    level: "CATEGORY",
    parentSlug: "services",
    image: {
      key: "cat-services",
      url: "/marketplace-reference/cat-services.png",
    },
    order: 7,
  },
  {
    id: "dept-deals",
    slug: "deals-offers",
    name: "Deals & Offers",
    description: "Bulk offers, seasonal discounts, and limited supply deals.",
    level: "DEPARTMENT",
    order: 8,
  },
  {
    id: "cat-deals",
    slug: "deals-offers",
    name: "Deals & Offers",
    description: "500+ deals",
    level: "CATEGORY",
    parentSlug: "deals-offers",
    image: { key: "cat-deals", url: "/marketplace-reference/cat-deals.png" },
    order: 8,
  },
];

const FALLBACK_PRODUCTS: ProductWithSupplier[] = [
  {
    id: "fallback-steel",
    slug: "tmt-steel-bars",
    name: "TMT Steel Bars",
    supplierId: "fallback-supplier",
    categorySlug: "construction-materials",
    image: "/marketplace-reference/product-steel.png",
    price: 65000,
    unit: "ton",
    description: "High-grade reinforcement bars.",
    inStock: true,
  },
  {
    id: "fallback-mixer",
    slug: "concrete-mixer",
    name: "Concrete Mixer",
    supplierId: "fallback-supplier",
    categorySlug: "equipment-tools",
    image: "/marketplace-reference/product-mixer.png",
    price: 125000,
    unit: "",
    description: "Portable mixer for site work.",
    inStock: true,
  },
  {
    id: "fallback-helmet",
    slug: "safety-helmet",
    name: "Safety Helmet",
    supplierId: "fallback-supplier",
    categorySlug: "safety-ppe",
    image: "/marketplace-reference/product-helmet.png",
    price: 350,
    unit: "piece",
    description: "Site safety helmet.",
    inStock: true,
  },
  {
    id: "fallback-cement",
    slug: "opc-53-grade-cement",
    name: "OPC 53 Grade Cement",
    supplierId: "fallback-supplier",
    categorySlug: "construction-materials",
    image: "/marketplace-reference/product-cement.png",
    price: 420,
    unit: "bag",
    description: "Cement for structural work.",
    inStock: true,
  },
];

const DEPARTMENT_ICON_RULES: Array<{ keywords: string[]; icon: LucideIcon }> = [
  {
    keywords: ["material", "cement", "steel", "tile", "block", "brick"],
    icon: Boxes,
  },
  {
    keywords: ["equipment", "tool", "machine", "hardware", "lift"],
    icon: Wrench,
  },
  { keywords: ["safety", "ppe", "fire", "security"], icon: ShieldCheck },
  {
    keywords: ["electric", "electrical", "light", "power", "cable", "solar"],
    icon: Zap,
  },
  { keywords: ["plumbing", "hvac", "sanitary", "water", "pipe"], icon: Truck },
  {
    keywords: ["interior", "finish", "paint", "door", "kitchen", "furniture"],
    icon: Store,
  },
  {
    keywords: ["service", "contractor", "repair", "maintenance"],
    icon: Headphones,
  },
  { keywords: ["deal", "offer", "discount"], icon: Sparkles },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified Sellers",
    body: "Only verified & reliable sellers",
  },
  {
    icon: CircleDollarSign,
    title: "Best Price Guarantee",
    body: "Find the best prices always",
  },
  {
    icon: Boxes,
    title: "Bulk Order Discounts",
    body: "More quantity, more savings",
  },
  {
    icon: Truck,
    title: "Fast & Safe Delivery",
    body: "On-time delivery across country",
  },
  {
    icon: Store,
    title: "Secure Payments",
    body: "100% secure payments",
  },
] as const;

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];

  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function levelOf(category: MarketplaceCategory) {
  if (category.level) return category.level;
  if (!category.parentSlug) return "DEPARTMENT";
  return "CATEGORY";
}

function imageForCategory(category: MarketplaceCategory) {
  return category.image?.url ?? category.iconUrl ?? null;
}

function iconForKeyword(label: string) {
  const lower = label.toLowerCase();
  const rule = DEPARTMENT_ICON_RULES.find(({ keywords }) =>
    keywords.some((keyword) => lower.includes(keyword)),
  );

  return rule?.icon ?? Package;
}

function categoryMatches(
  category: MarketplaceCategory,
  query: string,
  parentName: string | undefined,
  subcategoryNames: string[],
) {
  if (!query) return true;

  const haystack = [
    category.name,
    category.description ?? "",
    parentName ?? "",
    subcategoryNames.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function formatProductPrice(product: ProductWithSupplier) {
  const value = Number.isFinite(product.price) ? Math.round(product.price) : 0;
  const unit = product.unit?.trim() ? ` / ${product.unit}` : "";
  return `৳${value.toLocaleString("en-BD")}${unit}`;
}

function quoteHrefForProduct(product: ProductWithSupplier) {
  const params = new URLSearchParams({
    productId: product.id,
    productSlug: product.slug,
  });

  if (product.supplier?.slug) {
    params.set("supplierSlug", product.supplier.slug);
  }

  if (product.category?.slug) {
    params.set("categorySlug", product.category.slug);
  }

  return `${ROUTES.MARKETPLACE_QUOTE}?${params.toString()}`;
}

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const initialSearch = getParam(params, "search");
  const selectedDepartment = getParam(params, "department");
  const query = initialSearch.trim().toLowerCase();

  const [categoriesRes, suppliersRes, productsRes, projectsRes, propertiesRes] =
    await Promise.allSettled([
      marketplaceService.listCategories(),
      marketplaceService.listSuppliers({ limit: 6 }),
      marketplaceService.listProducts({ limit: 4 }),
      projectsService.list({ limit: 6 }),
      propertiesService.list({ limit: 4 }),
    ]);

  const flagship: FlagshipProject[] = (
    projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  ).map((p) => ({
    slug: p.slug,
    name: p.name,
    location: p.location,
    status: p.status,
    price:
      p.priceFrom && p.priceFrom > 0 ? formatPrice(p.priceFrom, true) : null,
    units: p.totalUnits ? `${p.totalUnits} units` : null,
    cover: p.coverImage ?? p.coverImageUrl ?? p.galleryImages?.[0] ?? null,
  }));

  const properties =
    propertiesRes.status === "fulfilled" ? propertiesRes.value.data : [];

  const loadedCategories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
  const loadedProducts =
    productsRes.status === "fulfilled" ? productsRes.value.data : [];
  const categories =
    loadedCategories.length > 0 ? loadedCategories : FALLBACK_CATEGORIES;
  const products =
    loadedProducts.length > 0 ? loadedProducts : FALLBACK_PRODUCTS;

  const supplierTotal =
    suppliersRes.status === "fulfilled" && suppliersRes.value.meta.total > 0
      ? suppliersRes.value.meta.total
      : 5000;
  const productTotal =
    productsRes.status === "fulfilled" && productsRes.value.meta.total > 0
      ? productsRes.value.meta.total
      : 25000;

  const parentNameBySlug = new Map(
    categories.map((category) => [category.slug, category.name]),
  );

  const groups = categories
    .filter((category) => levelOf(category) === "DEPARTMENT")
    .sort((a, b) => a.order - b.order);

  const childrenByGroup = categories
    .filter((category) => levelOf(category) === "CATEGORY")
    .reduce<Record<string, MarketplaceCategory[]>>((acc, category) => {
      const key = category.parentSlug;
      if (!key) return acc;
      (acc[key] ??= []).push(category);
      return acc;
    }, {});

  const subcategoriesByCategory = categories
    .filter((category) => levelOf(category) === "SUBCATEGORY")
    .reduce<Record<string, MarketplaceCategory[]>>((acc, category) => {
      const key = category.parentSlug;
      if (!key) return acc;
      (acc[key] ??= []).push(category);
      return acc;
    }, {});

  Object.values(childrenByGroup).forEach((items) =>
    items.sort((a, b) => a.order - b.order),
  );
  Object.values(subcategoriesByCategory).forEach((items) =>
    items.sort((a, b) => a.order - b.order),
  );

  const visibleGroups: DepartmentGroup[] = groups
    .map((group) => {
      const items = (childrenByGroup[group.slug] ?? []).filter((category) => {
        if (selectedDepartment && group.slug !== selectedDepartment)
          return false;

        const subcategoryNames = (
          subcategoriesByCategory[category.slug] ?? []
        ).map((item) => item.name);

        return categoryMatches(
          category,
          query,
          parentNameBySlug.get(category.parentSlug ?? ""),
          subcategoryNames,
        );
      });

      return { group, items };
    })
    .filter(({ items }) => items.length > 0);

  const heroImage = FALLBACK_HERO_IMAGE;

  const stats = [
    { icon: Package, label: "Products", value: productTotal },
    { icon: User, label: "Trusted Sellers", value: supplierTotal },
    { icon: Boxes, label: "Projects Completed", value: 12000 },
    { icon: Truck, label: "On-time Delivery", value: 98, suffix: "%" },
  ];

  const clearingSearch = !query && !selectedDepartment;

  return (
    <>
    <main id="main-content" className="bg-ink-50 text-ink-900">
      <section className="bg-brand-950 text-white">
        <div className="container-page max-w-373! flex h-9 flex-wrap items-center justify-end gap-3 text-xs font-semibold">
          <div className="flex flex-wrap items-center gap-4 text-brand-100/90">
            <Link
              href={ROUTES.BECOME_SUPPLIER}
              className="inline-flex items-center gap-2 rounded-full px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Store aria-hidden="true" className="size-3.5" />
              Be a Supplier
            </Link>
            <Link
              href={ROUTES.BECOME_INVESTOR}
              className="inline-flex items-center gap-2 rounded-full px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <TrendingUp aria-hidden="true" className="size-3.5" />
              Be an Investor
            </Link>
            <Link
              href={ROUTES.BUYER_MARKETPLACE_QUOTES}
              className="rounded-full px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              Track Order
            </Link>
            <a
              href={`tel:${siteConfig.contact.phoneRaw}`}
              className="rounded-full px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              Help & Support
            </a>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-border/60 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/88">
        <div className="container-page max-w-373! py-2.5">
          <div className="grid gap-4 xl:grid-cols-[auto_11.5rem_minmax(0,1fr)_auto] xl:items-center">
            <Link href={ROUTES.MARKETPLACE} className="flex items-center gap-3">
              <span className="relative size-11 shrink-0 overflow-hidden">
                <Image
                  src={FALLBACK_LOGO_MARK}
                  alt=""
                  fill
                  unoptimized
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-3xl font-bold text-brand-950">
                  {siteConfig.name}
                </span>
                <span className="block text-xs text-ink-500">
                  Construction marketplace
                </span>
              </span>
            </Link>

            <Link href="#shop-by-category">
              <Button
                size="lg"
                className="h-11 w-full justify-start gap-3 rounded-md bg-brand-950 px-5 text-white hover:bg-brand-900"
              >
                <Menu aria-hidden="true" className="size-5" />
                Browse Categories
              </Button>
            </Link>

            <MarketplaceSearchForm
              departments={groups}
              initialSearch={initialSearch}
              selectedDepartment={selectedDepartment}
              compact
            />

            <div className="flex items-center gap-3 justify-self-start xl:justify-self-end">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <User aria-hidden="true" className="size-4" />
                My Account
              </Link>
              <Link href={ROUTES.MARKETPLACE_REQUEST}>
                <Button
                  size="lg"
                  className="relative h-11 rounded-full bg-white px-3 text-ink-900 shadow-none hover:bg-brand-50"
                >
                  <ShoppingCart aria-hidden="true" className="size-4" />
                  <span className="absolute -right-1 top-0 flex size-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-brand-950">
                    0
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {visibleGroups.length > 0 ? (
            <nav
              aria-label="Marketplace departments"
              className="mt-2 flex justify-between gap-2 overflow-x-auto border-t border-border/60 pt-2"
            >
              {visibleGroups.slice(0, 8).map(({ group }) => {
                const Icon = iconForKeyword(group.name);
                return (
                  <Link
                    key={group.slug}
                    href={`#department-${group.slug}`}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-transparent px-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-100 hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <Icon aria-hidden="true" className="size-5 text-ink-800" />
                    {group.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </section>

      {clearingSearch && (
        <>
          <section className="container-page max-w-373! pb-4 pt-0">
            <div className="overflow-hidden rounded-2xl bg-brand-950 text-white shadow-[0_28px_70px_rgba(10,37,31,0.18)]">
              <div className="grid min-h-125 lg:grid-cols-[minmax(0,0.73fr)_minmax(0,1fr)]">
                <div className="relative z-10 p-5 sm:p-6 lg:pb-0">
                  <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold-400">
                    <span
                      aria-hidden="true"
                      className="h-0.5 w-3 bg-gold-400"
                    />
                    One marketplace. Endless possibilities.
                  </p>
                  <h1 className="mt-3 max-w-xl text-balance font-sans text-5xl font-extrabold leading-[0.98] text-white sm:text-[3.55rem]">
                    Build More.
                    <br />
                    <span className="text-gold-400">Spend Less.</span>
                  </h1>
                  <p className="mt-3 max-w-lg text-base leading-6 text-white/88 sm:text-lg">
                    Quality products, competitive prices, and trusted
                    professionals for every construction need.
                  </p>

                  <MarketplaceSearchForm
                    departments={groups}
                    initialSearch={initialSearch}
                    selectedDepartment={selectedDepartment}
                    className="mt-3 max-w-xl"
                  />

                  <dl className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map(({ icon: Icon, label, value, suffix }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 border-white/18 xl:border-r xl:pr-4 last:border-r-0"
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-6 shrink-0 text-white"
                        />
                        <div>
                          <dd className="text-[22px] font-extrabold leading-6 text-white">
                            {value >= 1000
                              ? `${Math.round(value / 1000)}K`
                              : value}
                            {suffix ?? "+"}
                          </dd>
                          <dt className="text-[11px] font-semibold leading-4 text-white/86">
                            {label}
                          </dt>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="relative flex min-h-110 items-start justify-end p-5 lg:min-h-full lg:px-6 lg:pb-3 lg:pt-6">
                  <Image
                    src={heroImage}
                    alt="Construction sourcing showcase"
                    fill
                    unoptimized
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-brand-950 via-brand-950/20 to-brand-950/12"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-brand-950/20 via-transparent to-brand-950/10"
                  />

                  <aside className="relative z-10 w-full max-w-77.5 rounded-xl bg-white p-5 text-ink-900 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-ink-900">
                          Popular Right Now
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 divide-y divide-ink-200">
                      {products.length > 0 ? (
                        products.map((product) => {
                          const ProductIcon = iconForKeyword(
                            product.category?.name ?? product.name,
                          );
                          return (
                          <article
                            key={product.id}
                            className="flex items-center gap-3 py-2"
                          >
                            <Link
                              href={ROUTES.MARKETPLACE_PRODUCT(product.slug)}
                              className="flex min-w-0 flex-1 items-center gap-3"
                            >
                              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-ink-100">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="flex size-full items-center justify-center bg-brand-50 text-brand-700">
                                    <ProductIcon
                                      aria-hidden="true"
                                      className="size-5"
                                    />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-ink-900">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-xs font-medium text-ink-600">
                                  {formatProductPrice(product)}
                                </p>
                              </div>
                            </Link>

                            <Link
                              href={quoteHrefForProduct(product)}
                              aria-label={`Request a quote for ${product.name}`}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white transition-colors hover:bg-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                            >
                              <Plus aria-hidden="true" className="size-4" />
                            </Link>
                          </article>
                          );
                        })
                      ) : (
                        <div className="rounded-[1.35rem] border border-dashed border-ink-200 px-4 py-6 text-sm text-ink-500">
                          Product cards will appear here as suppliers publish
                          catalogue items.
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </section>

          <section className="container-page max-w-373! pb-0">
            <div className="grid gap-4 rounded-xl border border-border/70 bg-white px-6 py-3 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-xl border border-transparent xl:border-r xl:border-border/70 xl:pr-5 last:border-r-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-ink-500">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Flagship projects */}
          <FlagshipProjects projects={flagship} />

          {/* Verified property listings */}
          <section className="container-page section-y-sm">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-eyebrow mb-2">Marketplace</p>
                <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-950 sm:text-4xl">
                  Verified property listings.
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-ink-600">
                  Apartments, plots, and commercial spaces from verified sellers
                  — clear pricing, real documents.
                </p>
              </div>
              <Link href={ROUTES.PROPERTIES}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-full"
                >
                  Browse properties
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </Link>
            </header>

            {properties.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-white p-10 text-center text-sm text-ink-600">
                No properties listed yet.
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {properties.map((property) => (
                  <li key={property.slug}>
                    <PropertyCard property={property} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section
        id="shop-by-category"
        className="container-page max-w-373! pb-4 pt-1"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-sans text-2xl font-extrabold leading-7 text-ink-900">
              {clearingSearch
                ? "Shop by Category"
                : initialSearch
                  ? `Results for “${initialSearch}”`
                  : "Search results"}
            </h2>
            <p className="sr-only">
              {query || selectedDepartment
                ? `Showing category matches for "${initialSearch || "selected filters"}".`
                : "Start with the department that fits your build stage, then open the category that matches your exact sourcing need."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!clearingSearch ? (
              <Link
                href={ROUTES.MARKETPLACE}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-200 hover:bg-white hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Clear filters
              </Link>
            ) : null}
            <Link
              href={ROUTES.MARKETPLACE_REQUEST}
              className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Can&apos;t find it? Request a quote
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        {visibleGroups.length > 0 ? (
          <div className="mt-4 space-y-10">
            {visibleGroups.map(({ group, items }) => {
              const GroupIcon = iconForKeyword(group.name);

              return (
                <div
                  key={group.slug}
                  id={`department-${group.slug}`}
                  aria-label={group.name}
                  className="scroll-mt-40"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
                      <GroupIcon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-sans text-xl font-extrabold leading-6 text-ink-900">
                        {group.name}
                      </h3>
                      {group.description ? (
                        <p className="line-clamp-1 text-sm text-ink-600">
                          {group.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {items.map((category) => {
                      const count = category.productCount ?? 0;
                      const productLabel =
                        count > 0
                          ? `${count} ${count === 1 ? "product" : "products"}`
                          : category.description || "Browse category";

                      return (
                        <Link
                          key={category.slug}
                          href={ROUTES.MARKETPLACE_CATEGORY(category.slug)}
                          className="group flex flex-col overflow-hidden rounded-lg border border-border/70 bg-white shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_40px_rgba(12,48,39,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                        >
                          <div className="relative aspect-[1.65] overflow-hidden bg-ink-100">
                            <Image
                              src={imageForCategory(category) ?? heroImage}
                              alt={category.name}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 16vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-linear-to-t from-brand-950/45 via-transparent to-transparent"
                            />
                          </div>

                          <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="line-clamp-2 text-sm font-extrabold text-ink-900 group-hover:text-brand-800">
                                {category.name}
                              </p>
                              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white transition-colors group-hover:bg-brand-950">
                                <ArrowRight
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-ink-600">
                              {productLabel}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-ink-900">
              No category match yet.
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Try another keyword, clear filters, or open the quote form and let
              our desk route the request.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.MARKETPLACE}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-5"
                >
                  Clear filters
                </Button>
              </Link>
              <Link href={ROUTES.MARKETPLACE_REQUEST}>
                <Button
                  size="lg"
                  className="rounded-full bg-brand-950 px-5 text-white hover:bg-brand-900"
                >
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="container-page max-w-373! pb-8">
        <div className="grid min-h-33.5 overflow-hidden rounded-xl border border-gold-100 bg-linear-to-r from-gold-50 via-white to-gold-50 shadow-sm lg:grid-cols-[minmax(0,38.75rem)_1fr_1fr_1fr]">
          <article
            id="contractors"
            className="grid min-h-33.5 md:grid-cols-[minmax(0,1fr)_17rem]"
          >
            <div className="flex items-center gap-4 px-11 py-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-gold-400">
                <Package aria-hidden="true" className="size-7" />
              </span>
              <div>
                <h3 className="font-sans text-xl font-extrabold text-ink-900">
                  Planning a big project?
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-700">
                  Get exclusive discounts on bulk purchases.
                </p>
                <Link href={ROUTES.MARKETPLACE_REQUEST}>
                  <Button
                    size="sm"
                    className="mt-2 gap-2 rounded-md bg-brand-800 px-4 text-white hover:bg-brand-900"
                  >
                    Request a Quote
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-33.5 bg-gold-50 md:block">
              <Image
                src="/marketplace-reference/bulk-project.png"
                alt="Bulk construction materials"
                fill
                unoptimized
                sizes="272px"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-gold-50 to-transparent"
              />
            </div>
          </article>

          <article className="flex items-center gap-4 border-t border-border/70 px-8 py-5 lg:border-l lg:border-t-0">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="font-sans text-base font-extrabold text-ink-900">
                For Contractors
              </h3>
              <p className="mt-1 text-sm leading-5 text-ink-600">
                Manage projects, teams and purchases in one place.
              </p>
              <Link
                href="#shop-by-category"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Learn More
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </article>

          <article
            id="suppliers"
            className="flex items-center gap-4 border-t border-border/70 px-8 py-5 lg:border-l lg:border-t-0"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Store aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="font-sans text-base font-extrabold text-ink-900">
                For Suppliers
              </h3>
              <p className="mt-1 text-sm leading-5 text-ink-600">
                Grow your business and reach more buyers.
              </p>
              <Link
                href={ROUTES.BECOME_SUPPLIER}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Join as a Seller
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </article>

          <article
            id="project-solutions"
            className="flex items-center gap-4 border-t border-border/70 px-8 py-5 lg:border-l lg:border-t-0"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="font-sans text-base font-extrabold text-ink-900">
                Project Solutions
              </h3>
              <p className="mt-1 text-sm leading-5 text-ink-600">
                End-to-end solutions for your construction needs.
              </p>
              <Link
                href={ROUTES.PROJECTS}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Explore Solutions
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}

function MarketplaceSearchForm({
  departments,
  initialSearch,
  selectedDepartment,
  compact = false,
  className,
}: {
  departments: MarketplaceCategory[];
  initialSearch: string;
  selectedDepartment: string;
  compact?: boolean;
  className?: string;
}) {
  const selectControl = (
    <div className="relative">
      <select
        name="department"
        defaultValue={selectedDepartment}
        className={cn(
          "h-12 w-full appearance-none bg-white px-4 pr-10 text-sm font-medium text-ink-900 outline-none transition-[border-color,box-shadow] focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-200",
          compact
            ? "rounded-none border-0 border-l border-ink-200"
            : "rounded-none border border-y-0 border-l-0 border-r-ink-200",
        )}
      >
        <option value="">All Categories</option>
        {departments.map((department) => (
          <option key={department.slug} value={department.slug}>
            {department.name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-500"
      />
    </div>
  );

  const inputControl = (
    <div className="relative min-w-0">
      <input
        id={compact ? "marketplace-header-search" : "marketplace-hero-search"}
        name="search"
        type="search"
        defaultValue={initialSearch}
        autoComplete="off"
        placeholder="Search materials, equipment, services..."
        className={cn(
          "h-12 w-full bg-white px-4 text-sm font-medium text-ink-900 outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-200",
          compact ? "rounded-none border-0" : "rounded-none border-0",
        )}
      />
    </div>
  );

  return (
    <form
      action={ROUTES.MARKETPLACE}
      className={cn(
        "grid",
        compact
          ? "overflow-hidden rounded-md border border-ink-200 bg-white md:grid-cols-[minmax(0,1fr)_9.25rem_3rem]"
          : "overflow-hidden rounded-md bg-white md:grid-cols-[11rem_minmax(0,1fr)_3rem]",
        className,
      )}
    >
      <label
        className="sr-only"
        htmlFor={
          compact ? "marketplace-header-search" : "marketplace-hero-search"
        }
      >
        Search marketplace categories
      </label>

      {compact ? inputControl : selectControl}
      {compact ? selectControl : inputControl}

      <Button
        type="submit"
        size="lg"
        aria-label="Search marketplace"
        className={cn(
          "h-12 gap-2 px-4",
          compact
            ? "rounded-none bg-brand-950 text-white hover:bg-brand-900"
            : "rounded-none bg-gold-400 text-ink-900 hover:bg-gold-300",
        )}
      >
        <Search aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}
