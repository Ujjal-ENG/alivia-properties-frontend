import { CompareView } from "@/pages-sections/properties/compare-view"

export default function ComparePage() {
  return (
    <div className="section-y">
      <div className="container-page">
        <div className="mb-8">
          <p className="text-eyebrow mb-2">Side-by-Side</p>
          <h1 className="text-h2">Compare Properties</h1>
        </div>
        <CompareView />
      </div>
    </div>
  )
}
