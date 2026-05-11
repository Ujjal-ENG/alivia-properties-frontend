import type { UserRole } from "@/types/user.types"
import { ROUTES } from "@/config/routes.config"

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return ROUTES.ADMIN_DASHBOARD
    case "seller":
      return ROUTES.SELLER_DASHBOARD
    case "buyer":
      return ROUTES.BUYER_DASHBOARD
  }
}
