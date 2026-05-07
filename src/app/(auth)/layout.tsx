import Link from "next/link"
import { siteConfig } from "@/config/site.config"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-md bg-brand-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AP</span>
        </div>
        <span className="font-bold text-lg text-brand-700">
          {siteConfig.shortName}
          <span className="text-gold-600 ml-0.5">Properties</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-card p-8">
        {children}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  )
}
