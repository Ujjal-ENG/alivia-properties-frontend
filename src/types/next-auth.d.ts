import type { UserRole } from "@/types/user.types"
// Side-effect imports so TS picks up the module declarations below.
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role: UserRole
    isVerified: boolean
    accessToken?: string
    refreshToken?: string
    rememberMe?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      isVerified: boolean
    }
    accessToken?: string
    error?: "RefreshAccessTokenError" | "SessionExpired"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    isVerified?: boolean
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    rememberMe?: boolean
    error?: "RefreshAccessTokenError" | "SessionExpired"
  }
}
