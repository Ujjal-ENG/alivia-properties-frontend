import { type NextRequest } from "next/server"
import { ok, unauthorized, badRequest } from "@/app/api/_utils/api-response"
import { DUMMY_AUTH_USERS } from "@/data/dummy-users"
import type { AuthUser, UserRole } from "@/types/user.types"

function toAuthUser(user: Record<string, unknown>): AuthUser {
  return {
    id:         user.id as string,
    name:       user.name as string,
    email:      user.email as string,
    role:       user.role as UserRole,
    avatar:     user.avatar as string | undefined,
    isVerified: user.isVerified as boolean,
  }
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const body = await request.json()
  const { email, password, role } = body as { email?: string; password?: string; role?: UserRole }

  if (!email || !password || !role) return badRequest("Email, password and role required")

  if (role === "admin") {
    const a = DUMMY_AUTH_USERS.admin
    if (a.email === email && a.password === password) return ok(toAuthUser(a as Record<string, unknown>), "Login successful")
  }

  if (role === "seller") {
    const s = DUMMY_AUTH_USERS.sellers.find((u) => u.email === email && u.password === password)
    if (s) return ok(toAuthUser(s as Record<string, unknown>), "Login successful")
  }

  if (role === "buyer") {
    const b = DUMMY_AUTH_USERS.buyers.find((u) => u.email === email && u.password === password)
    if (b) return ok(toAuthUser(b as Record<string, unknown>), "Login successful")
  }

  return unauthorized("Invalid credentials")
}
