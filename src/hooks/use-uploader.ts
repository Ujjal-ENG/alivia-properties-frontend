"use client"

import { useCallback, useState } from "react"
import { useSession } from "next-auth/react"
import { ApiError } from "@/services/http-client"
import {
  uploadsService,
  validateFile,
  type UploadKind,
} from "@/services/uploads.service"

/**
 * Headless upload controller used by <FileUploader> and any custom UI.
 * Validates client-side, uploads through the single uploads service using the
 * session token, and tracks `uploading`/`error` state. Returns the public URLs.
 */
export function useUploader(kind: UploadKind) {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (input: FileList | File[]): Promise<string[]> => {
      const files = Array.from(input)
      if (files.length === 0) return []

      for (const file of files) {
        const problem = validateFile(file, kind)
        if (problem) {
          setError(problem)
          return []
        }
      }

      if (!token) {
        setError("You must be signed in to upload files.")
        return []
      }

      setError(null)
      setUploading(true)
      try {
        const results =
          files.length === 1
            ? [await uploadsService.uploadFile(files[0], kind, token)]
            : await uploadsService.uploadFiles(files, kind, token)
        return results.map((r) => r.publicUrl)
      } catch (err) {
        setError(
          err instanceof ApiError
            ? `Upload failed (${err.status}): ${err.message}`
            : "Upload failed — is the API server running?",
        )
        return []
      } finally {
        setUploading(false)
      }
    },
    [kind, token],
  )

  return { upload, uploading, error, setError }
}
