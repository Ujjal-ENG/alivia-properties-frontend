import Link from "next/link"
import { siteConfig } from "@/config/site.config"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 p-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex min-h-11 items-center gap-2 rounded-full px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600">
          <span className="text-sm font-bold text-white">AP</span>
        </div>
        <span className="text-lg font-bold text-brand-700">
          {siteConfig.shortName}
          <span className="ml-0.5 text-gold-600">Properties</span>
        </span>
      </Link>

      {/* Card */}
      <div className="mobile-liquid-glass w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
        {children}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  )
}
