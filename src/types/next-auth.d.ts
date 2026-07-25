import type { UserRole } from "@/types/user.types"
// Side-effect imports so TS picks up the module declarations below.
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role: UserRole
    isVerified: boolean
    accessToken?: string
    // refreshToken?: string   // DISABLED — refresh flow is off, see src/auth.ts header comment
    // rememberMe?: boolean    // DISABLED — same
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
    // error?: "RefreshAccessTokenError" | "SessionExpired"   // DISABLED — same
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    isVerified?: boolean
    accessToken?: string
    // refreshToken?: string      // DISABLED — same
    // accessTokenExpires?: number // DISABLED — same
    // rememberMe?: boolean        // DISABLED — same
    // error?: "RefreshAccessTokenError" | "SessionExpired" // DISABLED — same
  }
}
