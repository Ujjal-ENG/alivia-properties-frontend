"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Loader2, Star, UploadCloud, X } from "lucide-react"

import { useUploader } from "@/hooks/use-uploader"
import { UPLOAD_RULES, type UploadKind } from "@/services/uploads.service"
import { cn } from "@/lib/utils"

type PropertyImagesUploaderProps = {
  /** Ordered image URLs. Index 0 is the cover. */
  value: string[]
  onChange: (urls: string[]) => void
  minImages?: number
  maxImages?: number
  disabled?: boolean
  /** Which storage bucket/rules to use (default property photos). */
  kind?: Extract<UploadKind, "property-image" | "project-image">
  /** Label above the grid. */
  label?: string
}

export function PropertyImagesUploader({
  value,
  onChange,
  minImages = 5,
  maxImages = 12,
  disabled,
  kind = "property-image",
  label = "Photos",
}: PropertyImagesUploaderProps) {
  const { upload, uploading, error, setError, discard } = useUploader(kind)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const rule = UPLOAD_RULES[kind]
  const atCapacity = value.length >= maxImages
  const remainingToMin = Math.max(0, minImages - value.length)

  async function ingest(list: FileList | File[] | null) {
    if (!list || disabled || uploading) return
    const incoming = Array.from(list)
    if (incoming.length === 0) return

    setError(null)
    const room = maxImages - value.length
    let files = incoming
    if (files.length > room) {
      setError(`You can add up to ${maxImages} photos.`)
      files = files.slice(0, room)
    }
    if (files.length === 0) return

    const urls = await upload(files)
    if (urls.length === 0) return
    onChange([...value, ...urls].slice(0, maxImages))
    if (inputRef.current) inputRef.current.value = ""
  }

  function removeAt(index: number) {
    if (disabled) return
    discard(value[index])
    onChange(value.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    if (disabled) return
    const next = index + dir
    if (next < 0 || next >= value.length) return
    const copy = [...value]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    onChange(copy)
  }

  function makeCover(index: number) {
    if (disabled || index === 0) return
    const copy = [...value]
    const [picked] = copy.splice(index, 1)
    copy.unshift(picked)
    onChange(copy)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium leading-none text-ink-800">{label}</p>
        <p
          aria-live="polite"
          className={cn(
            "text-xs font-medium tabular-nums",
            remainingToMin > 0 ? "text-amber-600" : "text-emerald-600",
          )}
        >
          {value.length}/{maxImages} added
          {remainingToMin > 0
            ? ` · ${remainingToMin} more to reach the ${minImages} minimum`
            : " · minimum met"}
        </p>
      </div>

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
            "flex min-h-32 w-full touch-manipulation flex-col items-center justify-center rounded-[1.25rem] border border-dashed p-4 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60",
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
            {uploading ? "Uploading…" : "Click or drag photos to upload"}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {minImages > 0 ? `${minImages}–${maxImages} recommended · ` : ""}max{" "}
            {(rule.maxBytes / 1024 / 1024).toFixed(0)} MB each
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        multiple
        className="hidden"
        onChange={(e) => void ingest(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {value.map((url, index) => (
            <li
              key={url}
              className={cn(
                "group relative aspect-4/3 overflow-hidden rounded-[1rem] border",
                index === 0 ? "border-brand-500 ring-1 ring-brand-500/30" : "border-border",
              )}
            >
              <Image src={url} alt={`Photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 200px" unoptimized className="object-cover" />

              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-brand-700 px-2 py-0.5 text-[0.65rem] font-semibold text-white shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  Cover
                </span>
              )}

              {!disabled && (
                <>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 outline-none transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move photo ${index + 1} earlier`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === value.length - 1}
                        aria-label={`Move photo ${index + 1} later`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        className="rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold text-brand-700 shadow-sm outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        Set cover
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
