import { SkDashboardHeader, SkProfilePage } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <div>
      <SkDashboardHeader />
      <SkProfilePage leftRows={2} />
    </div>
  )
}
