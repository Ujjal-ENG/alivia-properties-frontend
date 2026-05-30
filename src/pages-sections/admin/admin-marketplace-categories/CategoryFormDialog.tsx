"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { AlertCircle, ImagePlus, Layers, Loader2, Plus, X } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ApiError } from "@/services/http-client"
import { marketplaceService, type MarketplaceCategory } from "@/services/marketplace.service"
import { type DialogMode, type FormState, emptyForm, toFormState } from "./types"
import { uploadImage } from "./upload"

const MAX_FILE_MB = 5

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: DialogMode
  editing: MarketplaceCategory | null
  parents: MarketplaceCategory[]
  onSaved: (cat: MarketplaceCategory) => void
}

export function CategoryFormDialog({ open, onOpenChange, mode, editing, parents, onSaved }: Props) {
  const { data: session } = useSession()
  const [form, setForm] = useState<FormState>(editing ? toFormState(editing) : emptyForm(mode))
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset form when dialog target changes
  const prevKey = useRef("")
  const nextKey = `${mode}:${editing?.slug ?? "new"}`
  if (nextKey !== prevKey.current) {
    prevKey.current = nextKey
    const next = editing ? toFormState(editing) : emptyForm(mode)
    if (JSON.stringify(next) !== JSON.stringify(form)) setForm(next)
  }

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!session?.accessToken) { setError("You must be logged in to upload images."); return }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_FILE_MB} MB.`)
      return
    }
    setUploadingImage(true)
    setError(null)
    try {
      const url = await uploadImage(file, session.accessToken)
      set("iconUrl", url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploadingImage(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required"); return }
    if (!form.slug.trim()) { setError("Slug is required"); return }
    if (mode === "item" && !form.parentSlug.trim()) { setError("Select a parent group"); return }
    if (!session?.accessToken) { setError("Not authenticated"); return }

    setSaving(true)
    setError(null)
    try {
      const saved = editing
        ? await marketplaceService.adminUpdateCategory(
            editing.slug,
            {
              name: form.name.trim(),
              description: form.description.trim() || null,
              iconUrl: form.iconUrl.trim() || null,
              parentSlug: mode === "group" ? null : form.parentSlug.trim() || null,
              order: parseInt(form.order, 10) || 0,
            },
            session.accessToken,
          )
        : await marketplaceService.adminCreateCategory(
            {
              slug: form.slug.trim(),
              name: form.name.trim(),
              description: form.description.trim() || undefined,
              iconUrl: form.iconUrl.trim() || undefined,
              parentSlug: mode === "group" ? undefined : form.parentSlug.trim() || undefined,
              order: parseInt(form.order, 10) || 0,
            },
            session.accessToken,
          )
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const isGroup = mode === "group"
  const title = editing
    ? `Edit ${isGroup ? "group" : "sub-category"}`
    : isGroup ? "New category group" : "New sub-category"

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving && !uploadingImage) onOpenChange(v) }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              isGroup ? "bg-brand-100 text-brand-700" : "bg-gold-50 text-gold-700 border border-gold-200",
            )}>
              {isGroup ? <Layers className="size-3" /> : <Plus className="size-3" />}
              {isGroup ? "Top-level group" : "Sub-category"}
            </span>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isGroup
              ? `A group is a top-level section (e.g. "Raw Materials"). Sub-categories are added inside groups.`
              : "A sub-category lives inside a group and has its own image card on the marketplace."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-ink-50">
              {form.iconUrl ? (
                <Image src={form.iconUrl} alt="Category" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-ink-400">
                  <ImagePlus className="size-7" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="size-5 animate-spin text-brand-600" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-medium text-ink-800">
                {isGroup ? "Group image (optional)" : "Category image"}
              </p>
              <p className="text-xs text-ink-500">
                {isGroup ? "Recommended: 1200×400px." : "Recommended: 400×300px."}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button" size="sm" variant="outline"
                  disabled={uploadingImage || saving}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full text-xs"
                >
                  {uploadingImage ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3" />}
                  {uploadingImage ? "Uploading…" : "Upload to MinIO"}
                </Button>
                {form.iconUrl && (
                  <Button
                    type="button" size="sm" variant="ghost" disabled={saving}
                    onClick={() => set("iconUrl", "")}
                    className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-3" /> Remove
                  </Button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </div>
          </div>

          {/* Name */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink-800">Name *</label>
            <Input
              value={form.name}
              onChange={(e) => { set("name", e.target.value); if (!editing) set("slug", autoSlug(e.target.value)) }}
              placeholder={isGroup ? "e.g. Raw Materials" : "e.g. Cement"}
              disabled={saving}
            />
          </div>

          {/* Slug */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink-800">Slug *</label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder={isGroup ? "e.g. raw-materials" : "e.g. cement"}
              disabled={saving || Boolean(editing)}
              className={editing ? "bg-ink-50 text-ink-500" : ""}
            />
            <p className="text-xs text-ink-400">
              {editing ? "Slug cannot be changed after creation." : "Auto-filled from name. Lowercase + hyphens only."}
            </p>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink-800">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={isGroup ? "Short description of this group" : "Short description shown on the category card"}
              rows={2} disabled={saving} className="resize-none text-sm"
            />
          </div>

          {/* Parent group (items only) */}
          {!isGroup && (
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-ink-800">Parent group *</label>
              <select
                value={form.parentSlug}
                onChange={(e) => set("parentSlug", e.target.value)}
                disabled={saving}
                className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-600/20 disabled:opacity-60"
              >
                <option value="">— Select a group —</option>
                {parents.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
              {parents.length === 0 && (
                <p className="text-xs text-amber-600">No groups yet. Create a group first.</p>
              )}
            </div>
          )}

          {/* Display order */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink-800">Display order</label>
            <Input
              type="number" min={0} value={form.order}
              onChange={(e) => set("order", e.target.value)}
              disabled={saving} className="w-28"
            />
            <p className="text-xs text-ink-500">Lower number appears first within its group.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={saving || uploadingImage} onClick={handleSave}>
            {saving
              ? <><Loader2 className="size-4 animate-spin" /> Saving…</>
              : editing ? "Save changes" : isGroup ? "Create group" : "Create sub-category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
