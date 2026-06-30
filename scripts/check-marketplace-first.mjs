import { readFileSync } from "node:fs"

const marketplace = readFileSync("src/app/marketplace/page.tsx", "utf8")

function assert(condition, message) {
  if (!condition) {
    console.error(message)
    process.exitCode = 1
  }
}

const projectIndex = marketplace.indexOf('id="marketplace-projects"')
const propertyIndex = marketplace.indexOf('id="marketplace-properties"')
const categoryIndex = marketplace.indexOf('id="marketplace-categories"')

assert(projectIndex !== -1, "marketplace must expose #marketplace-projects")
assert(propertyIndex !== -1, "marketplace must expose #marketplace-properties")
assert(categoryIndex !== -1, "marketplace must expose #marketplace-categories")
assert(
  projectIndex !== -1 &&
    propertyIndex !== -1 &&
    categoryIndex !== -1 &&
    projectIndex < propertyIndex &&
    propertyIndex < categoryIndex,
  "marketplace sections must be ordered projects -> properties -> categories",
)
assert(
  marketplace.includes("bg-linear-to-b from-white via-brand-50/35 to-white"),
  "marketplace hero must use the landing page light color combination",
)
assert(
  !marketplace.includes('className="relative overflow-hidden bg-brand-950 text-white"') &&
    !marketplace.includes("[background-image:linear-gradient(to_right,white_1px"),
  "marketplace hero must not use the old dark grid treatment",
)

if (!process.exitCode) {
  console.log("marketplace-first structure ok")
}
