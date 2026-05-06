// Shared validation helpers used across Zod schemas and manual checks.

export const BD_PHONE_REGEX = /^(\+8801|01)[3-9]\d{8}$/

export function isValidBdPhone(phone: string): boolean {
  return BD_PHONE_REGEX.test(phone)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
