import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"

export function formatDate(date: string | Date, pattern = "d MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return format(d, pattern)
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "d MMM yyyy, h:mm a")
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatHandoverDate(dateStr: string): string {
  const d = parseISO(dateStr)
  if (!isValid(d)) return dateStr
  return format(d, "MMMM yyyy")
}

export function isDatePast(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}
