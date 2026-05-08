import { SkDashboardHeader, SkTable } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <div>
      <SkDashboardHeader />
      <SkTable rows={6} cols={4} />
    </div>
  )
}
