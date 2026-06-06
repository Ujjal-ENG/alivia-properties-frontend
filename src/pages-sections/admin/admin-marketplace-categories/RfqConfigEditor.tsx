"use client"

import { GripVertical, ListChecks, Plus, SlidersHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CategoryAttributeType } from "@/types/marketplace.types"
import { emptyAttr, emptyVariant, type AttrRow, type VariantRow } from "./types"

type Props = {
  variants: VariantRow[]
  attributes: AttrRow[]
  onVariantsChange: (rows: VariantRow[]) => void
  onAttributesChange: (rows: AttrRow[]) => void
  disabled?: boolean
}

const ATTR_TYPES: { value: CategoryAttributeType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Dropdown" },
]

export function RfqConfigEditor({
  variants,
  attributes,
  onVariantsChange,
  onAttributesChange,
  disabled,
}: Props) {
  function setVariant(index: number, patch: Partial<VariantRow>) {
    onVariantsChange(variants.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function setAttr(index: number, patch: Partial<AttrRow>) {
    onAttributesChange(attributes.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <div className="space-y-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <ListChecks className="size-4 text-brand-700" />
          Quote variants
        </p>
        <p className="mt-0.5 text-xs text-ink-500">
          Named options buyers pick when requesting a quote (e.g. Sand → &quot;Sylhet red sand FM 2.5&quot;).
        </p>

        <div className="mt-3 space-y-2">
          {variants.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-white/60 px-3 py-3 text-center text-xs text-ink-500">
              No variants yet. Add the choices buyers can pick from.
            </p>
          ) : (
            variants.map((row, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2",
                  !row.isActive && "opacity-60",
                )}
              >
                <GripVertical className="size-4 shrink-0 text-ink-300" />
                <Input
                  aria-label="Variant name"
                  placeholder="Variant name"
                  value={row.name}
                  disabled={disabled}
                  onChange={(e) => setVariant(index, { name: e.target.value })}
                  className="h-8 flex-1 text-sm"
                />
                <Input
                  aria-label="Variant unit"
                  placeholder="unit"
                  value={row.unit}
                  disabled={disabled}
                  onChange={(e) => setVariant(index, { unit: e.target.value })}
                  className="h-8 w-20 text-sm"
                />
                <label className="flex items-center gap-1 text-[11px] text-ink-500">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    disabled={disabled}
                    onChange={(e) => setVariant(index, { isActive: e.target.checked })}
                  />
                  Active
                </label>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  disabled={disabled}
                  aria-label="Remove variant"
                  onClick={() => onVariantsChange(variants.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onVariantsChange([...variants, emptyVariant()])}
            className="rounded-full text-xs"
          >
            <Plus className="size-3.5" /> Add variant
          </Button>
        </div>
      </div>

      <div className="border-t border-brand-100 pt-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <SlidersHorizontal className="size-4 text-brand-700" />
          Spec fields
        </p>
        <p className="mt-0.5 text-xs text-ink-500">
          Extra inputs buyers fill in (e.g. Fineness Modulus, Grade, Size). Use Dropdown for fixed choices.
        </p>

        <div className="mt-3 space-y-2">
          {attributes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-white/60 px-3 py-3 text-center text-xs text-ink-500">
              No spec fields. Buyers will just pick a variant and add quantity.
            </p>
          ) : (
            attributes.map((row, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-border bg-white p-2.5">
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Field label"
                    placeholder="Field label (e.g. Grade)"
                    value={row.label}
                    disabled={disabled}
                    onChange={(e) => setAttr(index, { label: e.target.value })}
                    className="h-8 flex-1 text-sm"
                  />
                  <select
                    aria-label="Field type"
                    value={row.type}
                    disabled={disabled}
                    onChange={(e) => setAttr(index, { type: e.target.value as CategoryAttributeType })}
                    className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                  >
                    {ATTR_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    disabled={disabled}
                    aria-label="Remove field"
                    onClick={() => onAttributesChange(attributes.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.type === "SELECT" && (
                    <Input
                      aria-label="Options (comma separated)"
                      placeholder="Options, comma separated"
                      value={row.options}
                      disabled={disabled}
                      onChange={(e) => setAttr(index, { options: e.target.value })}
                      className="h-8 flex-1 text-sm"
                    />
                  )}
                  <Input
                    aria-label="Unit"
                    placeholder="unit (optional)"
                    value={row.unit}
                    disabled={disabled}
                    onChange={(e) => setAttr(index, { unit: e.target.value })}
                    className="h-8 w-28 text-sm"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-ink-500">
                    <input
                      type="checkbox"
                      checked={row.required}
                      disabled={disabled}
                      onChange={(e) => setAttr(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              </div>
            ))
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onAttributesChange([...attributes, emptyAttr()])}
            className="rounded-full text-xs"
          >
            <Plus className="size-3.5" /> Add spec field
          </Button>
        </div>
      </div>
    </div>
  )
}
