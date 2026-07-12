export const dynamic = "force-dynamic"

import { getProperties } from "@/services/properties.service"
import { PropertyCard } from "@/components/properties/property-card"
import { MapPin } from "lucide-react"

export default async function MapSearchPage() {
  const res = await getProperties({ limit: 8 })

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="w-full lg:w-96 shrink-0 bg-white border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-bold text-base mb-2">Map Search</h1>
          <input
            type="text"
            placeholder="Search area, apartment, address…"
            className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs text-muted-foreground">{res.meta?.total ?? res.data.length} properties near you</p>
          {res.data.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="flex-1 bg-muted flex items-center justify-center min-h-64">
        <div className="text-center text-muted-foreground space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-white/50 flex items-center justify-center">
              <MapPin className="h-8 w-8 opacity-40" />
            </div>
          </div>
          <p className="text-sm font-medium">Interactive Map</p>
          <p className="text-xs max-w-xs">
            {/* TODO: Replace with Google Maps / Mapbox integration */}
            Google Maps / Mapbox integration will be added here.
          </p>
        </div>
      </div>
    </div>
  )
}
