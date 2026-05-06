// Placeholder auth — replace entirely when real auth backend is ready.
// Do NOT use this for anything security-sensitive.

import type { AuthUser } from "@/types/user.types"
import { LS_AUTH_USER } from "@/lib/constants"

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_AUTH_USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(LS_AUTH_USER, JSON.stringify(user))
}

export function clearAuthUser(): void {
  localStorage.removeItem(LS_AUTH_USER)
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null
}
