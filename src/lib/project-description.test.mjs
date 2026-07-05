import assert from "node:assert/strict"
import test from "node:test"

import { parseProjectDescription } from "./project-description.ts"

test("extracts project facts from star-separated descriptions", () => {
  const result = parseProjectDescription(
    "* Project name JBS MIKADO * Project Status * Ongoing * Land Area 20 Katha * Apartment Size * A-3020 SQFT, B-2975 SQFT * Shopping Complex",
  )

  assert.deepEqual(result.specs, [
    { label: "Project name", value: "JBS MIKADO" },
    { label: "Project status", value: "Ongoing" },
    { label: "Land area", value: "20 Katha" },
    { label: "Apartment size", value: "A-3020 SQFT, B-2975 SQFT" },
  ])
  assert.deepEqual(result.highlights, ["Shopping Complex"])
  assert.deepEqual(result.paragraphs, [])
})

test("pairs standalone labels with the following value segment", () => {
  const result = parseProjectDescription("* Facing * South-East Corner * Mosque")

  assert.deepEqual(result.specs, [{ label: "Facing", value: "South-East Corner" }])
  assert.deepEqual(result.highlights, ["Mosque"])
})

test("keeps normal prose as paragraphs when there is no structured list", () => {
  const result = parseProjectDescription(
    "A premium residential address in Bashundhara.\n\nDesigned for families who want larger floor plans and quieter surroundings.",
  )

  assert.deepEqual(result.specs, [])
  assert.deepEqual(result.highlights, [])
  assert.deepEqual(result.paragraphs, [
    "A premium residential address in Bashundhara.",
    "Designed for families who want larger floor plans and quieter surroundings.",
  ])
})
