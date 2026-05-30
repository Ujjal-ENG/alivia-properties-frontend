import { httpClient } from "./http-client"
import { normalizeRole, type UserRole } from "@/types/user.types"

export type RegisterInput = {
  name: string
  email: string
  phone?: string
  role: UserRole
  password: string
}

type AuthUser = {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  role: string
  isVerified: boolean
}

type AuthPayload = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

function toBackendRole(role: UserRole): "ADMIN" | "SELLER" | "BUYER" {
  if (role === "admin") return "ADMIN"
  if (role === "seller") return "SELLER"
  return "BUYER"
}

export const authService = {
  register(input: RegisterInput): Promise<AuthPayload & { user: AuthUser & { role: UserRole } }> {
    return httpClient
      .post<AuthPayload>("/auth/register", {
        ...input,
        role: toBackendRole(input.role),
      })
      .then((payload) => ({
        ...payload,
        user: {
          ...payload.user,
          role: normalizeRole(payload.user.role),
        },
      }))
  },

  forgotPassword(email: string): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>("/auth/forgot-password", { email })
  },

  verifyEmail(token: string): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>("/auth/verify-email", { token })
  },

  resendVerification(email: string): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>("/auth/resend-verification", { email })
  },
}
