import { httpClient } from "./http-client"

/** Mirrors the backend UploadKind union (uploads.service.ts). */
export type UploadKind =
  | "property-image"
  | "property-video"
  | "project-image"
  | "document"
  | "avatar"
  | "category-image"
  | "blog-image"

export type UploadResult = {
  fileKey: string
  publicUrl: string
  bucket: string
}

const MB = 1024 * 1024
const IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"]
const VIDEO = ["video/mp4", "video/webm", "video/quicktime"]
const DOC = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ...IMAGE,
]

/**
 * Client-side mirror of the backend's per-kind rules — lets the UI reject bad
 * files (and set the `accept` attribute) before any request is made. The
 * backend re-validates these on every upload, so this is a UX nicety, not the
 * security boundary.
 */
export const UPLOAD_RULES: Record<
  UploadKind,
  { mimes: string[]; maxBytes: number; accept: string }
> = {
  "property-image": { mimes: IMAGE, maxBytes: 10 * MB, accept: "image/*" },
  "property-video": { mimes: VIDEO, maxBytes: 60 * MB, accept: "video/*" },
  "project-image": { mimes: IMAGE, maxBytes: 10 * MB, accept: "image/*" },
  document: { mimes: DOC, maxBytes: 15 * MB, accept: ".pdf,.doc,.docx,image/*" },
  avatar: { mimes: IMAGE, maxBytes: 5 * MB, accept: "image/*" },
  "category-image": { mimes: IMAGE, maxBytes: 8 * MB, accept: "image/*" },
  "blog-image": { mimes: IMAGE, maxBytes: 10 * MB, accept: "image/*" },
}

/** Returns an error string if the file violates the kind's rule, else null. */
export function validateFile(file: File, kind: UploadKind): string | null {
  const rule = UPLOAD_RULES[kind]
  if (rule.mimes.length > 0 && !rule.mimes.includes(file.type)) {
    return `"${file.name}": ${file.type || "this file type"} is not allowed.`
  }
  if (file.size > rule.maxBytes) {
    return `"${file.name}" is too large (max ${(rule.maxBytes / MB).toFixed(0)} MB).`
  }
  return null
}

/**
 * The single client entry point for uploading files. Every method posts
 * multipart/form-data to the NestJS uploads API (server → MinIO, no browser
 * CORS) and returns the stored object(s). `token` is the bearer token from the
 * session (uploads require auth).
 */
export const uploadsService = {
  uploadFile(file: File, kind: UploadKind, token?: string): Promise<UploadResult> {
    const form = new FormData()
    form.append("file", file)
    form.append("kind", kind)
    // httpClient.post detects FormData and lets the browser set the multipart
    // Content-Type (with boundary) — do not set it manually.
    return httpClient.post<UploadResult>("/uploads/file", form, { token })
  },

  uploadFiles(files: File[], kind: UploadKind, token?: string): Promise<UploadResult[]> {
    const form = new FormData()
    files.forEach((f) => form.append("files", f))
    form.append("kind", kind)
    return httpClient.post<UploadResult[]>("/uploads/files", form, { token })
  },

  /**
   * Remove stored object(s) from MinIO by public URL. Used to discard files a
   * user uploaded then removed before saving, so they don't orphan in storage.
   */
  deleteFiles(urls: string[], token?: string): Promise<{ removed: number }> {
    return httpClient.delete<{ removed: number }>("/uploads", {
      token,
      body: JSON.stringify({ urls }),
    })
  },
}
