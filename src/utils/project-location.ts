const URL_PATTERN = /^https?:\/\//i

function looksLikeUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim())
}

// Some project records have a pasted Google Maps link sitting in the
// location/address field instead of a plain-text address — never show
// that to visitors.
export function pickLocationText(
  candidates: Array<string | null | undefined>,
  fallback: string,
): string {
  return candidates.find((value) => value && !looksLikeUrl(value)) ?? fallback
}
