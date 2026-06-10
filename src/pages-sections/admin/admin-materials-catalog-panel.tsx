"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ComponentType, ReactNode } from "react"
import {
  Building2,
  CheckCircle2,
  Images,
  Loader2,
  Megaphone,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/common/file-uploader"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { marketplaceService } from "@/services/marketplace.service"
import type { MarketplaceProduct, Supplier } from "@/types/marketplace.types"
import { formatPrice } from "@/utils/format-price"
import {
  isServiceKind,
  normalizeMarketplaceKind,
  offeringLabel,
  providerLabel,
} from "@/utils/marketplace-kind"

type ProviderKind = "SUPPLIER" | "SERVICE"
type ProviderFilter = "ALL" | ProviderKind

type SupplierForm = {
  id?: string
  categorySlug: string
  kind: ProviderKind
  name: string
  logo: string
  coverImage: string
  gallery: string
  videoUrl: string
  location: string
  serviceAreas: string
  phone: string
  email: string
  tagline: string
  brands: string
  priceRange: string
  responseTimeHours: string
  deliveryDays: string
  itemsSold: string
  inStock: "in" | "out"
}

type VariantRow = {
  id?: string
  name: string
  unit: string
  sku: string
  price: string
  isActive: boolean
}

type ProductForm = {
  id?: string
  supplierId: string
  categorySlug: string
  name: string
  image: string
  price: string
  unit: string
  inStock: "in" | "out"
  moq: string
  leadTimeDays: string
  brand: string
  badge: string
  description: string
  variants: VariantRow[]
}

const emptyVariantRow = (unit = ""): VariantRow => ({
  name: "",
  unit,
  sku: "",
  price: "",
  isActive: true,
})

function inferProviderKind(categorySlug: string): ProviderKind {
  const slug = categorySlug.toLowerCase()
  return ["electrician", "ac-technician", "plumber", "repair", "maintenance", "service"].some(
    (token) => slug.includes(token),
  )
    ? "SERVICE"
    : "SUPPLIER"
}

function defaultUnitForCategory(categorySlug: string, kind: ProviderKind) {
  if (kind === "SERVICE") return "job"
  if (categorySlug === "steel") return "ton"
  if (categorySlug === "sand") return "CFT"
  if (categorySlug === "marble-granite") return "sft"
  return "bag"
}

function supplierDefaults(categorySlug: string): SupplierForm {
  const kind = inferProviderKind(categorySlug)
  return {
    categorySlug,
    kind,
    name: "",
    logo: "",
    coverImage: "",
    gallery: "",
    videoUrl: "",
    location: "Dhaka",
    serviceAreas: "Dhaka\nGazipur\nNarayanganj",
    phone: "",
    email: "",
    tagline: "",
    brands: "",
    priceRange: "Quote on request",
    responseTimeHours: "2",
    deliveryDays: "1",
    itemsSold: "",
    inStock: "in",
  }
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : undefined
}

function productDefaults(categorySlug: string, supplierId = "", kind = inferProviderKind(categorySlug)): ProductForm {
  return {
    supplierId,
    categorySlug,
    name: "",
    image: "",
    price: "",
    unit: defaultUnitForCategory(categorySlug, kind),
    inStock: "in",
    moq: "",
    leadTimeDays: "1",
    brand: "",
    badge: "",
    description: "",
    variants: [],
  }
}

export function AdminMaterialsCatalogPanel({
  token,
  categories,
  initialSuppliers,
}: {
  token: string
  categories: MarketplaceCategory[]
  initialSuppliers: Supplier[]
}) {
  // A supplier belongs to a sub-category if it's tagged with the slug OR has a
  // product in it — covers suppliers whose `categories[]` is out of sync.
  const supplierInCategory = (supplier: Supplier, slug: string) =>
    supplier.categories.includes(slug) ||
    (supplier.products ?? []).some((product) => product.categorySlug === slug)

  // Open on the first category that actually has suppliers (skip empty ones).
  const firstCategory =
    categories.find((category) =>
      initialSuppliers.some((supplier) => supplierInCategory(supplier, category.slug)),
    )?.slug ??
    categories[0]?.slug ??
    "cement"
  const router = useRouter()
  const [categorySlug, setCategorySlug] = useState(firstCategory)
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [supplierForm, setSupplierForm] = useState(() => supplierDefaults(firstCategory))
  const [productForm, setProductForm] = useState(() => productDefaults(firstCategory))
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("ALL")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Derived — the React Compiler memoizes this automatically.
  const categorySuppliers = suppliers.filter((supplier) =>
    supplierInCategory(supplier, categorySlug),
  )
  const filteredSuppliers = categorySuppliers.filter(
    (supplier) =>
      providerFilter === "ALL" || normalizeMarketplaceKind(supplier.kind) === providerFilter,
  )

  // Supplier count per category, for the filter dropdown labels.
  const countFor = (slug: string) =>
    suppliers.filter((supplier) => supplierInCategory(supplier, slug)).length

  const activeCategory = categories.find((category) => category.slug === categorySlug)
  const selectedSupplier = categorySuppliers.find((supplier) => supplier.id === productForm.supplierId)
  const activeProviderKind = normalizeMarketplaceKind(selectedSupplier?.kind ?? supplierForm.kind)
  const supplierFormProviderLabel = providerLabel(supplierForm.kind)
  const serviceMode = isServiceKind(activeProviderKind)
  const activeOfferingLabel = offeringLabel(activeProviderKind)
  const serviceCount = categorySuppliers.filter((supplier) => isServiceKind(supplier.kind)).length
  const supplierCount = categorySuppliers.length - serviceCount
  const countForFilter = (filter: ProviderFilter) =>
    filter === "ALL"
      ? categorySuppliers.length
      : filter === "SERVICE"
        ? serviceCount
        : supplierCount

  function switchCategory(slug: string) {
    setCategorySlug(slug)
    setSupplierForm(supplierDefaults(slug))
    setProductForm(productDefaults(slug))
  }

  async function refresh() {
    if (!token) return
    const res = await marketplaceService.adminListSuppliers({ limit: 100 }, token)
    setSuppliers(res.data)
    // Purge Next's client Router Cache so the public marketplace pages
    // (force-dynamic) re-fetch fresh data on the next navigation in this session.
    router.refresh()
  }

  async function saveSupplier() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const gallery = splitLines(supplierForm.gallery)
      const serviceAreas = splitLines(supplierForm.serviceAreas)
      const brands = splitLines(supplierForm.brands)
      const payload = {
        name: supplierForm.name,
        logo: supplierForm.logo || undefined,
        coverImage: supplierForm.coverImage || gallery[0] || undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
        videoUrl: supplierForm.videoUrl || undefined,
        location: supplierForm.location,
        serviceAreas: serviceAreas.length > 0 ? serviceAreas : undefined,
        phone: supplierForm.phone,
        email: supplierForm.email || undefined,
        tagline: supplierForm.tagline || undefined,
        brands: brands.length > 0 ? brands : [supplierForm.name],
        priceRange: supplierForm.priceRange || undefined,
        responseTimeHours: toOptionalNumber(supplierForm.responseTimeHours),
        deliveryDays: toOptionalNumber(supplierForm.deliveryDays),
        itemsSold: toOptionalNumber(supplierForm.itemsSold),
        inStock: supplierForm.inStock === "in",
        categories: [supplierForm.categorySlug],
        kind: supplierForm.kind,
        isVerified: true,
      }
      if (supplierForm.id) {
        await marketplaceService.adminUpdateSupplier(supplierForm.id, payload, token)
      } else {
        await marketplaceService.adminCreateSupplier(payload, token)
      }
      await refresh()
      setSupplierForm(supplierDefaults(categorySlug))
      setMessage(`${supplierFormProviderLabel} saved.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not save ${supplierFormProviderLabel.toLowerCase()}.`)
    } finally {
      setSaving(false)
    }
  }

  async function saveProduct() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const payload = {
        supplierId: productForm.supplierId,
        categorySlug: productForm.categorySlug,
        name: productForm.name,
        image: productForm.image || undefined,
        price: toOptionalNumber(productForm.price),
        unit: productForm.unit,
        inStock: productForm.inStock === "in",
        moq: toOptionalNumber(productForm.moq),
        leadTimeDays: toOptionalNumber(productForm.leadTimeDays),
        brand: productForm.brand || undefined,
        badge: productForm.badge || undefined,
        description: productForm.description || `${productForm.name} RFQ ${activeOfferingLabel.toLowerCase()}.`,
        variants: productForm.variants
          .filter((variant) => variant.name.trim())
          .map((variant) => ({
            id: variant.id,
            name: variant.name.trim(),
            unit: variant.unit.trim() || productForm.unit,
            sku: variant.sku.trim() || undefined,
            price: variant.price.trim() ? Number(variant.price) : undefined,
            isActive: variant.isActive,
          })),
      }
      if (productForm.id) {
        await marketplaceService.adminUpdateProduct(productForm.id, payload, token)
      } else {
        await marketplaceService.adminCreateProduct(payload, token)
      }
      await refresh()
      setProductForm(productDefaults(categorySlug, productForm.supplierId, activeProviderKind))
      setMessage(`${activeOfferingLabel} saved.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not save ${activeOfferingLabel.toLowerCase()}.`)
    } finally {
      setSaving(false)
    }
  }

  async function deleteSupplier(id: string) {
    if (!window.confirm("Delete this supplier/provider and its catalogue items?")) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await marketplaceService.adminDeleteSupplier(id, token)
      await refresh()
      setMessage("Listing deleted.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete listing.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this catalogue item?")) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await marketplaceService.adminDeleteProduct(id, token)
      await refresh()
      setMessage("Catalogue item deleted.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete catalogue item.")
    } finally {
      setSaving(false)
    }
  }

  function editSupplier(supplier: Supplier) {
    const nextCategory = supplier.categories[0] ?? categorySlug
    setCategorySlug(nextCategory)
    setSupplierForm({
      id: supplier.id,
      categorySlug: nextCategory,
      kind: normalizeMarketplaceKind(supplier.kind),
      name: supplier.name,
      logo: supplier.logo ?? "",
      coverImage: supplier.coverImage ?? "",
      gallery: (supplier.gallery ?? []).join("\n"),
      videoUrl: supplier.videoUrl ?? "",
      location: supplier.location,
      serviceAreas: (supplier.serviceAreas ?? []).join("\n"),
      phone: supplier.phone,
      email: supplier.email ?? "",
      tagline: supplier.tagline ?? "",
      brands: (supplier.brands ?? []).join("\n"),
      priceRange: supplier.priceRange ?? "",
      responseTimeHours:
        supplier.responseTimeHours != null ? String(supplier.responseTimeHours) : "",
      deliveryDays: supplier.deliveryDays != null ? String(supplier.deliveryDays) : "",
      itemsSold: supplier.itemsSold != null ? String(supplier.itemsSold) : "",
      inStock: supplier.inStock === false ? "out" : "in",
    })
  }

  function editProduct(product: MarketplaceProduct, supplier: Supplier) {
    setProductForm({
      id: product.id,
      supplierId: supplier.id,
      categorySlug: product.categorySlug,
      name: product.name,
      image: product.image ?? "",
      price: product.price != null && product.price > 0 ? String(product.price) : "",
      unit: product.unit,
      inStock: product.inStock === false ? "out" : "in",
      moq: product.moq != null ? String(product.moq) : "",
      leadTimeDays: product.leadTimeDays != null ? String(product.leadTimeDays) : "",
      brand: product.brand ?? "",
      badge: product.badge ?? "",
      description: product.description,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        unit: variant.unit ?? "",
        sku: variant.sku ?? "",
        price: variant.price != null ? String(variant.price) : "",
        isActive: variant.isActive !== false,
      })),
    })
  }

  function setVariantRow(index: number, patch: Partial<VariantRow>) {
    setProductForm((form) => ({
      ...form,
      variants: form.variants.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/70 bg-white p-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <label className="flex min-w-55 flex-1 flex-col gap-1 text-xs font-semibold text-ink-700">
            Sub-category
            <SearchableSelect
              ariaLabel="Filter suppliers by sub-category"
              searchPlaceholder="Search sub-categories…"
              value={categorySlug}
              onChange={switchCategory}
              options={categories.map((category) => ({
                value: category.slug,
                label: `${category.name} (${countFor(category.slug)})`,
                keywords: category.slug,
              }))}
            />
          </label>

          <label className="flex min-w-55 flex-1 flex-col gap-1 text-xs font-semibold text-ink-700">
            Listing type
            <select
              aria-label="Filter listings by supplier or service provider"
              value={providerFilter}
              onChange={(event) => setProviderFilter(event.target.value as ProviderFilter)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-ink-900"
            >
              <option value="ALL">All listings ({countForFilter("ALL")})</option>
              <option value="SUPPLIER">Suppliers ({countForFilter("SUPPLIER")})</option>
              <option value="SERVICE">Service providers ({countForFilter("SERVICE")})</option>
            </select>
          </label>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={refresh}>
          <RefreshCcw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {message ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {/* Suppliers in the selected sub-category (pick a tab above to switch) */}
      <section className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink-900">
              {providerFilter === "ALL"
                ? `Listings in ${activeCategory?.name ?? "this sub-category"}`
                : `${providerFilter === "SERVICE" ? "Service providers" : "Suppliers"} in ${activeCategory?.name ?? "this sub-category"}`}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {filteredSuppliers.length} listing{filteredSuppliers.length === 1 ? "" : "s"} · use the
              filters above to switch sub-category or provider type
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {filteredSuppliers.length}
          </span>
        </div>
        <div className="divide-y divide-border/70">
          {filteredSuppliers.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">
              No {providerFilter === "SERVICE" ? "service providers" : providerFilter === "SUPPLIER" ? "suppliers" : "listings"} in{" "}
              {activeCategory?.name ?? "this sub-category"} yet — add one with the form below.
            </p>
          ) : (
            filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900">{supplier.name}</p>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                        {providerLabel(supplier.kind)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600">{supplier.location}</p>
                    <p className="mt-1 text-xs text-ink-500">{supplier.tagline}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => editSupplier(supplier)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => deleteSupplier(supplier.id)}>
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(supplier.products ?? []).map((product) => (
                    <div key={product.id} className="rounded-xl border border-border/70 bg-ink-50/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{product.name}</p>
                          <p className="mt-0.5 text-xs text-ink-500">
                            {(product.variants ?? []).length} {isServiceKind(supplier.kind) ? "options" : "variants"} / {product.unit}
                          </p>
                          {product.price > 0 && (
                            <p className="mt-1 text-xs font-semibold text-red-600">
                              From {formatPrice(product.price, true)} / {product.unit}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <Button type="button" size="icon" variant="outline" className="size-8" aria-label={`Edit ${product.name}`} onClick={() => editProduct(product, supplier)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button type="button" size="icon" variant="outline" className="size-8" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(product.variants ?? []).map((variant) => (
                          <span key={variant.id} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700">
                            {variant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-card p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-ink-900">
              {supplierForm.id ? `Edit ${supplierFormProviderLabel.toLowerCase()}` : `Add ${supplierFormProviderLabel.toLowerCase()}`}
            </h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              {activeCategory?.name ?? supplierForm.categorySlug}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            Adding a{" "}
            <span className="font-semibold text-ink-700">{supplierFormProviderLabel.toLowerCase()}</span>{" "}
            in{" "}
            <span className="font-semibold text-ink-700">
              {activeCategory?.name ?? supplierForm.categorySlug}
            </span>{" "}
            — switch the sub-category filter above to add elsewhere.
          </p>

          <div className="mt-5 space-y-5">
            {/* Identity & contact */}
            <FieldGroup icon={Building2} title="Identity & contact">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Listing Type" required>
                  <select
                    aria-label="Listing type"
                    value={supplierForm.kind}
                    onChange={(event) =>
                      setSupplierForm((form) => ({
                        ...form,
                        kind: event.target.value as ProviderKind,
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-ink-900"
                  >
                    <option value="SUPPLIER">Supplier</option>
                    <option value="SERVICE">Service provider</option>
                  </select>
                </Field>
                <Field label={supplierForm.kind === "SERVICE" ? "Service Team Name" : "Supplier / Brand Name"} required>
                  <Input
                    aria-label="Supplier or brand name"
                    placeholder="Supplier or brand name…"
                    value={supplierForm.name}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, name: event.target.value }))}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    aria-label="Location"
                    placeholder="Bashundhara, Dhaka…"
                    value={supplierForm.location}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, location: event.target.value }))}
                  />
                </Field>
                <Field label="Phone" required>
                  <Input
                    aria-label="Phone"
                    type="tel"
                    placeholder="+88017XXXXXXXX…"
                    value={supplierForm.phone}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, phone: event.target.value }))}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    aria-label="Email"
                    placeholder="sales@example.com…"
                    type="email"
                    value={supplierForm.email}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, email: event.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>

            {/* Media — uploads go through the MinIO uploads service */}
            <FieldGroup
              icon={Images}
              title="Media"
              hint="Files upload straight to storage — no need to paste URLs."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FileUploader
                  kind="category-image"
                  label="Logo"
                  hint="Square logo · max 8 MB"
                  value={supplierForm.logo ? [supplierForm.logo] : []}
                  onChange={(urls) =>
                    setSupplierForm((form) => ({ ...form, logo: urls[0] ?? "" }))
                  }
                />
                <FileUploader
                  kind="category-image"
                  label="Cover image"
                  hint="Wide banner · max 8 MB"
                  value={supplierForm.coverImage ? [supplierForm.coverImage] : []}
                  onChange={(urls) =>
                    setSupplierForm((form) => ({ ...form, coverImage: urls[0] ?? "" }))
                  }
                />
              </div>
              <FileUploader
                kind="category-image"
                label="Gallery"
                hint="Up to 12 photos · max 8 MB each"
                multiple
                value={splitLines(supplierForm.gallery)}
                onChange={(urls) =>
                  setSupplierForm((form) => ({ ...form, gallery: urls.join("\n") }))
                }
              />
              <FileUploader
                kind="property-video"
                label="Video"
                hint="MP4 / WebM · max 60 MB"
                value={supplierForm.videoUrl ? [supplierForm.videoUrl] : []}
                onChange={(urls) =>
                  setSupplierForm((form) => ({ ...form, videoUrl: urls[0] ?? "" }))
                }
              />
            </FieldGroup>

            {/* Terms & logistics */}
            <FieldGroup icon={Truck} title="Terms & logistics">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Price Line">
                  <Input
                    aria-label="Price range label"
                    placeholder="Quote per bag / ton / sft…"
                    value={supplierForm.priceRange}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, priceRange: event.target.value }))}
                  />
                </Field>
                <Field label="Stock Status">
                  <select
                    aria-label="Stock status"
                    value={supplierForm.inStock}
                    onChange={(event) =>
                      setSupplierForm((form) => ({
                        ...form,
                        inStock: event.target.value as SupplierForm["inStock"],
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-ink-900"
                  >
                    <option value="in">{supplierForm.kind === "SERVICE" ? "Available now" : "In stock"}</option>
                    <option value="out">{supplierForm.kind === "SERVICE" ? "Schedule needed" : "Out of stock"}</option>
                  </select>
                </Field>
                <Field label="Response Time (hours)">
                  <Input
                    aria-label="Response time hours"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="2…"
                    value={supplierForm.responseTimeHours}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, responseTimeHours: event.target.value }))}
                  />
                </Field>
                <Field label={supplierForm.kind === "SERVICE" ? "Visit / Booking Days" : "Delivery Days"}>
                  <Input
                    aria-label="Delivery days"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="1…"
                    value={supplierForm.deliveryDays}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, deliveryDays: event.target.value }))}
                  />
                </Field>
                <Field label={supplierForm.kind === "SERVICE" ? "Jobs Completed" : "Items Sold"}>
                  <Input
                    aria-label="Items sold"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="1200…"
                    value={supplierForm.itemsSold}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, itemsSold: event.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>

            {/* Pitch & coverage */}
            <FieldGroup icon={Megaphone} title="Pitch & coverage">
              <Field label="Tagline">
                <Textarea
                  aria-label="Tagline"
                  placeholder="Short sales hook for buyers…"
                  value={supplierForm.tagline}
                  onChange={(event) => setSupplierForm((form) => ({ ...form, tagline: event.target.value }))}
                />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Service Areas" hint="One area per line">
                  <Textarea
                    aria-label="Service areas"
                    placeholder={"Dhaka\nGazipur\nNarayanganj"}
                    value={supplierForm.serviceAreas}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, serviceAreas: event.target.value }))}
                  />
                </Field>
                <Field label="Brand Tags" hint="One brand per line">
                  <Textarea
                    aria-label="Brand tags"
                    placeholder={"Shah Cement\nPremium OPC"}
                    value={supplierForm.brands}
                    onChange={(event) => setSupplierForm((form) => ({ ...form, brands: event.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex gap-2 border-t border-border/60 pt-4">
              <Button type="button" disabled={saving || !supplierForm.name || !supplierForm.phone} onClick={saveSupplier}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save listing
              </Button>
              {supplierForm.id ? (
                <Button type="button" variant="outline" onClick={() => setSupplierForm(supplierDefaults(categorySlug))}>
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="surface-card p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-ink-900">
              {productForm.id ? `Edit ${activeOfferingLabel.toLowerCase()}` : `Add ${activeOfferingLabel.toLowerCase()}`}
            </h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              Buyer-facing
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            These fields feed buyer-facing cards so customers can compare price, options, availability, and lead time.
          </p>

          <div className="mt-5 space-y-5">
            <FieldGroup
              icon={Package}
              title="Catalogue identity & pricing"
              hint={serviceMode ? "Use service-first names, clear coverage, and realistic Bangladesh pricing." : "Use clean names, real images, and indicative Bangladesh pricing."}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Supplier" required>
                  <SearchableSelect
                    ariaLabel="Product supplier"
                    placeholder="Select supplier"
                    searchPlaceholder="Search suppliers…"
                    value={productForm.supplierId}
                    onChange={(value) => setProductForm((form) => ({ ...form, supplierId: value }))}
                    options={categorySuppliers.map((supplier) => ({
                      value: supplier.id,
                      label: supplier.name,
                    }))}
                  />
                </Field>
                <Field label={serviceMode ? "Service Package Name" : "Product Line Name"} required>
                  <Input
                    aria-label="Product line name"
                    placeholder="Product line name…"
                    value={productForm.name}
                    onChange={(event) => setProductForm((form) => ({ ...form, name: event.target.value }))}
                  />
                </Field>
                <Field label={serviceMode ? "Team / Brand" : "Brand"}>
                  <Input
                    aria-label="Brand"
                    placeholder="Brand…"
                    value={productForm.brand}
                    onChange={(event) => setProductForm((form) => ({ ...form, brand: event.target.value }))}
                  />
                </Field>
                <Field label={serviceMode ? "Unit / Billing Basis" : "Unit"}>
                  <Input
                    aria-label="Unit"
                    placeholder="bag / ton / sft…"
                    value={productForm.unit}
                    onChange={(event) => setProductForm((form) => ({ ...form, unit: event.target.value }))}
                  />
                </Field>
                <Field label="Indicative Price">
                  <Input
                    aria-label="Indicative price"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="2500…"
                    value={productForm.price}
                    onChange={(event) => setProductForm((form) => ({ ...form, price: event.target.value }))}
                  />
                </Field>
                <Field label={serviceMode ? "Availability" : "Stock Status"}>
                  <select
                    aria-label="Product stock status"
                    value={productForm.inStock}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        inStock: event.target.value as ProductForm["inStock"],
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal text-ink-900"
                  >
                    <option value="in">{serviceMode ? "Available now" : "In stock"}</option>
                    <option value="out">{serviceMode ? "Schedule needed" : "Out of stock"}</option>
                  </select>
                </Field>
                <Field label={serviceMode ? "Minimum Booking" : "MOQ"}>
                  <Input
                    aria-label="Minimum order quantity"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="20…"
                    value={productForm.moq}
                    onChange={(event) => setProductForm((form) => ({ ...form, moq: event.target.value }))}
                  />
                </Field>
                <Field label={serviceMode ? "Visit Lead (days)" : "Lead Time (days)"}>
                  <Input
                    aria-label="Lead time days"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="2…"
                    value={productForm.leadTimeDays}
                    onChange={(event) => setProductForm((form) => ({ ...form, leadTimeDays: event.target.value }))}
                  />
                </Field>
                <Field label="Badge">
                  <Input
                    aria-label="Badge"
                    placeholder="Best seller / Fast moving…"
                    value={productForm.badge}
                    onChange={(event) => setProductForm((form) => ({ ...form, badge: event.target.value }))}
                  />
                </Field>
              </div>

              <FileUploader
                kind="category-image"
                label={serviceMode ? "Service cover image" : "Product image"}
                hint="Wide product shot · max 8 MB"
                value={productForm.image ? [productForm.image] : []}
                onChange={(urls) =>
                  setProductForm((form) => ({ ...form, image: urls[0] ?? "" }))
                }
              />

              <Field label="Description">
                <Textarea
                  aria-label="Description"
                  placeholder="Buyer-facing product summary…"
                  value={productForm.description}
                  onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))}
                />
              </Field>
            </FieldGroup>

            <FieldGroup
              icon={Package}
              title={serviceMode ? "Packages & options" : "Sizes & variants"}
              hint={serviceMode ? "Add service packages, visit types, and option pricing buyers can understand quickly." : "Add sizes, finishes, and per-option prices buyers can recognize quickly."}
            >
              {productForm.variants.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-white/60 px-3 py-2 text-center text-[11px] text-ink-500">
                  No variants — the product is quote-ready as a single line.
                </p>
              ) : (
                <div className="space-y-2">
                  {productForm.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5"
                    >
                      <Input
                        aria-label="Variant name"
                        placeholder="Variant name…"
                        value={variant.name}
                        onChange={(event) => setVariantRow(index, { name: event.target.value })}
                        className="h-8 min-w-37.5 flex-1 text-sm"
                      />
                      <Input
                        aria-label="Variant unit"
                        placeholder="Unit…"
                        value={variant.unit}
                        onChange={(event) => setVariantRow(index, { unit: event.target.value })}
                        className="h-8 w-20 text-sm"
                      />
                      <Input
                        aria-label="Variant SKU"
                        placeholder="SKU…"
                        value={variant.sku}
                        onChange={(event) => setVariantRow(index, { sku: event.target.value })}
                        className="h-8 w-24 text-sm"
                      />
                      <Input
                        aria-label="Variant price"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="2500…"
                        value={variant.price}
                        onChange={(event) => setVariantRow(index, { price: event.target.value })}
                        className="h-8 w-24 text-sm"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:bg-destructive/10"
                        aria-label="Remove variant"
                        onClick={() =>
                          setProductForm((form) => ({
                            ...form,
                            variants: form.variants.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setProductForm((form) => ({
                    ...form,
                    variants: [...form.variants, emptyVariantRow(form.unit)],
                  }))
                }
              >
                <Plus className="size-3.5" /> {serviceMode ? "Add package" : "Add variant"}
              </Button>
            </FieldGroup>

            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button type="button" disabled={saving || !productForm.supplierId || !productForm.name} onClick={saveProduct}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {serviceMode ? "Save service" : "Save product"}
              </Button>
              {productForm.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProductForm(productDefaults(categorySlug, productForm.supplierId, activeProviderKind))}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </div>

    </div>
  )
}

/** Labelled section with an icon header — groups related fields in the form. */
function FieldGroup({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-border/60 bg-ink-50/30 p-4">
      <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-700">
        {Icon ? <Icon className="size-3.5 text-brand-600" /> : null}
        {title}
      </legend>
      {hint ? <p className="-mt-1 text-[11px] text-ink-500">{hint}</p> : null}
      {children}
    </fieldset>
  )
}

/** A single labelled field row (label + control + optional required mark / hint). */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
      <span className="flex items-center gap-1">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {hint ? <span className="font-normal text-ink-400">· {hint}</span> : null}
      </span>
      {children}
    </label>
  )
}
