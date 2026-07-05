export type ProjectDescriptionSpec = {
  label: string
  value: string
}

export type ProjectDescriptionContent = {
  specs: ProjectDescriptionSpec[]
  highlights: string[]
  paragraphs: string[]
}

type KnownLabel = {
  label: string
  patterns: string[]
}

const KNOWN_LABELS: KnownLabel[] = [
  { label: "Project name", patterns: ["project name"] },
  { label: "Project status", patterns: ["project status", "status"] },
  { label: "Address", patterns: ["address"] },
  { label: "Land area", patterns: ["land area", "land size"] },
  { label: "Facing", patterns: ["facing"] },
  { label: "Building height", patterns: ["building height"] },
  { label: "Unit/floor", patterns: ["unit/floor", "units/floor"] },
  { label: "Number of units", patterns: ["number of units", "total units"] },
  { label: "Total apartment", patterns: ["total apartment"] },
  { label: "Total parking", patterns: ["total parking", "parking"] },
  { label: "Handover date", patterns: ["handover date"] },
  { label: "Handover", patterns: ["handover"] },
  { label: "Apartment size", patterns: ["apartment size", "unit size"] },
  { label: "Developer", patterns: ["developer"] },
]

const LABEL_HINTS = new Set([
  "name",
  "status",
  "address",
  "size",
  "area",
  "facing",
  "height",
  "floor",
  "floors",
  "unit",
  "units",
  "parking",
  "handover",
  "developer",
])

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function splitStructuredSegments(description: string): string[] {
  return description
    .split("*")
    .map(normalizeWhitespace)
    .filter(Boolean)
}

function splitParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map(normalizeWhitespace)
    .filter(Boolean)
}

function isStandaloneLabel(segment: string): boolean {
  const words = normalizeWhitespace(segment)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)

  return (
    words.length > 0 &&
    words.length <= 4 &&
    words.some((word) => LABEL_HINTS.has(word.replace(/[^\w/]/g, "")))
  )
}

function readKnownLabel(segment: string): { label: string; value?: string } | null {
  const normalized = normalizeWhitespace(segment)
  const lower = normalized.toLowerCase()

  for (const known of KNOWN_LABELS) {
    for (const pattern of known.patterns) {
      if (lower === pattern) {
        return { label: known.label }
      }

      if (lower.startsWith(`${pattern} `)) {
        const value = normalizeWhitespace(normalized.slice(pattern.length))
        return value ? { label: known.label, value } : { label: known.label }
      }
    }
  }

  return null
}

function dedupeSpecs(specs: ProjectDescriptionSpec[]): ProjectDescriptionSpec[] {
  const seen = new Set<string>()

  return specs.filter((spec) => {
    const key = `${spec.label.toLowerCase()}::${spec.value.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function parseProjectDescription(description?: string | null): ProjectDescriptionContent {
  const raw = normalizeWhitespace(description ?? "")
  if (!raw) {
    return { specs: [], highlights: [], paragraphs: [] }
  }

  if (!raw.includes("*")) {
    return {
      specs: [],
      highlights: [],
      paragraphs: splitParagraphs(description ?? ""),
    }
  }

  const segments = splitStructuredSegments(raw)
  const specs: ProjectDescriptionSpec[] = []
  const highlights: string[] = []

  for (let index = 0; index < segments.length; index += 1) {
    const current = segments[index]
    const next = segments[index + 1]
    const known = readKnownLabel(current)

    if (known?.value) {
      let value = known.value
      if (value.endsWith(",") && next && !readKnownLabel(next) && !isStandaloneLabel(next)) {
        value = normalizeWhitespace(`${value} ${next}`)
        index += 1
      }
      specs.push({ label: known.label, value })
      continue
    }

    if (known && next && !readKnownLabel(next)) {
      specs.push({ label: known.label, value: next })
      index += 1
      continue
    }

    if (isStandaloneLabel(current) && next && !readKnownLabel(next) && !isStandaloneLabel(next)) {
      const label = current.charAt(0).toUpperCase() + current.slice(1).toLowerCase()
      specs.push({ label, value: next })
      index += 1
      continue
    }

    highlights.push(current)
  }

  return {
    specs: dedupeSpecs(specs),
    highlights: dedupeStrings(highlights),
    paragraphs: [],
  }
}
