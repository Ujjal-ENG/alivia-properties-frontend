"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Store,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FileUploader } from "@/components/common/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  marketplaceService,
  type MarketplaceCategory,
  type SupplierWithProducts,
} from "@/services/marketplace.service";
import type { MarketplaceProduct } from "@/types/marketplace.types";
import { formatPrice } from "@/utils/format-price";

type VariantRow = {
  id?: string;
  name: string;
  unit: string;
  sku: string;
  price: string;
  isActive: boolean;
};

type ProductForm = {
  id?: string;
  supplierId: string;
  categorySlug: string;
  name: string;
  image: string;
  unit: string;
  price: string;
  description: string;
  inStock: boolean;
  moq: string;
  leadTimeDays: string;
  brand: string;
  badge: string;
  variants: VariantRow[];
};

const emptyVariant = (unit = ""): VariantRow => ({
  name: "",
  unit,
  sku: "",
  price: "",
  isActive: true,
});

function productDefaults(supplierId = "", categorySlug = ""): ProductForm {
  return {
    supplierId,
    categorySlug,
    name: "",
    image: "",
    unit: "unit",
    price: "",
    description: "",
    inStock: true,
    moq: "",
    leadTimeDays: "",
    brand: "",
    badge: "",
    variants: [],
  };
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
}

