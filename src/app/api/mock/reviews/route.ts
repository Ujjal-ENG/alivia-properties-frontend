import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_REVIEWS } from "@/data/dummy-reviews"
import { reviewSchema } from "@/schemas/review.schema"
import type { Review, ReviewSummary, ReviewTargetType } from "@/types/review.types"

const reviewsStore: Review[] = [...DUMMY_REVIEWS]

function summarize(targetType: ReviewTargetType, targetId: string): ReviewSummary {
  const subset = reviewsStore.filter(r => r.targetType === targetType && r.targetId === targetId)
  const total = subset.length
  const average = total ? subset.reduce((s, r) => s + r.rating, 0) / total : 0
  const distribution = ([1, 2, 3, 4, 5] as const).map(stars => ({
    stars,
    count: subset.filter(r => r.rating === stars).length,
  }))
  return { average: Number(average.toFixed(2)), total, distribution }
}

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 120))
  const sp = request.nextUrl.searchParams
  const targetType = sp.get("targetType") as ReviewTargetType | null
  const targetId = sp.get("targetId")
  if (!targetType || !targetId) return badRequest("targetType and targetId required")

  const sortBy = sp.get("sortBy") ?? "recent"
  const page = Number(sp.get("page") ?? 1)
  const limit = Number(sp.get("limit") ?? 6)

  const list = reviewsStore.filter(r => r.targetType === targetType && r.targetId === targetId)
  if (sortBy === "helpful") list.sort((a, b) => b.helpfulCount - a.helpfulCount)
  else if (sortBy === "rating_high") list.sort((a, b) => b.rating - a.rating)
  else if (sortBy === "rating_low") list.sort((a, b) => a.rating - b.rating)
  else list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const { data, meta } = paginateArray(list, page, limit)
  return ok({ items: data, summary: summarize(targetType, targetId) }, "Reviews fetched", meta)
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 150))
  const body = await request.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")

  const review: Review = {
    id: `rev-${Date.now()}`,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    authorId: "current-user",
    authorName: "Current User",
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    pros: parsed.data.pros,
    cons: parsed.data.cons,
    helpfulCount: 0,
    isVerifiedPurchase: false,
    createdAt: new Date().toISOString(),
  }
  reviewsStore.unshift(review)
  return created(review, "Review submitted")
}
