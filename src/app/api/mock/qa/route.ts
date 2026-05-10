import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_QA } from "@/data/dummy-qa"
import { qaQuestionSchema, qaAnswerSchema } from "@/schemas/qa.schema"
import type { QAItem } from "@/types/qa.types"

const qaStore: QAItem[] = [...DUMMY_QA]

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 100))
  const sp = request.nextUrl.searchParams
  const propertyId = sp.get("propertyId")
  if (!propertyId) return badRequest("propertyId required")
  const answered = sp.get("answered")
  const page = Number(sp.get("page") ?? 1)
  const limit = Number(sp.get("limit") ?? 10)

  let list = qaStore.filter(q => q.propertyId === propertyId)
  if (answered === "true") list = list.filter(q => !!q.answer)
  else if (answered === "false") list = list.filter(q => !q.answer)
  list.sort((a, b) => b.upvotes - a.upvotes)

  const { data, meta } = paginateArray(list, page, limit)
  return ok(data, "Q&A fetched", meta)
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 150))
  const body = await request.json()

  if (body?.action === "answer") {
    const parsed = qaAnswerSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")
    const item = qaStore.find(q => q.id === parsed.data.questionId)
    if (!item) return badRequest("Question not found")
    item.answer = parsed.data.answer
    item.answeredById = "current-user"
    item.answeredByName = "Listing Agent"
    item.answeredAt = new Date().toISOString()
    return ok(item, "Answer posted")
  }

  const parsed = qaQuestionSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")
  const item: QAItem = {
    id: `qa-${Date.now()}`,
    propertyId: parsed.data.propertyId,
    question: parsed.data.question,
    questionerId: "current-user",
    questionerName: "Current User",
    upvotes: 0,
    createdAt: new Date().toISOString(),
  }
  qaStore.unshift(item)
  return created(item, "Question posted")
}