export function SellerCataloguePanel({
  token,
  initialSuppliers,
  categories,
}: {
  token: string;
  initialSuppliers: SupplierWithProducts[];
  categories: MarketplaceCategory[];
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    initialSuppliers[0]?.id ?? "",
  );
  const firstCategory = categories[0]?.slug ?? "";
  const [productForm, setProductForm] = useState<ProductForm>(() =>
    productDefaults(initialSuppliers[0]?.id ?? "", firstCategory),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectedSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) ?? suppliers[0];
  const products = selectedSupplier?.products ?? [];
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  async function refresh() {
    if (!token) return;
    try {
      const next = await marketplaceService.sellerListSuppliers(token);
      setSuppliers(next);
      // Purge Next's client Router Cache so the public marketplace pages
      // (force-dynamic) re-fetch fresh data on the next navigation in this session.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh.");
    }
  }

  function startCreate() {
    setError(null);
    setMessage(null);
    setProductForm(productDefaults(selectedSupplier?.id ?? "", firstCategory));
  }

  function editProduct(product: MarketplaceProduct) {
    setError(null);
    setMessage(null);
    setProductForm({
      id: product.id,
      supplierId: product.supplierId,
      categorySlug: product.categorySlug,
      name: product.name,
      image: product.image ?? "",
      unit: product.unit,
      price: product.price != null ? String(product.price) : "",
      description: product.description ?? "",
      inStock: product.inStock !== false,
      moq: product.moq != null ? String(product.moq) : "",
      leadTimeDays:
        product.leadTimeDays != null ? String(product.leadTimeDays) : "",
      brand: product.brand ?? "",
      badge: product.badge ?? "",
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        unit: variant.unit ?? "",
        sku: variant.sku ?? "",
        price: variant.price != null ? String(variant.price) : "",
        isActive: variant.isActive !== false,
      })),
    });
  }

  function setVariant(index: number, patch: Partial<VariantRow>) {
    setProductForm((form) => ({
      ...form,
      variants: form.variants.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));
  }

  async function saveProduct() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        supplierId: productForm.supplierId,
        categorySlug: productForm.categorySlug,
        name: productForm.name,
        image: productForm.image || undefined,
        price: toOptionalNumber(productForm.price),
        unit: productForm.unit || undefined,
        description: productForm.description || undefined,
        inStock: productForm.inStock,
        moq: toOptionalNumber(productForm.moq),
        leadTimeDays: toOptionalNumber(productForm.leadTimeDays),
        brand: productForm.brand || undefined,
        badge: productForm.badge || undefined,
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
      };
      if (productForm.id) {
        await marketplaceService.sellerUpdateProduct(
          productForm.id,
          payload,
          token,
        );
      } else {
        await marketplaceService.sellerCreateProduct(payload, token);
      }
      await refresh();
      setProductForm(productDefaults(productForm.supplierId, firstCategory));
      setMessage(
        productForm.id
          ? "Product updated."
          : "Product added to your catalogue.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Remove this product from your catalogue?")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await marketplaceService.sellerDeleteProduct(id, token);
      await refresh();
      if (productForm.id === id)
        setProductForm(productDefaults(selectedSupplierId, firstCategory));
      setMessage("Product removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete product.",
      );
    } finally {
      setSaving(false);
    }
  }

  // No suppliers routed to this seller yet — nothing they can manage.
  if (suppliers.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Store className="size-6" />
        </span>
        <h2 className="font-heading text-lg font-semibold text-ink-900">
          No supplier profile assigned yet
        </h2>
        <p className="max-w-md text-sm text-ink-600">
          Your catalogue lives under a marketplace supplier profile. Ask an
          admin to create your supplier and set you as its owner — then you can
          add products and services here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Supplier switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-600">Supplier:</span>
          {suppliers.map((supplier) => (
            <button
              key={supplier.id}
              type="button"
              onClick={() => {
                setSelectedSupplierId(supplier.id);
                setProductForm(productDefaults(supplier.id, firstCategory));
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                supplier.id === selectedSupplier?.id
                  ? "bg-brand-600 text-white"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200",
              )}
            >
              {supplier.name}
              <span className="ml-1.5 opacity-70">
                {(supplier.products ?? []).length}
              </span>
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={refresh}
        >
          <RefreshCcw className="size-3.5" /> Refresh
        </Button>
      </div>

      {message ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {message}
        </p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4" /> {error}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Existing products */}
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-ink-900">
                {selectedSupplier?.name} catalogue
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">
                {products.length} listing{products.length === 1 ? "" : "s"}{" "}
                buyers can request a quote on
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={startCreate}
              className="gap-1.5"
            >
              <Plus className="size-3.5" /> New
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Package className="size-7 text-ink-300" />
              <p className="text-sm font-medium text-ink-700">
                No products yet
              </p>
              <p className="text-xs text-ink-500">
                Use the form to add your first product or service line.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {products.map((product) => (
                <li key={product.id} className="flex items-center gap-3 p-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-ink-50">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-ink-300">
                        <Package className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {product.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          product.inStock
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {product.inStock ? "In stock" : "On order"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {categoryName(product.categorySlug)} ·{" "}
                      {product.price > 0
                        ? formatPrice(product.price, true)
                        : "Quote"}{" "}
                      / {product.unit}
                      {(product.variants?.length ?? 0) > 0
                        ? ` · ${product.variants?.length} variant${product.variants?.length === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-9"
                      aria-label={`Edit ${product.name}`}
                      onClick={() => editProduct(product)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-9 text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add / edit form */}
        <section className="surface-card p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-ink-900">
              {productForm.id ? "Edit product" : "Add product"}
            </h2>
            {productForm.id ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-ink-500"
                onClick={startCreate}
              >
                <X className="size-3.5" /> Cancel edit
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
              <span className="flex items-center gap-1">
                Sub-category <span className="text-destructive">*</span>
              </span>
              <select
                aria-label="Product sub-category"
                value={productForm.categorySlug}
                onChange={(event) =>
                  setProductForm((form) => ({
                    ...form,
                    categorySlug: event.target.value,
                  }))
                }
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-normal text-ink-900"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : null}
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
              <span className="flex items-center gap-1">
                Product / service name{" "}
                <span className="text-destructive">*</span>
              </span>
              <Input
                aria-label="Product name"
                placeholder="e.g. Shah Cement PCC 50kg"
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((form) => ({
                    ...form,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <FileUploader
              kind="category-image"
              label="Photo"
              hint="One product photo · max 8 MB"
              value={productForm.image ? [productForm.image] : []}
              onChange={(urls) =>
                setProductForm((form) => ({ ...form, image: urls[0] ?? "" }))
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Indicative price (৳)
                <Input
                  aria-label="Indicative price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Leave blank for quote-only"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      price: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Unit
                <Input
                  aria-label="Unit"
                  placeholder="bag / ton / sft…"
                  value={productForm.unit}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      unit: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Min. order (MOQ)
                <Input
                  aria-label="Minimum order quantity"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="optional"
                  value={productForm.moq}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      moq: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Lead time (days)
                <Input
                  aria-label="Lead time days"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="optional"
                  value={productForm.leadTimeDays}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      leadTimeDays: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Brand
                <Input
                  aria-label="Brand"
                  placeholder="optional"
                  value={productForm.brand}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      brand: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
                Badge
                <Input
                  aria-label="Badge"
                  placeholder="e.g. Best seller"
                  value={productForm.badge}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      badge: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold text-ink-700">
              Description
              <Textarea
                aria-label="Description"
                placeholder="What buyers should know — quality, sizes, coverage…"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((form) => ({
                    ...form,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-ink-700">
              <input
                type="checkbox"
                checked={productForm.inStock}
                onChange={(event) =>
                  setProductForm((form) => ({
                    ...form,
                    inStock: event.target.checked,
                  }))
                }
                className="size-4 rounded border-border text-brand-600"
              />
              In stock / available now
            </label>

            {/* Variants */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-ink-50/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Variants / sizes
              </p>
              <p className="text-[11px] text-ink-500">
                Optional. List the concrete sizes/SKUs you offer so buyers can
                pick one in their quote.
              </p>
              {productForm.variants.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-white/60 px-3 py-2 text-center text-[11px] text-ink-500">
                  No variants — listed as a single quote-ready line.
                </p>
              ) : (
                productForm.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5"
                  >
                    <Input
                      aria-label="Variant name"
                      placeholder="Variant name"
                      value={variant.name}
                      onChange={(event) =>
                        setVariant(index, { name: event.target.value })
                      }
                      className="h-8 min-w-35 flex-1 text-sm"
                    />
                    <Input
                      aria-label="Variant unit"
                      placeholder="unit"
                      value={variant.unit}
                      onChange={(event) =>
                        setVariant(index, { unit: event.target.value })
                      }
                      className="h-8 w-16 text-sm"
                    />
                    <Input
                      aria-label="Variant SKU"
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(event) =>
                        setVariant(index, { sku: event.target.value })
                      }
                      className="h-8 w-20 text-sm"
                    />
                    <Input
                      aria-label="Variant price"
                      type="number"
                      min={0}
                      placeholder="৳"
                      value={variant.price}
                      onChange={(event) =>
                        setVariant(index, { price: event.target.value })
                      }
                      className="h-8 w-20 text-sm"
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
                ))
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setProductForm((form) => ({
                    ...form,
                    variants: [...form.variants, emptyVariant(form.unit)],
                  }))
                }
              >
                <Plus className="size-3.5" /> Add variant
              </Button>
            </div>

            <div className="flex gap-2 border-t border-border/60 pt-4">
              <Button
                type="button"
                disabled={
                  saving ||
                  !productForm.name ||
                  !productForm.categorySlug ||
                  !productForm.supplierId
                }
                onClick={saveProduct}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {productForm.id ? "Update product" : "Add product"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
