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
  [LeadActivityType.NOTE_CREATED]: "text-brand-primary bg-brand-primary/8",
  [LeadActivityType.STATUS_CHANGED]: "text-foreground/65 bg-muted/[0.05]",
  [LeadActivityType.SOURCE_UPDATED]: "text-foreground/60 bg-muted/[0.05]",
  [LeadActivityType.CONTACT_UPDATED]: "text-foreground/60 bg-muted/[0.05]",
  [LeadActivityType.WHATSAPP_LINK_OPENED]: "text-foreground/60 bg-muted/[0.05]",
  [LeadActivityType.LEAD_EDITED]: "text-foreground/60 bg-muted/[0.05]",
  [LeadActivityType.CONVERTED_TO_PROJECT]: "text-brand-primary bg-brand-primary/8",
  [LeadActivityType.REMINDER_SET]: "text-foreground/60 bg-muted/[0.05]",
}

const leadStatusLabel: Record<string, string> = {
  GARIMPAGEM: "Garimpagem",
  CONTATO_REALIZADO: "Contato realizado",
  NEGOCIACAO: "Negociacao",
  CONVERTIDO: "Convertido",
  DESCARTADO: "Descartado",
}

function humanizeLeadStatus(value: unknown): string | null {
  if (typeof value !== "string") return null
  return leadStatusLabel[value] ?? value.replaceAll("_", " ").toLowerCase()
}

function getActivityDescription(activity: LeadActivity): string | null {
  if (activity.type === LeadActivityType.STATUS_CHANGED) {
    const from = humanizeLeadStatus(activity.metadata?.from)
    const to = humanizeLeadStatus(activity.metadata?.to)

    if (from && to) {
      return `Lead movido de ${from} para ${to}.`
    }
  }

  return activity.content
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
    <div className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border/20">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || Gear
        const colorClass =
          activityColors[activity.type] || "text-muted-foreground bg-muted/10"
        const description = getActivityDescription(activity)

        return (
          <div key={activity.id} className="relative pl-10">
            <div
              className={`absolute left-0 flex size-8 items-center justify-center rounded-full border border-border/10 ${colorClass}`}
            >
              <Icon weight="fill" className="size-4" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-black tracking-tight text-foreground/88">
                  {activity.title}
                </h4>
                <span className="shrink-0 text-[9px] font-bold text-muted-foreground/40 uppercase">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              {description && (
                <p className="text-xs leading-relaxed text-muted-foreground/70">
                  {description}
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
