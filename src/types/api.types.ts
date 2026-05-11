export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiError = {
  success: false
  message: string
  errors?: Record<string, string[]>
}
