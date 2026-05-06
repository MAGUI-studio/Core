"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { LeadStatus } from "@/src/generated/client"
import { Lead, MessageTemplate } from "@/src/types/crm"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { LeadDetailsDrawer } from "@/src/components/admin/LeadDetailsDrawer"

import { updateLeadStatus } from "@/src/lib/actions/crm.actions"
import { CRM_STATUS_ORDER } from "@/src/lib/utils/crm"

interface KanbanLeadCardProps {
  lead: Lead
  density?: "comfortable" | "compact"
  isOpen?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  onDrawerOpenChange: (leadId: string, open: boolean) => void
  onLeadUpdated: (lead: Lead) => void
  onLeadDeleted: (leadId: string) => void
}

export function KanbanLeadCard({
  lead,
  density = "comfortable",
  isOpen = false,
  clients,
  templates,
  onDrawerOpenChange,
  onLeadUpdated,
  onLeadDeleted,
}: KanbanLeadCardProps) {
  const t = useTranslations("Admin.crm")
  const router = useRouter()
  const [isMoving, setIsMoving] = React.useState(false)

  // Status excluding CONVERTIDO for manual movement restriction
  const availableStatus = CRM_STATUS_ORDER.filter(
    (s) => s !== LeadStatus.CONVERTIDO
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentIndex = availableStatus.indexOf(lead.status as any)

  const canMovePrev = currentIndex > 0
  const canMoveNext = currentIndex < availableStatus.length - 1

  const handleMove = async (direction: "next" | "prev") => {
    if (isMoving) return
    setIsMoving(true)

    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1
    const nextStatus = availableStatus[nextIndex]

    if (!nextStatus) {
      setIsMoving(false)
      return
    }

    const result = await updateLeadStatus(lead.id, nextStatus)

    if (result.success) {
      toast.success(`Lead movido para ${t(`status.${nextStatus}`)}`)
      router.refresh()
    } else {
      toast.error(result.error || "Erro ao mover lead")
    }

    setIsMoving(false)
  }

  return (
    <article
      className="group relative rounded-[1.5rem] border border-border/50 bg-background/95 p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] transition-all hover:border-border/70"
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-base font-black tracking-tight text-foreground">
            {lead.companyName}
          </p>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {canMovePrev && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isMoving}
                onClick={() => handleMove("prev")}
                className="size-7 rounded-full bg-muted/20 hover:bg-muted/40"
              >
                <CaretLeft weight="bold" className="size-3" />
              </Button>
            )}
            {canMoveNext && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isMoving}
                onClick={() => handleMove("next")}
                className="size-7 rounded-full bg-muted/20 hover:bg-muted/40"
              >
                <CaretRight weight="bold" className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex justify-end ${density === "compact" ? "mt-3" : "mt-4"}`}
      >
        <LeadDetailsDrawer
          lead={lead}
          onOpenChange={(open) => onDrawerOpenChange(lead.id, open)}
          open={isOpen}
          clients={clients}
          templates={templates}
          onLeadUpdated={onLeadUpdated}
          onLeadDeleted={onLeadDeleted}
        >
          <Button
            variant="outline"
            className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Abrir
          </Button>
        </LeadDetailsDrawer>
      </div>
    </article>
  )
}
