import { ok } from "@/app/api/_utils/api-response"
import { DUMMY_SELLERS, DUMMY_BUYERS } from "@/data/dummy-users"

export async function GET() {
  await new Promise((r) => setTimeout(r, 200))
  return ok(
    { sellers: DUMMY_SELLERS, buyers: DUMMY_BUYERS },
    "Users fetched",
  )
}
