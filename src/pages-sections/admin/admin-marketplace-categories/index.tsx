"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FolderPlus, Layers, Package, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/services/marketplace.service"
import { CategoryCard } from "./CategoryCard"
import { CategoryFormDialog } from "./CategoryFormDialog"
import { CategoryRow } from "./CategoryRow"
import { DeleteDialog } from "./DeleteDialog"
import { detectMode, type DialogMode } from "./types"

export function AdminMarketplaceCategoriesPanel({
  initialCategories,
}: {
  initialCategories: MarketplaceCategory[]
}) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("department")
  const [defaultParent, setDefaultParent] = useState("")
  const [editing, setEditing] = useState<MarketplaceCategory | null>(null)
  const [deletingCat, setDeletingCat] = useState<MarketplaceCategory | null>(null)
  const [flashSlug, setFlashSlug] = useState<string | null>(null)
  const [filterText, setFilterText] = useState("")

  const lvl = (c: MarketplaceCategory) => c.level ?? (c.parentSlug ? "SUBCATEGORY" : "DEPARTMENT")
  const sortOrder = (a: MarketplaceCategory, b: MarketplaceCategory) => a.order - b.order

  const departments = categories.filter((c) => lvl(c) === "DEPARTMENT").sort(sortOrder)
  const categoriesUnder = (deptSlug: string) =>
    categories.filter((c) => lvl(c) === "CATEGORY" && c.parentSlug === deptSlug).sort(sortOrder)
  const subsUnder = (catSlug: string) =>
    categories.filter((c) => lvl(c) === "SUBCATEGORY" && c.parentSlug === catSlug).sort(sortOrder)

  const q = filterText.trim().toLowerCase()
  const matches = (c: MarketplaceCategory) =>
    !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)

  function openCreate(mode: DialogMode, parent = "") {
    setEditing(null)
    setDialogMode(mode)
    setDefaultParent(parent)
    setDialogOpen(true)
  }

  function openEdit(cat: MarketplaceCategory) {
    setEditing(cat)
    setDialogMode(detectMode(cat))
    setDefaultParent(cat.parentSlug ?? "")
    setDialogOpen(true)
  }

  function openAddChild(parent: MarketplaceCategory) {
    const childMode: DialogMode = lvl(parent) === "DEPARTMENT" ? "category" : "subcategory"
    openCreate(childMode, parent.slug)
  }

  function handleSaved(cat: MarketplaceCategory) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.slug === cat.slug)
      return exists ? prev.map((c) => (c.slug === cat.slug ? cat : c)) : [...prev, cat]
    })
    setFlashSlug(cat.slug)
    window.setTimeout(() => setFlashSlug(null), 2000)
    // Purge Next's client Router Cache so the public marketplace pages
    // (force-dynamic) re-fetch fresh data on the next navigation in this session.
    router.refresh()
  }

  function handleDeleted(slug: string) {
    setCategories((prev) => {
      const catChildren = prev.filter((c) => c.parentSlug === slug).map((c) => c.slug)
      const doomed = new Set([slug, ...catChildren])
      // also drop grandchildren (subcategories of removed categories)
      prev.forEach((c) => {
        if (c.parentSlug && catChildren.includes(c.parentSlug)) doomed.add(c.slug)
      })
      return prev.filter((c) => !doomed.has(c.slug))
    })
    router.refresh()
  }

  const flash = (slug: string) =>
    flashSlug === slug && "ring-2 ring-brand-400 ring-offset-2 rounded-xl"

  const totalDepartments = departments.length
  const totalCategories = categories.filter((c) => lvl(c) === "CATEGORY").length
  const subcats = categories.filter((c) => lvl(c) === "SUBCATEGORY")
  const withImages = subcats.filter((c) => c.image?.url || c.iconUrl).length

  return (
    <div className="space-y-6">
      {/* Stats + controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Stat label="Departments" value={totalDepartments} />
          <Stat label="Categories" value={totalCategories} />
          <Stat label="Subcategories" value={subcats.length} />
          <Stat label="Subcat. images" value={withImages} accent="brand" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="h-9 w-40 rounded-full text-sm"
          />
          <Button
            variant="outline"
            onClick={() => openCreate("department")}
            className="rounded-full gap-1.5 border-brand-300 text-brand-700 hover:bg-brand-50"
          >
            <FolderPlus className="size-4" /> Department
          </Button>
          <Button
            variant="outline"
            onClick={() => openCreate("category")}
            className="rounded-full gap-1.5"
          >
            <Package className="size-4" /> Category
          </Button>
          <Button onClick={() => openCreate("subcategory")} className="rounded-full gap-1.5">
            <Plus className="size-4" /> Subcategory
          </Button>
        </div>
      </div>

      {/* Explainer */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs text-brand-800">
        Build the tree top-down: <strong>Departments</strong> → <strong>Categories</strong> →{" "}
        <strong>Subcategories</strong>. Subcategories carry the image tile and quote configuration
        buyers see in the wizard. Use the <Plus className="inline size-3" /> on a row to add a child.
      </div>

      {/* Tree */}
      {departments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-ink-500">
          <Layers className="mx-auto mb-2 size-8 text-ink-300" />
          <p className="text-sm font-medium">No departments yet.</p>
          <p className="mt-1 text-xs">
            Click <strong>Department</strong> to start, then add categories and subcategories.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {departments
            .filter(
              (d) =>
                matches(d) ||
                categoriesUnder(d.slug).some(
                  (c) => matches(c) || subsUnder(c.slug).some(matches),
                ),
            )
            .map((dept) => {
              const cats = categoriesUnder(dept.slug).filter(
                (c) => matches(c) || subsUnder(c.slug).some(matches),
              )
              return (
                <div key={dept.slug} className="space-y-3">
                  <div className={cn(flash(dept.slug))}>
                    <CategoryRow
                      cat={dept}
                      depth={0}
                      onEdit={openEdit}
                      onDelete={setDeletingCat}
                      onAddChild={openAddChild}
                    />
                  </div>

                  {cats.length === 0 ? (
                    <div className="ml-6 rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-xs text-ink-500">
                      No categories under this department.{" "}
                      <button
                        type="button"
                        onClick={() => openAddChild(dept)}
                        className="font-medium text-brand-700 underline-offset-2 hover:underline"
                      >
                        Add the first one
                      </button>
                      .
                    </div>
                  ) : (
                    <div className="ml-0 grid grid-cols-1 gap-4 md:ml-6 md:grid-cols-2">
                      {cats.map((category) => (
                        <CategoryCard
                          key={category.slug}
                          category={category}
                          subcategories={subsUnder(category.slug).filter(matches)}
                          onEdit={openEdit}
                          onDelete={setDeletingCat}
                          onAddChild={openAddChild}
                          flashSlug={flashSlug}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {flashSlug && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-lg">
          <CheckCircle2 className="size-4" /> Saved successfully
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        editing={editing}
        categories={categories}
        defaultParent={defaultParent}
        onSaved={handleSaved}
      />

      <DeleteDialog cat={deletingCat} onClose={() => setDeletingCat(null)} onDeleted={handleDeleted} />
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "brand" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white px-4 py-2">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={cn("text-xl font-bold", accent === "brand" ? "text-brand-700" : "text-ink-900")}>
        {value}
      </p>
    </div>
  )
}
