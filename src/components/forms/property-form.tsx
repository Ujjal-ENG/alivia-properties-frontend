"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { propertySchema } from "@/schemas/property.schema"
import { createProperty, updateProperty } from "@/services/properties.service"
import { PROPERTY_TYPE_OPTIONS, SIZE_UNIT_OPTIONS } from "@/data/property-types"
import { BD_DIVISIONS } from "@/data/locations.bd"
import { AMENITIES } from "@/data/amenities"
import { ROUTES } from "@/config/routes.config"
import type { Property } from "@/types/property.types"

type PropertyFormValues = z.input<typeof propertySchema>
type PropertySubmitValues = z.output<typeof propertySchema>

interface PropertyFormProps {
  mode: "create" | "edit"
  initialProperty?: Property
  contactDefaults?: {
    name: string
    phone: string
    whatsApp?: string
  }
}

async function filesToDataUrls(files: FileList | null): Promise<string[]> {
  if (!files) return []

  const readers = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      }),
  )

  return Promise.all(readers)
}

function getDefaultValues(initialProperty?: Property, contactDefaults?: PropertyFormProps["contactDefaults"]): PropertyFormValues {
  return {
    title: initialProperty?.title ?? "",
    description: initialProperty?.description ?? "",
    type: initialProperty?.type ?? "apartment",
    purpose: initialProperty?.purpose ?? "sale",
    price: initialProperty?.price ?? 0,
    priceNegotiable: initialProperty?.priceNegotiable ?? false,
    division: initialProperty?.division ?? "",
    district: initialProperty?.district ?? "",
    area: initialProperty?.area ?? "",
    address: initialProperty?.address ?? "",
    mapPin: initialProperty?.mapPin ?? "",
    size: initialProperty?.size ?? 0,
    sizeUnit: initialProperty?.sizeUnit ?? "sqft",
    bedrooms: initialProperty?.bedrooms ?? 0,
    bathrooms: initialProperty?.bathrooms ?? 0,
    balconies: initialProperty?.balconies ?? 0,
    floorNumber: initialProperty?.floorNumber ?? 0,
    totalFloors: initialProperty?.totalFloors ?? 1,
    facilities: initialProperty?.facilities ?? [],
    images: initialProperty?.images ?? [],
    videoUrl: initialProperty?.videoUrl ?? "",
    contactName: initialProperty?.sellerName ?? contactDefaults?.name ?? "",
    contactPhone: initialProperty?.sellerPhone ?? contactDefaults?.phone ?? "",
    whatsApp: initialProperty?.sellerWhatsApp ?? contactDefaults?.whatsApp ?? "",
  }
}

export function PropertyForm({ mode, initialProperty, contactDefaults }: PropertyFormProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<PropertyFormValues, undefined, PropertySubmitValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: getDefaultValues(initialProperty, contactDefaults),
  })

  const selectedDivision = useWatch({ control: form.control, name: "division" }) ?? ""
  const imageValues = useWatch({ control: form.control, name: "images" }) ?? []
  const selectedFacilities = useWatch({ control: form.control, name: "facilities" }) ?? []

  const districts = useMemo(
    () => BD_DIVISIONS.find((division) => division.name === selectedDivision)?.districts.map((district) => district.name) ?? [],
    [selectedDivision],
  )

  async function handleImageChange(files: FileList | null) {
    const nextUrls = await filesToDataUrls(files)
    form.setValue("images", nextUrls, { shouldValidate: true, shouldDirty: true })
  }

  function removeImage(index: number) {
    form.setValue(
      "images",
      imageValues.filter((_, currentIndex) => currentIndex !== index),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  async function onSubmit(values: PropertySubmitValues) {
    setSubmitError(null)

    try {
      if (mode === "edit" && initialProperty) {
        await updateProperty(initialProperty.id, values)
      } else {
        await createProperty(values)
      }

      router.push(ROUTES.SELLER_PROPERTIES)
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save property")
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-700">
          {mode === "edit" ? "Edit listing" : "New listing"}
        </p>
        <h1 className="mt-2 text-h3">
          {mode === "edit" ? "Update property details" : "Create property listing"}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          All fields stay API-ready. Mock backend stores listing in shared in-memory property store.
        </p>
      </div>

      {submitError && (
        <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Elegant 3-bedroom apartment in Bashundhara R/A…" {...field} />
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
                      <Textarea rows={6} placeholder="Describe layout, condition, nearby landmarks, access, and standout amenities…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <div className="flex gap-2">
                    {(["sale", "rent"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          field.value === value
                            ? "border-brand-700 bg-brand-700 text-white"
                            : "border-border hover:border-brand-300"
                        }`}
                      >
                        {value === "sale" ? "For Sale" : "For Rent"}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (BDT)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="13500000"
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceNegotiable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Negotiable</FormLabel>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-sm text-ink-700">Price can be negotiated</span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="surface-card grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        form.setValue("district", "")
                      }}
                      className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                    >
                      <option value="">Select Division</option>
                      {BD_DIVISIONS.map((division) => (
                        <option key={division.name} value={division.name}>{division.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input placeholder="Bashundhara R/A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Block E, Road 11, Bashundhara R/A, Dhaka 1229" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="mapPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Pin / Maps URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Google Maps link or coordinates" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="surface-card grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="1450"
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizeUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size Unit</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
                      {SIZE_UNIT_OPTIONS.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(["bedrooms", "bathrooms", "balconies", "floorNumber", "totalFloors"] as const).map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldName === "floorNumber" ? "Floor Number" : fieldName === "totalFloors" ? "Total Floors" : fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        {...field}
                        value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold text-ink-900">Facilities & Media</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {AMENITIES.map((category) => (
                <div key={category.category} className="rounded-[1.25rem] border border-border bg-ink-50 p-4">
                  <p className="text-sm font-semibold text-ink-900">{category.category}</p>
                  <div className="mt-3 space-y-2">
                    {category.items.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm text-ink-700">
                        <input
                          type="checkbox"
                          checked={selectedFacilities.includes(amenity)}
                          onChange={(event) => {
                            const current = form.getValues("facilities") ?? []
                            form.setValue(
                              "facilities",
                              event.target.checked
                                ? [...current, amenity]
                                : current.filter((item) => item !== amenity),
                              { shouldDirty: true, shouldValidate: true },
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

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="images" className="text-sm font-medium leading-none">Images</label>
                <label htmlFor="images" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-brand-200 bg-brand-50/40 p-4 text-center">
                  <ImagePlus className="h-5 w-5 text-brand-600" />
                  <p className="mt-2 text-sm font-medium text-ink-800">Upload property images</p>
                  <p className="mt-1 text-xs text-ink-500">Files convert to dummy data URLs for mock backend.</p>
                </label>
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => void handleImageChange(event.target.files)}
                  className="hidden"
                />
                {form.formState.errors.images?.message && (
                  <p className="text-sm text-red-600">{form.formState.errors.images.message}</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/watch?v=…" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {imageValues.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {imageValues.map((image, index) => (
                  <div key={image} className="relative overflow-hidden rounded-[1rem] border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Property preview ${index + 1}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Tanvir Ahmed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" inputMode="tel" placeholder="01711234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsApp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input type="tel" inputMode="tel" placeholder="01711234567" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="rounded-full bg-brand-700 px-6 text-white hover:bg-brand-800" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                mode === "edit" ? "Update Property" : "Create Property"
              )}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.SELLER_PROPERTIES)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
