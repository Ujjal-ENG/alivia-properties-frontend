"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { FileText, Loader2, UploadCloud, X } from "lucide-react"

import { useUploader } from "@/hooks/use-uploader"
import { UPLOAD_RULES, type UploadKind } from "@/services/uploads.service"
import { cn } from "@/lib/utils"

type FileUploaderProps = {
  /** Determines the storage bucket + the accepted file types/size on both ends. */
  kind: UploadKind
  /** Current stored file URLs (controlled). For single mode pass `[]` or `[url]`. */
  value: string[]
  /** Called with the next list of URLs after an upload or a removal. */
  onChange: (urls: string[]) => void
  multiple?: boolean
  /** Cap for `multiple` mode (default 12). */
  maxFiles?: number
  /** Overrides the kind's default `accept` string. */
  accept?: string
  label?: string
  hint?: string
  className?: string
  disabled?: boolean
}

const IMAGE_KINDS: ReadonlySet<UploadKind> = new Set([
  "property-image",
  "category-image",
  "avatar",
  "blog-image",
])

const VIDEO_KINDS: ReadonlySet<UploadKind> = new Set(["property-video", "project-video"])

function fileName(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() ?? url)
  } catch {
    return url
  }
}

export function FileUploader({
  kind,
  value,
  onChange,
  multiple = false,
  maxFiles,
  accept,
  label,
  hint,
  className,
  disabled,
}: FileUploaderProps) {
  const { upload, uploading, error, setError, discard } = useUploader(kind)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const rule = UPLOAD_RULES[kind]
  const limit = multiple ? maxFiles ?? 12 : 1
  const isImageKind = IMAGE_KINDS.has(kind)
  const isVideoKind = VIDEO_KINDS.has(kind)
  const atCapacity = value.length >= limit

  async function ingest(list: FileList | File[] | null) {
    if (!list || disabled || uploading) return
    const incoming = Array.from(list)
    if (incoming.length === 0) return

    setError(null)
    const room = limit - value.length
    let files = multiple ? incoming : incoming.slice(0, 1)
    if (multiple && files.length > room) {
      setError(`You can upload up to ${limit} file${limit === 1 ? "" : "s"}.`)
      files = files.slice(0, room)
    }
    if (files.length === 0) return

    const urls = await upload(files)
    if (urls.length === 0) return

    onChange(multiple ? [...value, ...urls].slice(0, limit) : [urls[0]])
    if (inputRef.current) inputRef.current.value = ""
  }

  function removeAt(index: number) {
    if (disabled) return
    discard(value[index])
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <p className="text-sm font-medium leading-none text-ink-800">{label}</p>}

      {!atCapacity && (
        <button
          type="button"
          disabled={disabled || uploading}
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
            "flex min-h-32 w-full flex-col items-center justify-center rounded-[1.25rem] border border-dashed p-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            dragOver
              ? "border-brand-500 bg-brand-50"
              : "border-brand-200 bg-brand-50/40 hover:bg-brand-50",
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <UploadCloud className="h-5 w-5 text-brand-600" />
          )}
          <p className="mt-2 text-sm font-medium text-ink-800">
            {uploading
              ? "Uploading…"
              : `Click or drag ${multiple ? "files" : "a file"} to upload`}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {hint ?? `Max ${(rule.maxBytes / 1024 / 1024).toFixed(0)} MB each`}
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept ?? rule.accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => void ingest(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {value.length > 0 &&
        (isImageKind ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-[1rem] border border-border"
              >
                <Image src={url} alt={`Upload ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 200px" unoptimized className="object-cover" />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove file ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : isVideoKind ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {value.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-video overflow-hidden rounded-[1rem] border border-border bg-black"
              >
                <video
                  src={url}
                  controls
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove video ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white opacity-80 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {value.map((url, index) => (
              <li
                key={url}
                className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2"
              >
                <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-sm text-ink-700 hover:text-brand-700"
                >
                  {fileName(url)}
                </a>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove ${fileName(url)}`}
                    className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
