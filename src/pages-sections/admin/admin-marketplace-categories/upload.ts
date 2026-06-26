import { ApiError } from "@/services/http-client"
import { uploadsService } from "@/services/uploads.service"
import type { CategoryImage } from "@/types/marketplace.types"

function explain(err: unknown): Error {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      // Network failure — http-client already built a clear, user-facing message.
      return new Error(err.message)
    }
    if (err.status === 404) {
      return new Error(
        "Upload route missing on the running backend. Restart NestJS (`pnpm start:dev`) so the latest uploads routes are loaded.",
      )
    }
    return new Error(`Upload failed: ${err.message}`)
  }
  return new Error(
    "Cannot reach the API server. Make sure NestJS is running on port 3001 (`pnpm start:dev`).",
  )
}

/**
 * Upload a category/department icon. Browser → POST /api/v1/uploads/file →
 * NestJS → MinIO. Returns the public URL.
 */
export async function uploadImage(file: File, token: string): Promise<string> {
  try {
    const { publicUrl } = await uploadsService.uploadFile(file, "category-image", token)
    return publicUrl
  } catch (err) {
    throw explain(err)
  }
}

/**
 * Upload a subcategory image and return the full ImageRef (key + url) so it can
 * be stored on MarketplaceCategory.image (the unique wizard picture).
 */
export async function uploadImageRef(file: File, token: string): Promise<CategoryImage> {
  try {
    const { publicUrl, fileKey } = await uploadsService.uploadFile(file, "category-image", token)
    return { key: fileKey, url: publicUrl }
  } catch (err) {
    throw explain(err)
  }
}
