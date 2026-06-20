import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { LiveChatWidget } from "@/components/chat/live-chat-widget"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div id="main-content" className="flex-1">{children}</div>
      <SiteFooter />
      <LiveChatWidget />
    </>
  )
}
