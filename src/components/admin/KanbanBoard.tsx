"use client"

import * as React from "react"

import { useRouter } from "next/navigation"

import { LeadStatus } from "@/src/generated/client"
import { usePathname } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"

import { CRM_STATUS_ORDER } from "@/src/lib/utils/crm"

import { KanbanColumn } from "./kanban/KanbanColumn"

export function KanbanBoard({
  leads,
  initialLeadId = null,
  clients,
  templates,
}: {
  leads: Lead[]
  initialLeadId?: string | null
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(
    initialLeadId
  )

  // Local state for basic filtering/mapping without DnD complexity
  const [boardLeads, setBoardLeads] = React.useState(leads)

  React.useEffect(() => {
    setBoardLeads(leads)
  }, [leads])

  const columnMap = React.useMemo(() => {
    return CRM_STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = boardLeads
          .filter((l) => l.status === status)
          .map((l) => l.id)
        return acc
      },
      {} as Record<LeadStatus, string[]>
    )
  }, [boardLeads])

  const leadMap = React.useMemo(() => {
    return boardLeads.reduce(
      (acc, l) => {
        acc[l.id] = l
        return acc
      },
      {} as Record<string, Lead>
    )
  }, [boardLeads])

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {CRM_STATUS_ORDER.filter((s) => s !== LeadStatus.CONVERTIDO).map(
          (status) => (
            <KanbanColumn
              key={status}
              status={status}
              leadIds={columnMap[status]}
              leadMap={leadMap}
              density="comfortable"
              selectedLeadId={selectedLeadId}
              clients={clients}
              templates={templates}
              onDrawerOpenChange={(id, open) => {
                setSelectedLeadId(open ? id : null)
                if (!open && initialLeadId)
                  router.replace(pathname, { scroll: false })
              }}
              onLeadUpdated={(next) =>
                setBoardLeads((curr) =>
                  curr.map((l) => (l.id === next.id ? next : l))
                )
              }
              onLeadDeleted={(id) =>
                setBoardLeads((curr) => curr.filter((l) => l.id !== id))
              }
            />
          )
        )}
      </div>
    </div>
  )
}
