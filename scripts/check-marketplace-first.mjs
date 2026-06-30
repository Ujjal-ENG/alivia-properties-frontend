import { readFileSync } from "node:fs"

const home = readFileSync("src/app/(site)/page.tsx", "utf8")
const marketplace = readFileSync("src/app/marketplace/page.tsx", "utf8")

function assert(condition, message) {
  if (!condition) {
    console.error(message)
    process.exitCode = 1
  }
}

assert(
  home.includes("marketplace-first-home"),
  "homepage must expose #marketplace-first-home",
)

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

if (!process.exitCode) {
  console.log("marketplace-first structure ok")
}
