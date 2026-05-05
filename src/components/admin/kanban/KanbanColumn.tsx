"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadStatus } from "@/src/generated/client"
import { Lead, MessageTemplate } from "@/src/types/crm"

import { LEAD_STATUS_STYLES } from "@/src/lib/utils/crm"

import { KanbanLeadCard } from "./KanbanLeadCard"

interface KanbanColumnProps {
  status: LeadStatus
  leadIds: string[]
  leadMap: Record<string, Lead>
  density: "comfortable" | "compact"
  onDrawerOpenChange: (leadId: string, open: boolean) => void
  selectedLeadId: string | null
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  onLeadUpdated: (lead: Lead) => void
  onLeadDeleted: (leadId: string) => void
}

export function KanbanColumn({
  status,
  leadIds,
  leadMap,
  density,
  onDrawerOpenChange,
  selectedLeadId,
  clients,
  templates,
  onLeadUpdated,
  onLeadDeleted,
}: KanbanColumnProps) {
  const t = useTranslations("Admin.crm")
  const leads = leadIds.map((id) => leadMap[id]).filter(Boolean)

  return (
    <section
      className={`flex min-h-[32rem] flex-col rounded-[1.9rem] border p-4 ${LEAD_STATUS_STYLES[status].column}`}
    >
      <div className="rounded-[1.4rem] border border-border/35 bg-background/80 px-4 py-4">
        <p
          className={`text-[10px] font-black uppercase tracking-[0.24em] ${LEAD_STATUS_STYLES[status].accent}`}
        >
          {t(`status.${status}`)}
        </p>
        <p className="text-2xl font-black tracking-tight text-foreground">
          {leads.length}
        </p>
      </div>

      <div className="mt-4 grid flex-1 content-start gap-3">
        {leads.map((lead) => (
          <KanbanLeadCard
            key={lead.id}
            lead={lead}
            density={density}
            onDrawerOpenChange={onDrawerOpenChange}
            isOpen={selectedLeadId === lead.id}
            clients={clients}
            templates={templates}
            onLeadUpdated={onLeadUpdated}
            onLeadDeleted={onLeadDeleted}
          />
        ))}
        {leads.length === 0 && (
          <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed border-border/40 bg-background/50 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Nenhum lead nesta etapa
          </div>
        )}
      </div>
    </section>
  )
}
