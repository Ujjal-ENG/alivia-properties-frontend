"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/common/file-uploader"
import { PropertyImagesUploader } from "@/components/forms/property-images-uploader"
import { projectSchema, type ProjectInput, type ProjectSubmit } from "@/schemas/project.schema"
import { createProject, updateProject } from "@/services/projects.service"
import { AMENITIES } from "@/data/amenities"
import { ROUTES } from "@/config/routes.config"
import type { Project } from "@/types/project.types"

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
] as const

const LAND_UNIT_OPTIONS = ["katha", "bigha", "shotangsho", "sqft"]

// Coerced-number fields type their value as `unknown` on the input side; render
// only string/number values (never an object) into the <input>.
const numInputValue = (v: unknown): string | number =>
  typeof v === "number" || typeof v === "string" ? v : ""

const NUMERIC_FIELDS = [
  { name: "totalFloors", label: "Total Floors" },
  { name: "totalUnits", label: "Total Units" },
  { name: "availableUnits", label: "Available Units" },
] as const

interface ProjectFormProps {
  mode: "create" | "edit"
  initialProject?: Project
}

function getDefaults(initial?: Project): ProjectInput {
  return {
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "upcoming",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    galleryImages: initial?.galleryImages ?? [],
    videos: initial?.videos ?? [],
    videoUrl: initial?.videoUrl ?? "",
    handoverDate: initial?.handoverDate ? initial.handoverDate.slice(0, 10) : "",
    landSize: initial?.landSize,
    landSizeUnit: initial?.landSizeUnit ?? "katha",
    totalFloors: initial?.totalFloors,
    totalUnits: initial?.totalUnits,
    availableUnits: initial?.availableUnits,
    priceFrom: initial?.priceFrom,
    priceTo: initial?.priceTo,
    amenities: initial?.amenities ?? [],
    units: (initial?.units ?? []).map((u) => ({
      name: u.name ?? u.type ?? "",
      bedrooms: u.bedrooms ?? 0,
      bathrooms: u.bathrooms ?? 0,
      size: u.size ?? 0,
      sizeUnit: u.sizeUnit ?? "sqft",
      price: u.price ?? u.priceFrom ?? 0,
      available: u.available ?? u.total ?? 0,
    })),
    developerName: initial?.developerName ?? "",
    isFeatured: initial?.isFeatured ?? false,
  }
}

