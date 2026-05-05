"use client"

import * as React from "react"

import { LeadActivityType } from "@/src/generated/client"
import { LeadActivity } from "@/src/types/crm"
import {
  ArrowsLeftRight,
  ChatCircleText,
  Clock,
  Gear,
  NotePencil,
  RocketLaunch,
  UserCircle,
} from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LeadActivityFeedProps {
  activities: LeadActivity[]
}

const activityIcons: Record<LeadActivityType, React.ElementType> = {
  [LeadActivityType.NOTE_CREATED]: ChatCircleText,
  [LeadActivityType.STATUS_CHANGED]: ArrowsLeftRight,
  [LeadActivityType.SOURCE_UPDATED]: Gear,
  [LeadActivityType.CONTACT_UPDATED]: UserCircle,
  [LeadActivityType.WHATSAPP_LINK_OPENED]: RocketLaunch,
  [LeadActivityType.LEAD_EDITED]: NotePencil,
  [LeadActivityType.CONVERTED_TO_PROJECT]: RocketLaunch,
  [LeadActivityType.REMINDER_SET]: Clock,
}

const activityColors: Record<LeadActivityType, string> = {
  [LeadActivityType.NOTE_CREATED]: "text-brand-primary bg-brand-primary/10",
  [LeadActivityType.STATUS_CHANGED]: "text-amber-500 bg-amber-500/10",
  [LeadActivityType.SOURCE_UPDATED]: "text-muted-foreground bg-muted/10",
  [LeadActivityType.CONTACT_UPDATED]: "text-blue-500 bg-blue-500/10",
  [LeadActivityType.WHATSAPP_LINK_OPENED]: "text-green-500 bg-green-500/10",
  [LeadActivityType.LEAD_EDITED]: "text-purple-500 bg-purple-500/10",
  [LeadActivityType.CONVERTED_TO_PROJECT]: "text-green-600 bg-green-600/10",
  [LeadActivityType.REMINDER_SET]: "text-orange-500 bg-orange-500/10",
}

export function LeadActivityFeed({
  activities,
}: LeadActivityFeedProps): React.JSX.Element {
  if (activities.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
          Nenhuma atividade registrada.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border/30">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || Gear
        const colorClass =
          activityColors[activity.type] || "text-muted-foreground bg-muted/10"

        return (
          <div key={activity.id} className="relative pl-10">
            <div
              className={`absolute left-0 flex size-8 items-center justify-center rounded-full border border-background shadow-sm ${colorClass}`}
            >
              <Icon weight="fill" className="size-4" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-heading text-sm font-black uppercase tracking-tight text-foreground/90">
                  {activity.title}
                </h4>
                <span className="shrink-0 text-[9px] font-bold text-muted-foreground/40 uppercase">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              {activity.content && (
                <p className="text-xs leading-relaxed text-muted-foreground/70">
                  {activity.content}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                <UserCircle weight="bold" className="size-3" />
                {activity.author?.name || "Sistema"}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
