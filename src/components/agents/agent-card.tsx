import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/star-rating";
import { ROUTES } from "@/config/routes.config";
import type { Agent } from "@/types/agent.types";

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

export function AgentCard({ agent, compact }: AgentCardProps) {
  return (
    <Link
      href={ROUTES.AGENT_DETAIL(agent.slug)}
      className="surface-card group flex overflow-hidden transition-shadow hover:shadow-(--shadow-elevated) cursor-pointer"
    >
      {!compact && agent.coverImage && (
        <div className="relative hidden h-28 w-32 flex-none overflow-hidden sm:block">
          <Image
            src={agent.coverImage}
            alt=""
            fill
            sizes="128px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 items-start gap-3 p-3">
        <Avatar className="h-12 w-12">
          {agent.avatar && <AvatarImage src={agent.avatar} />}
          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink-900">
              {agent.name}
            </span>
            {agent.isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 flex-none text-brand-700" />
            )}
            {agent.isFeatured && (
              <span className="rounded bg-gold-50 px-1.5 py-0.5 text-[10px] font-medium text-gold-700">
                Featured
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-500">
            {agent.companyName ?? agent.licenseNumber} · {agent.yearsExperience}
            y exp
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating
              value={agent.rating}
              count={agent.reviewCount}
              size="xs"
              showValue
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-700">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />{" "}
              {agent.serviceAreas.slice(0, 2).join(", ")}
              {agent.serviceAreas.length > 2 &&
                ` +${agent.serviceAreas.length - 2}`}
            </span>
            <span>
              {agent.activeListings} live · {agent.closedDeals} closed
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-[10px] text-ink-700">
              <Phone className="h-3 w-3" /> ~{agent.responseTimeHours}h reply
            </span>
            {agent.whatsApp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
