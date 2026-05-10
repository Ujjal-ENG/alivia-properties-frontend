import Link from "next/link"
import { ShieldOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <ShieldOff className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        You do not have permission to view this page. Please sign in with the correct account.
      </p>
      <div className="flex gap-3">
        <Link href={ROUTES.HOME}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Home
          </Button>
        </Link>
        <Link href={ROUTES.LOGIN}>
          <Button className="bg-brand-600 hover:bg-brand-700 text-white">Sign In</Button>
        </Link>
      </div>
    </div>
  )
}
