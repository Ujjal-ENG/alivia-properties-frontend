import { SkDashboardHeader, SkTable } from "@/components/common/skeletons"
export default function Loading() {
  return (
    <div>
      <SkDashboardHeader />
      <SkTable rows={8} cols={5} />
    </div>
  )
}
