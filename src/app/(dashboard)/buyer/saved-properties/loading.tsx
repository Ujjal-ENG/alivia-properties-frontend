import { SkDashboardHeader, SkPropertyGrid } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <div>
      <SkDashboardHeader />
      <SkPropertyGrid count={6} />
    </div>
  )
}
