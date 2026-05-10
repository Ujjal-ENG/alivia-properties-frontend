import { PreApprovalForm } from "@/components/forms/pre-approval-form"
import { ShieldCheck, Clock, BadgeDollarSign } from "lucide-react"

export const metadata = {
  title: "Mortgage Pre-Approval — Alivia Properties",
  description: "Estimate your eligibility against partner banks in seconds.",
}

export default function PreApprovalPage() {
  return (
    <div className="section-y">
      <div className="container-page grid gap-10 lg:grid-cols-5">
        <aside className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-eyebrow mb-2">Financing</p>
            <h1 className="text-h2 mb-2">Mortgage pre-approval</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indicative result in 5 seconds based on income & DTI. No credit pull, no commitment. We pick the best partner-bank rate for your profile.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { icon: Clock, label: "Instant indicative offer" },
              { icon: BadgeDollarSign, label: "Compare 7 partner banks" },
              { icon: ShieldCheck, label: "No credit-bureau hit" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-ink-800">{label}</span>
              </li>
            ))}
          </ul>
        </aside>
        <div className="lg:col-span-3">
          <PreApprovalForm />
        </div>
      </div>
    </div>
  )
}
