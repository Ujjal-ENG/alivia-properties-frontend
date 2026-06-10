import type { SupplierKind } from "@/types/marketplace.types"

export type NormalizedMarketplaceKind = "SUPPLIER" | "SERVICE"

export function normalizeMarketplaceKind(kind?: SupplierKind | null): NormalizedMarketplaceKind {
  return kind === "service" || kind === "SERVICE" ? "SERVICE" : "SUPPLIER"
}

export function isServiceKind(kind?: SupplierKind | null) {
  return normalizeMarketplaceKind(kind) === "SERVICE"
}

export function providerLabel(kind?: SupplierKind | null) {
  return isServiceKind(kind) ? "Service Provider" : "Supplier"
}

export function providerLabelPlural(kind?: SupplierKind | null) {
  return isServiceKind(kind) ? "Service Providers" : "Suppliers"
}

export function offeringLabel(kind?: SupplierKind | null) {
  return isServiceKind(kind) ? "Service" : "Product"
}

export function offeringLabelPlural(kind?: SupplierKind | null) {
  return isServiceKind(kind) ? "Service Packages" : "Products"
}
