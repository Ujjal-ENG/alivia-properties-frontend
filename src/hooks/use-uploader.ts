"use client"

import { useCallback, useRef, useState } from "react"
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
  // URLs uploaded during this session — the only files safe to hard-delete on
  // removal. Files that were already saved on the record are left alone here and
  // reconciled server-side when the form is saved (so cancelling doesn't break
  // a still-referenced image).
  const sessionUrls = useRef<Set<string>>(new Set())

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
        const urls = results.map((r) => r.publicUrl)
        urls.forEach((url) => sessionUrls.current.add(url))
        return urls
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.status === 0
              ? err.message // network failure — already a clear, user-facing message
              : err.status === 401 || err.status === 403
                ? "Your session expired. Sign in again and retry the upload."
                : err.status === 413
                  ? "That file is too large for the server. Try a smaller image."
                  : `Upload failed: ${err.message}`
            : "Upload failed — please try again.",
        )
        return []
      } finally {
        setUploading(false)
      }
    },
    [kind, token],
  )

  /**
   * Discard a file the user removed. If it was uploaded in this session, delete
   * it from storage immediately (best-effort) so it doesn't orphan. Files that
   * predate this session are ignored here and cleaned up server-side on save.
   */
  const discard = useCallback(
    (url: string) => {
      if (!sessionUrls.current.has(url)) return
      sessionUrls.current.delete(url)
      void uploadsService.deleteFiles([url], token).catch(() => {})
    },
    [token],
  )

  return { upload, uploading, error, setError, discard }
}
