import { MovingChecklist } from "@/components/properties/moving-checklist"

export const metadata = {
  title: "Moving Checklist — Alivia Properties",
  description: "Track every task from offer to move-in. Saved in your browser.",
}

export default function MovingChecklistPage() {
  return (
    <div className="section-y">
      <div className="container-page max-w-3xl">
        <div className="mb-6">
          <p className="text-eyebrow mb-2">Plan ahead</p>
          <h1 className="text-h2 mb-2">Moving checklist</h1>
          <p className="text-sm text-muted-foreground">
            16 tasks across 8 weeks. Tap to check off — progress saves automatically in your browser.
          </p>
        </div>
        <MovingChecklist />
      </div>
    </div>
  )
}
