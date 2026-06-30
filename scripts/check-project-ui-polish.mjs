import { readFileSync } from "node:fs"

const projectCard = readFileSync("src/components/projects/project-card.tsx", "utf8")
const detailPage = readFileSync("src/app/(site)/projects/[slug]/page.tsx", "utf8")
const adminViews = readFileSync("src/pages-sections/admin/admin-views.tsx", "utf8")
const marketplace = readFileSync("src/app/marketplace/page.tsx", "utf8")

function assert(condition, message) {
  if (!condition) {
    console.error(message)
    process.exitCode = 1
  }
}

assert(projectCard.includes("line-clamp-2") && projectCard.includes("project.tagline"), "project card tagline must be clamped")
assert(detailPage.includes("ProjectImageLightboxButton"), "project gallery must expose image lightbox buttons")
assert(detailPage.includes("<iframe") && detailPage.includes("mapEmbedUrl"), "project detail must render map URLs in an iframe")
assert(adminViews.includes("max-w-[18rem]") && adminViews.includes("break-all"), "admin project row location must not stretch the table")
assert(!marketplace.includes("sm:grid-cols-[10rem_1fr]"), "marketplace project/property cards must be vertical cards")

if (!process.exitCode) {
  console.log("project ui polish structure ok")
}
