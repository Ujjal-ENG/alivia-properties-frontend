"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  Layers,
  Package,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { GetQuoteForm } from "@/components/marketplace/GetQuoteForm"
import {
  marketplaceService,
  type MarketplaceCategory,
  type TreeCategory,
  type TreeDepartment,
  type TreeSubcategory,
} from "@/services/marketplace.service"
import type { Supplier } from "@/types/marketplace.types"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS: Record<Step, string> = {
  1: "Department",
  2: "Category",
  3: "Subcategory",
  4: "Suppliers",
  5: "Request",
}

type Props = {
  tree: TreeDepartment[]
  initial?: { dept?: string; cat?: string; sub?: string }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function QuoteWizard({ tree, initial }: Props) {
  // ── Resolve a deep-linked starting point from the tree ───────────────────────
  const start = React.useMemo(() => {
    const dept = tree.find((d) => d.slug === initial?.dept)
    const cat = dept?.categories.find((c) => c.slug === initial?.cat)
    const sub =
      cat?.subcategories.find((s) => s.slug === initial?.sub) ??
      dept?.categories.flatMap((c) => c.subcategories).find((s) => s.slug === initial?.sub)
    const catOfSub = sub
      ? dept?.categories.find((c) => c.subcategories.some((s) => s.slug === sub.slug))
      : cat
    if (sub) return { step: 4 as Step, dept, cat: catOfSub ?? cat, sub }
    if (cat) return { step: 3 as Step, dept, cat, sub: undefined }
    if (dept) return { step: 2 as Step, dept, cat: undefined, sub: undefined }
    return { step: 1 as Step, dept: undefined, cat: undefined, sub: undefined }
  }, [tree, initial?.dept, initial?.cat, initial?.sub])

  const [step, setStep] = React.useState<Step>(start.step)
  const [prev, setPrev] = React.useState<Step[]>(
    start.step === 1 ? [] : ([1, 2, 3, 4] as Step[]).filter((s) => s < start.step),
  )
  const [dept, setDept] = React.useState<TreeDepartment | undefined>(start.dept)
  const [cat, setCat] = React.useState<TreeCategory | undefined>(start.cat)
  const [sub, setSub] = React.useState<TreeSubcategory | undefined>(start.sub)
  const [selectedSupplierIds, setSelectedSupplierIds] = React.useState<string[]>([])

  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [suppliersState, setSuppliersState] = React.useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  )

  // ── Navigation (auto-skips single-child levels, back respects skips) ─────────
  const advanceTo = React.useCallback(
    (target: Step) => {
      setPrev((p) => [...p, step])
      setStep(target)
    },
    [step],
  )

  function selectDepartment(d: TreeDepartment) {
    setDept(d)
    setCat(undefined)
    setSub(undefined)
    if (d.categories.length === 1) {
      const onlyCat = d.categories[0]
      setCat(onlyCat)
      if (onlyCat.subcategories.length === 1) {
        setSub(onlyCat.subcategories[0])
        advanceTo(4)
      } else advanceTo(3)
    } else advanceTo(2)
  }

  function selectCategory(c: TreeCategory) {
    setCat(c)
    setSub(undefined)
    if (c.subcategories.length === 1) {
      setSub(c.subcategories[0])
      advanceTo(4)
    } else advanceTo(3)
  }

  function selectSubcategory(s: TreeSubcategory) {
    setSub(s)
    advanceTo(4)
  }

  function back() {
    setPrev((p) => {
      const next = [...p]
      const last = next.pop()
      if (last != null) setStep(last)
      return next
    })
  }

  function jumpTo(target: Step) {
    if (target >= step) return
    setPrev((p) => p.filter((s) => s < target))
    setStep(target)
  }

  // ── Load suppliers when a subcategory is chosen ──────────────────────────────
  const subSlug = sub?.slug
  React.useEffect(() => {
    if (!subSlug) return
    const slug = subSlug
    let cancelled = false
    async function load() {
      setSuppliersState("loading")
      setSelectedSupplierIds([])
      try {
        const res = await marketplaceService.listSuppliers({ category: slug, limit: 48 })
        if (cancelled) return
        setSuppliers(res.data)
        setSuppliersState("ready")
      } catch {
        if (cancelled) return
        setSuppliers([])
        setSuppliersState("error")
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [subSlug])

  function toggleSupplier(id: string) {
    setSelectedSupplierIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )
  }

  const selectedSupplierNames = suppliers
    .filter((s) => selectedSupplierIds.includes(s.id))
    .map((s) => s.name)

  return (
    <div>
      <WizardProgress step={step} onJump={jumpTo} />

      {/* Breadcrumb of choices */}
      {(dept || cat || sub) && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink-600">
          {dept && <Crumb label={dept.name} onClick={() => jumpTo(1)} />}
          {cat && (
            <>
              <ChevronRight className="size-3 text-ink-400" />
              <Crumb label={cat.name} onClick={() => jumpTo(2)} />
            </>
          )}
          {sub && (
            <>
              <ChevronRight className="size-3 text-ink-400" />
              <Crumb label={sub.name} onClick={() => jumpTo(3)} />
            </>
          )}
        </div>
      )}

      {/* ── Step 1: Department ─────────────────────────────────────────────── */}
      {step === 1 && (
        <StepShell
          eyebrow="Step 1 of 5"
          title="What are you looking for?"
          lead="Pick a department to get started."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((d) => (
              <TileButton
                key={d.slug}
                title={d.name}
                description={d.description}
                meta={`${d.categories.length} categories`}
                iconUrl={d.iconUrl}
                fallbackIcon={<Layers className="size-5" />}
                onClick={() => selectDepartment(d)}
              />
            ))}
          </div>
        </StepShell>
      )}

      {/* ── Step 2: Category ───────────────────────────────────────────────── */}
      {step === 2 && dept && (
        <StepShell
          eyebrow="Step 2 of 5"
          title={`Choose a category in ${dept.name}`}
          lead="Narrow down to the product group you need."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dept.categories.map((c) => (
              <TileButton
                key={c.slug}
                title={c.name}
                description={c.description}
                meta={`${c.subcategories.length} options`}
                iconUrl={c.iconUrl}
                fallbackIcon={<Package className="size-5" />}
                onClick={() => selectCategory(c)}
              />
            ))}
          </div>
        </StepShell>
      )}

      {/* ── Step 3: Subcategory (image-led) ────────────────────────────────── */}
      {step === 3 && cat && (
        <StepShell
          eyebrow="Step 3 of 5"
          title={`Select a ${cat.name.toLowerCase()} type`}
          lead="Tap the option that matches what you need."
        >
          {cat.subcategories.length === 0 ? (
            <EmptyNote text="No options configured yet — go back and pick another category, or request a quote and we'll match you." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.subcategories.map((s) => (
                <SubcategoryCard key={s.slug} node={s} onClick={() => selectSubcategory(s)} />
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* ── Step 4: Suppliers (multi-select) ───────────────────────────────── */}
      {step === 4 && sub && (
        <StepShell
          eyebrow="Step 4 of 5"
          title={`Choose suppliers for ${sub.name}`}
          lead="Select one or more — or skip and let Alivia match you."
        >
          <SupplierStep
            state={suppliersState}
            suppliers={suppliers}
            selectedIds={selectedSupplierIds}
            onToggle={toggleSupplier}
            onSelectAll={() => setSelectedSupplierIds(suppliers.map((s) => s.id))}
            onClear={() => setSelectedSupplierIds([])}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <p className="text-sm text-ink-600">
              {selectedSupplierIds.length > 0
                ? `${selectedSupplierIds.length} supplier${selectedSupplierIds.length === 1 ? "" : "s"} selected`
                : "No suppliers selected — we'll route your request to verified matches."}
            </p>
            <Button onClick={() => advanceTo(5)} className="gap-1.5">
              {selectedSupplierIds.length > 0 ? "Continue" : "Skip — match me"}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </StepShell>
      )}

      {/* ── Step 5: Request form ───────────────────────────────────────────── */}
      {step === 5 && sub && (
        <StepShell
          eyebrow="Step 5 of 5"
          title="Tell us what you need"
          lead="Fill in the details and submit — verified suppliers usually reply within 24 hours."
        >
          <div className="mb-5 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
            <span className="font-medium">Requesting:</span> {sub.name}
            {selectedSupplierNames.length > 0 ? (
              <>
                {" "}
                <span className="text-brand-700">·</span> {selectedSupplierNames.join(", ")}
              </>
            ) : (
              <>
                {" "}
                <span className="text-brand-700">·</span> Alivia will match suppliers
              </>
            )}
          </div>

          <GetQuoteForm
            mode="batch"
            supplierIds={selectedSupplierIds}
            redirectOnSuccess
            context={{
              categorySlug: sub.slug,
              categoryName: sub.name,
              supplierName: selectedSupplierNames.join(", ") || undefined,
            }}
          />
        </StepShell>
      )}

      {/* Back control */}
      {prev.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Pieces ────────────────────────────────────────────────────────────────────

function WizardProgress({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  const steps: Step[] = [1, 2, 3, 4, 5]
  return (
    <ol className="mb-6 flex items-center gap-1.5 sm:gap-2">
      {steps.map((s, i) => {
        const done = s < step
        const active = s === step
        return (
          <li key={s} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(s)}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                active && "bg-brand-700 text-white ring-2 ring-brand-200",
                done && "bg-brand-600 text-white hover:bg-brand-700",
                !active && !done && "bg-ink-100 text-ink-500",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="size-3.5" /> : s}
            </button>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                active ? "text-ink-900" : "text-ink-500",
              )}
            >
              {STEP_LABELS[s]}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn("h-px flex-1", s < step ? "bg-brand-300" : "bg-ink-200")}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function StepShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-heading text-xl font-semibold text-ink-900 sm:text-2xl">{title}</h2>
      {lead && <p className="mt-1 text-sm text-ink-600">{lead}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Crumb({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-ink-50 px-2.5 py-1 font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-700"
    >
      {label}
    </button>
  )
}

function TileButton({
  title,
  description,
  meta,
  iconUrl,
  fallbackIcon,
  onClick,
}: {
  title: string
  description?: string | null
  meta?: string
  iconUrl?: string | null
  fallbackIcon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-border/70 bg-white p-4 text-left shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-(--shadow-elevated)"
    >
      <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-700">
        {iconUrl ? (
          <Image src={iconUrl} alt="" width={44} height={44} unoptimized className="size-full object-cover" />
        ) : (
          fallbackIcon
        )}
      </span>
      <span className="mt-3 font-semibold text-ink-900 group-hover:text-brand-700">{title}</span>
      {description && <span className="mt-1 line-clamp-2 text-xs text-ink-600">{description}</span>}
      {meta && <span className="mt-auto pt-2 text-[11px] font-medium text-ink-500">{meta}</span>}
    </button>
  )
}

function SubcategoryCard({ node, onClick }: { node: MarketplaceCategory; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-white text-left shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-(--shadow-elevated)"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {node.image?.url ? (
          <Image
            src={node.image.url}
            alt={node.image.alt ?? node.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand-700">
            <Package className="size-8 opacity-50" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-2.5">
          <span className="line-clamp-2 text-sm font-semibold text-white">{node.name}</span>
        </div>
      </div>
    </button>
  )
}

function SupplierStep({
  state,
  suppliers,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
}: {
  state: "idle" | "loading" | "ready" | "error"
  suppliers: Supplier[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClear: () => void
}) {
  const [videoOf, setVideoOf] = React.useState<Supplier | null>(null)

  if (state === "loading" || state === "idle") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl border border-border/60 bg-ink-50/60 skeleton" />
        ))}
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <EmptyNote text="No verified suppliers listed here yet — continue and our marketplace team will return vetted matches within 24 hours." />
    )
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={onSelectAll}
          className="font-medium text-brand-700 hover:underline"
        >
          Select all ({suppliers.length})
        </button>
        {selectedIds.length > 0 && (
          <button type="button" onClick={onClear} className="text-ink-500 hover:text-ink-800">
            Clear
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {suppliers.map((s) => (
          <SupplierSelectCard
            key={s.id}
            s={s}
            checked={selectedIds.includes(s.id)}
            onToggle={() => onToggle(s.id)}
            onPlay={() => setVideoOf(s)}
          />
        ))}
      </div>

      {/* Product video lightbox */}
      <Dialog
        open={!!videoOf}
        onOpenChange={(open) => {
          if (!open) setVideoOf(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>{videoOf?.name} — product video</DialogTitle>
          {videoOf?.videoUrl ? (
            <video
              key={videoOf.id}
              src={videoOf.videoUrl}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-lg bg-black"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function hashId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function formatCompact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

function SupplierSelectCard({
  s,
  checked,
  onToggle,
  onPlay,
}: {
  s: Supplier
  checked: boolean
  onToggle: () => void
  onPlay: () => void
}) {
  const images = React.useMemo(
    () => [s.coverImage, ...(s.gallery ?? [])].filter(Boolean) as string[],
    [s.coverImage, s.gallery],
  )
  const [imgIdx, setImgIdx] = React.useState(0)
  const active = images[imgIdx] ?? images[0]
  const inStock = s.inStock !== false

  // Simulated "live viewers": deterministic initial value (SSR-safe) that gently
  // fluctuates client-side for a real-time feel. No backend tracking required.
  const [live, setLive] = React.useState(() => 6 + (hashId(s.id) % 26))
  React.useEffect(() => {
    const t = setInterval(() => {
      setLive((v) => Math.min(60, Math.max(3, v + (Math.floor(Math.random() * 5) - 2))))
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white shadow-(--shadow-card) transition-all hover:shadow-(--shadow-elevated)",
        checked ? "border-brand-500 ring-2 ring-brand-300" : "border-border/70 hover:border-brand-200",
      )}
    >
      {/* Full-card selection target (keyboard + click). Inner controls float above it. */}
      <button
        type="button"
        aria-pressed={checked}
        aria-label={`${checked ? "Deselect" : "Select"} ${s.name}`}
        onClick={onToggle}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      />

      <div className="pointer-events-none relative z-10">
        {/* Media */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-100">
          {active ? (
            <Image
              src={active}
              alt={s.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-100 to-brand-200">
              <span className="font-heading text-3xl font-bold text-brand-600/40">{initials(s.name)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />

          {/* Stock badge */}
          <span
            className={cn(
              "absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
            )}
          >
            <span className={cn("size-1.5 rounded-full", inStock ? "bg-green-500" : "bg-red-500")} />
            {inStock ? "In stock" : "Out of stock"}
          </span>

          {/* Select indicator (visual) */}
          <span
            className={cn(
              "absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full border-2 transition-colors",
              checked ? "border-white bg-brand-600 text-white" : "border-white/80 bg-black/20 text-transparent",
            )}
          >
            <Check className="size-4" />
          </span>

          {/* Live viewers */}
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-green-400" />
            </span>
            <Eye className="size-3" />
            {live} watching
          </span>

          {/* Video play */}
          {s.videoUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
              aria-label={`Play ${s.name} video`}
              className="pointer-events-auto absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-md transition-transform hover:scale-105"
            >
              <Play className="size-5 translate-x-px fill-current" />
            </button>
          ) : null}
        </div>

        {/* Gallery thumbnails */}
        {images.length > 1 && (
          <div className="pointer-events-auto flex gap-1.5 px-3 pt-3">
            {images.slice(0, 4).map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImgIdx(i)
                }}
                aria-label={`View photo ${i + 1} of ${s.name}`}
                className={cn(
                  "relative h-11 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  i === imgIdx ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill unoptimized sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-3 p-3.5">
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-ink-50 text-sm font-semibold text-brand-700">
            {s.logo ? (
              <Image src={s.logo} alt={`${s.name} logo`} fill unoptimized sizes="44px" className="object-contain p-1" />
            ) : (
              initials(s.name)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-ink-900">{s.name}</span>
              {s.isVerified && <ShieldCheck className="size-3.5 shrink-0 text-brand-600" />}
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-600">{s.location}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
              <span className="inline-flex items-center gap-0.5">
                <Star className="size-3 fill-gold-400 text-gold-400" />
                {s.rating.toFixed(1)} ({s.reviewCount})
              </span>
              {typeof s.itemsSold === "number" && s.itemsSold > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <ShoppingBag className="size-3" />
                  {formatCompact(s.itemsSold)} sold
                </span>
              )}
              {s.deliveryDays ? <span>· {s.deliveryDays}d delivery</span> : null}
            </div>
            {/* Price — red bold per spec */}
            {s.priceRange && <p className="mt-1.5 text-sm font-bold text-red-600">{s.priceRange}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-ink-50/50 p-5 text-sm text-ink-600">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-600" />
      <p>{text}</p>
    </div>
  )
}
