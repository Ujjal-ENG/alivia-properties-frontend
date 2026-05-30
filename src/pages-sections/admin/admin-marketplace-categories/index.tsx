"use client"

import { useState } from "react"
import { CheckCircle2, FolderPlus, Layers, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { CategoryFormDialog } from "./CategoryFormDialog"
import { CategoryRow } from "./CategoryRow"
import { DeleteDialog } from "./DeleteDialog"
import { detectMode, type DialogMode } from "./types"

export function AdminMarketplaceCategoriesPanel({
  initialCategories,
}: {
  initialCategories: MarketplaceCategory[]
}) {
  const [categories, setCategories] = useState(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("item")
  const [editing, setEditing] = useState<MarketplaceCategory | null>(null)
  const [deletingCat, setDeletingCat] = useState<MarketplaceCategory | null>(null)
  const [flashSlug, setFlashSlug] = useState<string | null>(null)
  const [filterText, setFilterText] = useState("")

  const parents = categories
    .filter((c) => c.parentSlug == null)
    .sort((a, b) => a.order - b.order)

  const filtered = filterText.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(filterText.toLowerCase()) ||
          c.slug.toLowerCase().includes(filterText.toLowerCase()),
      )
    : categories

  const grouped = parents
    .map((p) => ({
      parent: p,
      children: filtered
        .filter((c) => c.parentSlug === p.slug)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((g) =>
      filterText
        ? filtered.some((c) => c.slug === g.parent.slug || c.parentSlug === g.parent.slug)
        : true,
    )

  const orphans = filtered.filter(
    (c) => c.parentSlug != null && !parents.some((p) => p.slug === c.parentSlug),
  )

  function openCreate(mode: DialogMode) {
    setEditing(null)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function openEdit(cat: MarketplaceCategory) {
    setEditing(cat)
    setDialogMode(detectMode(cat))
    setDialogOpen(true)
  }

  function handleSaved(cat: MarketplaceCategory) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.slug === cat.slug)
      return exists ? prev.map((c) => (c.slug === cat.slug ? cat : c)) : [...prev, cat]
    })
    setFlashSlug(cat.slug)
    window.setTimeout(() => setFlashSlug(null), 2000)
  }

  function handleDeleted(slug: string) {
    setCategories((prev) => prev.filter((c) => c.slug !== slug && c.parentSlug !== slug))
  }

  const totalGroups = parents.length
  const totalItems = categories.filter((c) => c.parentSlug != null).length

  return (
    <div className="space-y-6">
      {/* Stats + controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-border/60 bg-white px-4 py-2">
            <p className="text-xs text-ink-500">Groups</p>
            <p className="text-xl font-bold text-ink-900">{totalGroups}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-white px-4 py-2">
            <p className="text-xs text-ink-500">Sub-categories</p>
            <p className="text-xl font-bold text-ink-900">{totalItems}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-white px-4 py-2">
            <p className="text-xs text-ink-500">With images</p>
            <p className="text-xl font-bold text-brand-700">
              {categories.filter((c) => c.iconUrl).length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter categories…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="h-9 w-44 rounded-full text-sm"
          />
          <Button
            variant="outline"
            onClick={() => openCreate("group")}
            className="rounded-full gap-1.5 border-brand-300 text-brand-700 hover:bg-brand-50"
          >
            <FolderPlus className="size-4" />
            New Group
          </Button>
          <Button onClick={() => openCreate("item")} className="rounded-full gap-1.5">
            <Plus className="size-4" />
            New Sub-category
          </Button>
        </div>
      </div>

      {/* Explainer */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs text-brand-800">
        <strong>Groups</strong> are top-level sections (e.g. "Raw Materials").
        Each group contains <strong>sub-categories</strong> that appear as image cards on the marketplace.
        Create groups first, then add sub-categories inside them.
      </div>

      {/* Category tree */}
      {grouped.length === 0 && orphans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-ink-500">
          <Layers className="mx-auto mb-2 size-8 text-ink-300" />
          <p className="text-sm font-medium">No categories yet.</p>
          <p className="mt-1 text-xs">
            Click <strong>New Group</strong> to start, then add sub-categories inside it.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ parent, children }) => (
            <div key={parent.slug} className="space-y-1.5">
              <div className={cn(flashSlug === parent.slug && "ring-2 ring-brand-400 ring-offset-2 rounded-xl")}>
                <CategoryRow cat={parent} depth={0} onEdit={openEdit} onDelete={setDeletingCat} />
              </div>
              {children.length > 0 && (
                <div className="space-y-1">
                  {children.map((child) => (
                    <div key={child.slug} className={cn(flashSlug === child.slug && "ring-2 ring-brand-400 ring-offset-2 rounded-xl")}>
                      <CategoryRow cat={child} depth={1} onEdit={openEdit} onDelete={setDeletingCat} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {orphans.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Uncategorised</p>
              {orphans.map((cat) => (
                <div key={cat.slug} className={cn(flashSlug === cat.slug && "ring-2 ring-brand-400 ring-offset-2 rounded-xl")}>
                  <CategoryRow cat={cat} depth={1} onEdit={openEdit} onDelete={setDeletingCat} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {flashSlug && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-lg">
          <CheckCircle2 className="size-4" />
          Saved successfully
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        editing={editing}
        parents={parents}
        onSaved={handleSaved}
      />

      <DeleteDialog
        cat={deletingCat}
        onClose={() => setDeletingCat(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
