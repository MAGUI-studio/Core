"use client"

import * as React from "react"

import { ClientPortalUpdate } from "@/src/types/client-portal"
import {
  ChatCircleText,
  CheckCircle,
  Clock,
  HourglassSimple,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"
import { parseAsString, useQueryState } from "nuqs"

import { Button } from "@/src/components/ui/button"

import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface ClientTimelineProps {
  updates: ClientPortalUpdate[]
}

function UpdateStatusPill({
  update,
}: {
  update: ClientPortalUpdate
}): React.JSX.Element {
  if (update.feedback) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
        <WarningCircle weight="fill" className="size-3" />
        Ajustes Solicitados
      </div>
    )
  }

  if (!update.requiresApproval) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
        <CheckCircle weight="fill" className="size-3 text-brand-primary" />
        Publicado
      </div>
    )
  }

  if (update.approvalStatus === "APPROVED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-green-600">
        <CheckCircle weight="fill" className="size-3" />
        Aprovado
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
      <HourglassSimple weight="fill" className="size-3" />
      Pendente de Aprovação
    </div>
  )
}

export function ClientTimeline({ updates }: ClientTimelineProps) {
  const [highlightedId] = useQueryState("highlight", parseAsString)
  const [visibleUpdatesCount, setVisibleUpdatesCount] = React.useState(5)

  const visibleUpdates = React.useMemo(() => {
    if (highlightedId) {
      const highlightedIndex = updates.findIndex((u) => u.id === highlightedId)
      if (highlightedIndex >= visibleUpdatesCount) {
        return updates.slice(0, highlightedIndex + 1)
      }
    }
    return updates.slice(0, visibleUpdatesCount)
  }, [updates, highlightedId, visibleUpdatesCount])

  const hasMoreUpdates = visibleUpdates.length < updates.length

  React.useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`update-${highlightedId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [highlightedId])

  return (
    <div className="flex flex-col gap-8">
      <div className="relative ml-2 flex flex-col gap-0 border-l border-border/30 sm:ml-5">
        {visibleUpdates.map((update) => (
          <div
            key={update.id}
            id={`update-${update.id}`}
            className={`relative pb-8 pl-8 transition-colors duration-1000 last:pb-0 sm:pl-12 ${
              highlightedId === update.id
                ? "rounded-[1.75rem] bg-brand-primary/5 ring-1 ring-brand-primary/20"
                : ""
            }`}
          >
            <div className="absolute -left-[9px] top-1 size-4 rounded-full border-4 border-background bg-brand-primary shadow-sm shadow-brand-primary/20" />
            <article className="rounded-[1.75rem] border border-border/15 p-5 transition hover:border-brand-primary/20 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/45">
                <div className="flex items-center gap-2">
                  <Clock
                    weight="bold"
                    className="size-3.5 text-brand-primary/60"
                  />
                  <span>
                    {formatLocalTime(
                      new Date(update.createdAt),
                      update.timezone
                    )}
                  </span>
                </div>

                {update.isMilestone && (
                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary">
                    Marco
                  </span>
                )}

                <UpdateStatusPill update={update} />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <h4 className="font-heading text-2xl font-black uppercase leading-none tracking-tight text-foreground sm:text-3xl">
                  {update.title}
                </h4>

                {update.description && (
                  <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/70 sm:text-base">
                    {update.description}
                  </p>
                )}

                {update.feedback && (
                  <div className="max-w-3xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm shadow-amber-500/10">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                        <ChatCircleText weight="fill" className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-600/80">
                          Sua solicitação de ajustes
                        </p>
                        <p className="text-sm font-medium leading-relaxed text-amber-700">
                          {update.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <UpdateAttachmentsList attachments={update.attachments} />
              </div>
            </article>
          </div>
        ))}
      </div>

      {hasMoreUpdates && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleUpdatesCount(visibleUpdates.length + 5)}
            className="h-12 rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-[0.22em] text-foreground/80 hover:border-brand-primary/30 hover:text-brand-primary"
          >
            Ver Mais
          </Button>
        </div>
      )}
    </div>
  )
}
