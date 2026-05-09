import { ConsultationForm } from "@/pages-sections/consultation/consultation-form"
import { Phone, MessageCircle, Clock } from "lucide-react"
import { siteConfig } from "@/config/site.config"

export default function ConsultationPage() {
  return (
    <div className="section-y">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-eyebrow mb-3">Book a Session</p>
              <h1 className="text-h2 mb-3">Free Real Estate Consultation</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get personalized guidance from our experienced real estate advisors. Whether you are buying, investing, or looking for a site visit — we are here to help.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Clock,          label: "Duration",    value: "30 minutes (free)" },
                { icon: Phone,          label: "Phone",       value: siteConfig.contact.phone },
                { icon: MessageCircle,  label: "WhatsApp",    value: "Message us directly" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink-50 rounded-2xl p-5 space-y-2">
              <p className="text-sm font-bold">Office Hours</p>
              <p className="text-sm text-muted-foreground">{siteConfig.contact.officeHours}</p>
              <p className="text-sm text-muted-foreground">{siteConfig.contact.address}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-bold text-lg mb-6">Schedule Your Consultation</h2>
              <ConsultationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
