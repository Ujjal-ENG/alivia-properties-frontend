import type { UserRole } from "@/types/user.types"

// Maps roles to the routes they are allowed to access.
// Used in middleware and protected layout guards.
export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  admin: ["/admin"],
  seller: ["/seller"],
  buyer: ["/buyer"],
}

export function isRouteAllowed(pathname: string, role: UserRole): boolean {
  const allowed = ROLE_ALLOWED_PREFIXES[role]
  return allowed.some((prefix) => pathname.startsWith(prefix))
}