export function ProjectForm({ mode, initialProject }: ProjectFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProjectInput, undefined, ProjectSubmit>({
    resolver: zodResolver(projectSchema),
    defaultValues: getDefaults(initialProject),
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "units" })
  const coverValue = useWatch({ control: form.control, name: "coverImageUrl" })
  const galleryValue = useWatch({ control: form.control, name: "galleryImages" }) ?? []
  const videoValues = useWatch({ control: form.control, name: "videos" }) ?? []
  const selectedAmenities = useWatch({ control: form.control, name: "amenities" }) ?? []

  async function onSubmit(values: ProjectSubmit) {
    setSubmitError(null)
    if (!session?.accessToken) {
      setSubmitError("Please sign in again to save this project.")
      return
    }
    try {
      if (mode === "edit" && initialProject) {
        await updateProject(initialProject.id, values, session.accessToken)
      } else {
        await createProject(values, session.accessToken)
      }
      router.push(ROUTES.ADMIN_PROJECTS)
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save project")
    }
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basics */}
          <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alivia Skyline Residences" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Lakefront living in the heart of Bashundhara" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Describe the project vision, location advantages, and what makes it stand out…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="developerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Developer</FormLabel>
                  <FormControl>
                    <Input placeholder="Alivia Properties Ltd." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location */}
          <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Bashundhara R/A, Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Block J, Bashundhara R/A, Dhaka 1229" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Timeline, size & pricing */}
          <div className="surface-card grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="handoverDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handover Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="landSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Size</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="decimal" placeholder="25" {...field} value={numInputValue(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="landSizeUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Unit</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                      {LAND_UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {NUMERIC_FIELDS.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="numeric" placeholder="0" {...field} value={numInputValue(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="priceFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price From (BDT)</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="12000000" {...field} value={numInputValue(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price To (BDT)</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="45000000" {...field} value={numInputValue(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Media */}
          <div className="surface-card space-y-6 p-5">
            <h2 className="text-lg font-semibold text-ink-900">Media</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-800">Cover image</p>
              <FileUploader
                kind="project-image"
                label=""
                value={coverValue ? [coverValue] : []}
                onChange={(urls) =>
                  form.setValue("coverImageUrl", urls[0] ?? "", { shouldDirty: true })
                }
                hint="Shown on cards and the project hero · max 10 MB"
              />
            </div>
            <div className="space-y-2">
              <PropertyImagesUploader
                kind="project-image"
                label="Gallery"
                value={galleryValue}
                onChange={(urls) =>
                  form.setValue("galleryImages", urls, { shouldValidate: true, shouldDirty: true })
                }
                minImages={3}
                maxImages={16}
              />
              {form.formState.errors.galleryImages?.message && (
                <p className="text-sm text-red-600">{form.formState.errors.galleryImages.message}</p>
              )}
            </div>

            {/* Video — upload a walkthrough clip and/or paste an external link */}
            <div className="grid gap-5 border-t border-border pt-6 md:grid-cols-2">
              <div className="space-y-2">
                <FileUploader
                  kind="project-video"
                  multiple
                  maxFiles={3}
                  label="Project videos (optional)"
                  hint="Up to 3 clips · max 125 MB each (mp4, webm, mov)"
                  value={videoValues}
                  onChange={(urls) =>
                    form.setValue("videos", urls, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {form.formState.errors.videos?.message && (
                  <p className="text-sm text-red-600">{form.formState.errors.videos.message}</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External video link (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/watch?v=…"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold text-ink-900">Amenities</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {AMENITIES.map((category) => (
                <div key={category.category} className="rounded-[1.25rem] border border-border bg-ink-50 p-4">
                  <p className="text-sm font-semibold text-ink-900">{category.category}</p>
                  <div className="mt-3 space-y-2">
                    {category.items.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm text-ink-700">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            const current = form.getValues("amenities") ?? []
                            form.setValue(
                              "amenities",
                              e.target.checked
                                ? [...current, amenity]
                                : current.filter((a) => a !== amenity),
                              { shouldDirty: true },
                            )
                          }}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit types */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">Unit types</h2>
                <p className="text-sm text-ink-500">Optional — list the available layouts and pricing.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  append({ name: "", bedrooms: 0, bathrooms: 0, size: 0, sizeUnit: "sqft", price: 0, available: 0 })
                }
              >
                <Plus className="h-4 w-4" /> Add unit
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="mt-4 rounded-[1rem] border border-dashed border-border bg-ink-50/60 px-4 py-6 text-center text-sm text-ink-500">
                No unit types added yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {fields.map((unit, index) => (
                  <div key={unit.id} className="grid items-end gap-3 rounded-[1.25rem] border border-border p-4 sm:grid-cols-2 lg:grid-cols-7">
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-ink-700">Name</label>
                      <Input placeholder="3 Bed Premium" {...form.register(`units.${index}.name`)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">Beds</label>
                      <Input type="number" inputMode="numeric" {...form.register(`units.${index}.bedrooms`)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">Baths</label>
                      <Input type="number" inputMode="numeric" {...form.register(`units.${index}.bathrooms`)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">Size (sqft)</label>
                      <Input type="number" inputMode="numeric" {...form.register(`units.${index}.size`)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-700">Price (BDT)</label>
                      <Input type="number" inputMode="numeric" {...form.register(`units.${index}.price`)} />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-ink-700">Available</label>
                        <Input type="number" inputMode="numeric" {...form.register(`units.${index}.available`)} />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Remove unit ${index + 1}`}
                        className="size-9 shrink-0 rounded-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured + submit */}
          <div className="surface-card p-5">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-sm text-ink-700">Feature this project on the homepage and listings</span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="rounded-full bg-brand-700 px-6 text-white hover:bg-brand-800" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                mode === "edit" ? "Update Project" : "Create Project"
              )}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.ADMIN_PROJECTS)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
