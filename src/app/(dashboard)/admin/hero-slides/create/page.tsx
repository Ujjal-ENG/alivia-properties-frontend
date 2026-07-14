export const dynamic = "force-dynamic"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { HeroSlideForm } from "@/components/forms/hero-slide-form"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

export default function AdminCreateHeroSlidePage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Content"
        title="Add slide"
        description="Create a new slide for the marketplace hero carousel."
        actions={(
          <Link href={ROUTES.ADMIN_HERO_SLIDES}>
            <Button variant="outline" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
              Back to Hero Carousel
            </Button>
          </Link>
        )}
      />
      <HeroSlideForm mode="create" />
    </div>
  )
}
