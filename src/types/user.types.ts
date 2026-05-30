/**
 * Lowercased role values used throughout the frontend.
 * The backend (Prisma enum) returns uppercase: ADMIN | SELLER | BUYER.
 * Use `normalizeRole` when converting backend → frontend.
 */
export type UserRole = "admin" | "seller" | "buyer"

export const USER_ROLES: UserRole[] = ["admin", "seller", "buyer"]

export type AuthUser = {
  id: string
  name: string
  email: string
  phone?: string
  whatsApp?: string
  avatar?: string
  role: UserRole
  isVerified: boolean
}

export type User = AuthUser & {
  createdAt?: string
  updatedAt?: string
}

export type Seller = User & { role: "seller" }
export type Buyer = User & { role: "buyer" }
export type Admin = User & { role: "admin" }

/** Convert a backend role (`"ADMIN"` | `"SELLER"` | `"BUYER"`) to the frontend lowercase form. */
export function normalizeRole(role: string | undefined | null): UserRole {
  const v = (role ?? "").toLowerCase()
  if (v === "admin" || v === "seller" || v === "buyer") return v
  return "buyer"
}
