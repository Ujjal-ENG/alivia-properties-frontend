import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

const defaultToolkitOutput = "/home/ujjal-kumar-roy/Downloads/ABDM/Compressed/construction_images_toolkit/construction_images"
const toolkitRoot = path.resolve(process.env.MARKETPLACE_TOOLKIT_OUTPUT ?? defaultToolkitOutput)
const publicRoot = path.join(repoRoot, "public")
const canonicalRoot = path.join(publicRoot, "marketplace")
const manifestPath = path.join(repoRoot, "src/data/marketplace-image-manifest.generated.ts")

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"])

function buildSpecs(groupSlug, toolkitGroup, definitions) {
  return definitions.map(([slug, aliases, legacySource]) => ({
    aliases,
    groupSlug,
    legacySource,
    slug,
    toolkitGroup,
  }))
}

const categorySpecs = [
  ...buildSpecs("raw-materials", "Raw_Materials", [
    ["sand", ["sand"], "raw-materials/sand.jpg"],
    ["steel", ["steel", "rebar", "rods"], "raw-materials/steel.jpg"],
    ["cement", ["cement"], "raw-materials/cement.jpg"],
    ["concrete", ["concrete", "ready mix"], "raw-materials/concrete.jpg"],
    ["brick", ["brick", "bricks"], "raw-materials/brick.jpg"],
    ["stone", ["stone", "aggregate", "gravel"], "raw-materials/stone.jpg"],
    ["tiles", ["tiles", "tile"], "raw-materials/tiles.jpg"],
    ["wood", ["wood", "timber", "lumber"], "raw-materials/wood.jpg"],
    ["glass", ["glass"], "raw-materials/glass.jpg"],
    ["paint", ["paint"], "raw-materials/paint.jpg"],
    ["marble-granite", ["marble", "granite"], "raw-materials/marble-granite.jpg"],
    ["roofing", ["roofing", "roof", "shingles"], "raw-materials/roofing.jpg"],
  ]),
  ...buildSpecs("finishing", "Finishing_Items", [
    ["doors", ["doors", "door"], "finishing/doors.jpg"],
    ["windows", ["windows", "window"], "finishing/windows.jpg"],
    ["wooden-doors", ["wooden doors", "wood door"], "finishing/wooden-doors.jpg"],
    ["sanitary", ["sanitary", "bathroom fixtures"], "finishing/sanitary.jpg"],
    ["tap-shower", ["tap", "shower", "faucet"], "finishing/tap-shower.jpg"],
    ["bath-fittings", ["bathroom accessories", "bath fittings"], "finishing/bath-fittings.jpg"],
    ["lighting", ["lighting", "lights", "led"], "finishing/lighting.jpg"],
    ["chandelier", ["chandelier"], "finishing/chandelier.jpg"],
    ["furniture", ["furniture", "sofa"], "finishing/furniture.jpg"],
    ["kitchen-cabinets", ["kitchen cabinets", "kitchen"], "finishing/kitchen-cabinets.jpg"],
    ["stove", ["stove", "cooktop", "burner"]],
    ["heater", ["heater", "space heater"]],
    ["geyser", ["geyser", "water heater"]],
  ]),
  ...buildSpecs("utilities", "Utilities_Systems", [
    ["lift", ["lift", "elevator"]],
    ["generator", ["generator"]],
    ["ac", ["air conditioner", "ac"]],
    ["gas-line", ["gas pipeline", "gas line"]],
    ["water-supply", ["water supply", "water tank"]],
    ["ro", ["water purifier", "reverse osmosis", "ro"]],
    ["water-indicator", ["water level", "tank level", "indicator"]],
    ["solar", ["solar", "solar panels"]],
    ["wind-turbine", ["wind turbine", "wind generator"]],
    ["internet", ["satellite dish", "internet cable", "fiber optic"]],
    ["wiring", ["electrical wiring", "wiring", "cables"]],
    ["plumbing", ["plumbing", "pipes"]],
  ]),
  ...buildSpecs("safety-electronics", "Safety_Electronics", [
    ["cctv", ["cctv", "surveillance camera"]],
    ["security", ["security alarm", "security system", "alarm panel"]],
    ["fire-safety", ["fire extinguisher", "smoke detector", "sprinkler"]],
    ["electricals", ["electrical components", "distribution box", "circuit breaker"]],
    ["light", ["light bulbs", "lights", "led"], "finishing/lighting.jpg"],
    ["fan", ["fan", "ceiling fan"]],
    ["switch-socket", ["switch socket", "wall outlet", "light switch"]],
    ["electronics", ["electronic devices", "electronics", "gadgets"]],
    ["smart-home", ["smart home", "automation", "iot"]],
  ]),
  ...buildSpecs("services", "Services_Solutions", [
    ["electrician", ["electrician", "electrical technician"]],
    ["plumber", ["plumber", "fixing pipes"]],
    ["tiles-fitter", ["tile installation", "tile worker", "tiles fitter"], "raw-materials/tiles.jpg"],
    ["sanitary-tech", ["bathroom plumber", "sanitary technician"], "finishing/sanitary.jpg"],
    ["lift-tech", ["elevator technician", "lift maintenance"]],
    ["ac-tech", ["ac repair", "air conditioner technician"]],
    ["solar-tech", ["solar installer", "solar technician"]],
    ["painter", ["painter", "painting"], "raw-materials/paint.jpg"],
    ["carpenter", ["carpenter", "woodworker"], "raw-materials/wood.jpg"],
    ["cctv-installer", ["cctv installer", "camera installer"]],
    ["guard", ["security guard", "guard uniform"]],
    ["gardener", ["gardener", "landscaping"]],
    ["deep-cleaning", ["cleaning service", "deep cleaning"]],
    ["septic", ["septic tank", "waste cleaning"]],
    ["driver", ["driver", "corporate driver"]],
    ["maintenance", ["maintenance crew", "building maintenance"]],
  ]),
]

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function walkImages(rootDir) {
  if (!fs.existsSync(rootDir)) return []

  const files = []
  const queue = [rootDir]

  while (queue.length > 0) {
    const current = queue.pop()
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(absolute)
        continue
      }

      if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(absolute)
      }
    }
  }

  return files
}

