import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ROUTES } from "@/config/routes.config"
import type { UserRole } from "@/types/user.types"

export async function requireRole(role: UserRole) {
  const session = await auth()

  if (!session?.user) {
    redirect(ROUTES.LOGIN)
  }

  if (session.user.role !== role) {
    redirect(ROUTES.UNAUTHORIZED)
  }

  return session
}
