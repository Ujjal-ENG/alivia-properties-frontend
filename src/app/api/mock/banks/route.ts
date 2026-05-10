import { ok } from "@/app/api/_utils/api-response"
import { DUMMY_BANKS } from "@/data/dummy-banks"

export async function GET() {
  await new Promise((r) => setTimeout(r, 80))
  return ok([...DUMMY_BANKS].sort((a, b) => a.interestRate - b.interestRate), "Banks fetched")
}