function scoreMatch(filePath, aliases) {
  const name = normalize(path.basename(filePath, path.extname(filePath)))
  let score = 0

  for (const alias of aliases) {
    const normalizedAlias = normalize(alias)
    if (name.includes(normalizedAlias)) score += normalizedAlias.length
  }

  return score
}

function findBestToolkitMatch(files, aliases) {
  let bestFile = null
  let bestScore = 0

  for (const filePath of files) {
    const score = scoreMatch(filePath, aliases)
    if (score > bestScore) {
      bestFile = filePath
      bestScore = score
    }
  }

  return bestScore > 0 ? bestFile : null
}

function findExistingCanonical(groupSlug, slug) {
  const dir = path.join(canonicalRoot, groupSlug)
  if (!fs.existsSync(dir)) return null

  for (const fileName of fs.readdirSync(dir)) {
    const parsed = path.parse(fileName)
    if (parsed.name === slug && imageExtensions.has(parsed.ext.toLowerCase())) {
      return path.join(dir, fileName)
    }
  }

  return null
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeManifest(manifest) {
  const orderedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
  const lines = orderedEntries.map(([slug, imagePath]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(imagePath)},`)
  const output = [
    "// Generated file. Run `pnpm marketplace:images` to update.",
    "",
    "export const CATEGORY_IMAGE_PATHS: Record<string, string> = {",
    ...lines,
    "}",
    "",
  ].join("\n")

  fs.writeFileSync(manifestPath, output)
}

function main() {
  ensureDir(canonicalRoot)

  const toolkitFilesByGroup = new Map()
  for (const toolkitGroup of new Set(categorySpecs.map(spec => spec.toolkitGroup))) {
    toolkitFilesByGroup.set(toolkitGroup, walkImages(path.join(toolkitRoot, toolkitGroup)))
  }

  const manifest = {}
  const missing = []
  const copied = []

  for (const spec of categorySpecs) {
    const toolkitFiles = toolkitFilesByGroup.get(spec.toolkitGroup) ?? []
    const toolkitSource = findBestToolkitMatch(toolkitFiles, spec.aliases)
    const legacySource = spec.legacySource ? path.join(publicRoot, spec.legacySource) : null
    const legacyExists = legacySource ? fs.existsSync(legacySource) : false
    const existingCanonical = findExistingCanonical(spec.groupSlug, spec.slug)

    const sourcePath =
      toolkitSource ??
      (legacyExists ? legacySource : null) ??
      existingCanonical

    if (!sourcePath) {
      missing.push(`${spec.groupSlug}/${spec.slug}`)
      continue
    }

    const extension = path.extname(sourcePath).toLowerCase() || ".jpg"
    const destinationDir = path.join(canonicalRoot, spec.groupSlug)
    const destinationPath = path.join(destinationDir, `${spec.slug}${extension}`)
    ensureDir(destinationDir)

    if (path.resolve(sourcePath) !== path.resolve(destinationPath)) {
      fs.copyFileSync(sourcePath, destinationPath)
      copied.push(path.relative(repoRoot, destinationPath))
    }

    manifest[spec.slug] = `/marketplace/${spec.groupSlug}/${spec.slug}${extension}`
  }

  writeManifest(manifest)

  console.log(`Marketplace image manifest updated: ${path.relative(repoRoot, manifestPath)}`)
  console.log(`Canonical images ready: ${Object.keys(manifest).length}`)
  console.log(`Files copied this run: ${copied.length}`)

  if (missing.length > 0) {
    console.log("\nMissing categories:")
    for (const slug of missing) {
      console.log(`- ${slug}`)
    }
  } else {
    console.log("\nAll marketplace categories resolved.")
  }

  if (!fs.existsSync(toolkitRoot)) {
    console.log(`\nToolkit output not found at: ${toolkitRoot}`)
    console.log("Legacy public assets used where available.")
  }
}

main()
