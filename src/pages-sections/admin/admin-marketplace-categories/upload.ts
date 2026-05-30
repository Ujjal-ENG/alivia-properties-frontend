import { ApiError } from "@/services/http-client"
import { marketplaceService } from "@/services/marketplace.service"

/**
 * Upload an image file to MinIO via the NestJS backend.
 * Browser → POST /api/v1/uploads/file → NestJS → MinIO
 * No direct browser-to-MinIO CORS required.
 */
export async function uploadImage(file: File, token: string): Promise<string> {
  try {
    const result = await marketplaceService.uploadCategoryImage(file, token)
    return result.publicUrl
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        throw new Error(
          "Upload route missing on the running backend. Restart NestJS (`pnpm start:dev`) so the latest uploads routes are loaded.",
        )
      }
      throw new Error(`Upload failed (${err.status}): ${err.message}`)
    }
    throw new Error(
      "Cannot reach the API server. Make sure NestJS is running on port 3001 (`pnpm start:dev`).",
    )
  }
}
