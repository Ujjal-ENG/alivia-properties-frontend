import { NextResponse } from "next/server"
import type { ApiResponse, PaginationMeta } from "@/types/api.types"

export function ok<T>(data: T, message = "Success", meta?: PaginationMeta) {
  return NextResponse.json<ApiResponse<T>>({ success: true, message, data, meta })
}

export function created<T>(data: T, message = "Created") {
  return NextResponse.json<ApiResponse<T>>({ success: true, message, data }, { status: 201 })
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, message, data: null }, { status: 404 })
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ success: false, message, data: null }, { status: 400 })
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, message, data: null }, { status: 401 })
}
