"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { FileText, Loader2, Lock, UploadCloud, X } from "lucide-react"

import { uploadsService, validateFile } from "@/services/uploads.service"
import { ApiError } from "@/services/http-client"
import type { QuoteAttachment } from "@/types/quote.types"
import { cn } from "@/lib/utils"

type Props = {
  value: QuoteAttachment[]
  onChange: (next: QuoteAttachment[]) => void
  maxFiles?: number
  className?: string
}

function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Optional file attachments (drawings, photos, BOQ) for a quote request.
 * Uploads go through the authenticated NestJS uploads API (`document` bucket),
 * so attachments are only offered to signed-in buyers — anonymous submitters
 * are prompted to log in (they can still describe everything in the notes).
 */
export function AttachmentUploader({ value, onChange, maxFiles = 8, className }: Props) {
  const { data: session } = useSession()
  const token = session?.accessToken
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const atCapacity = value.length >= maxFiles

  async function ingest(list: FileList | File[] | null) {
    if (!list || busy || !token) return
    const incoming = Array.from(list)
    if (incoming.length === 0) return
    setError(null)

    const room = maxFiles - value.length
    const files = incoming.slice(0, room)
    if (incoming.length > room) setError(`You can attach up to ${maxFiles} files.`)

    setBusy(true)
    try {
      const uploaded: QuoteAttachment[] = []
      for (const file of files) {
        const bad = validateFile(file, "document")
        if (bad) {
          setError(bad)
          continue
        }
        const res = await uploadsService.uploadFile(file, "document", token)
        uploaded.push({
          key: res.fileKey,
          url: res.publicUrl,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        })
      }
      if (uploaded.length) onChange([...value, ...uploaded].slice(0, maxFiles))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  if (!token) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-dashed border-border bg-ink-50/60 px-3 py-2.5 text-xs text-ink-600",
          className,
        )}
      >
        <Lock className="size-3.5 shrink-0" />
        <span>Log in to attach drawings or photos — or describe them in the notes below.</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!atCapacity && (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            void ingest(e.dataTransfer.files)
          }}
          className={cn(
            "flex min-h-20 w-full flex-col items-center justify-center rounded-xl border border-dashed p-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            dragOver ? "border-brand-500 bg-brand-50" : "border-brand-200 bg-brand-50/40 hover:bg-brand-50",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-brand-600" />
          ) : (
            <UploadCloud className="size-5 text-brand-600" />
          )}
          <p className="mt-1.5 text-xs font-medium text-ink-800">
            {busy ? "Uploading…" : "Click or drag files (PDF, DOC, images)"}
          </p>
          <p className="text-[11px] text-ink-500">Up to {maxFiles} files · 15 MB each</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        multiple
        className="hidden"
        onChange={(e) => void ingest(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((file, index) => (
            <li
              key={file.key}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <FileText className="size-4 shrink-0 text-brand-600" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-700">{file.name}</span>
              <span className="shrink-0 text-[11px] text-ink-500">{prettySize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
