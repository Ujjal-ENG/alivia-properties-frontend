export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-brand-aurora absolute inset-x-0 top-0 h-64 opacity-70" />
      <div className="relative min-h-screen">{children}</div>
    </div>
  )
}
