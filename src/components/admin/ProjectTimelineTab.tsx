"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardUpdate } from "@/src/types/dashboard"
import {
  ChatCircleText,
  CheckCircle,
  Clock,
  HourglassSimple,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"

import { AddTimelineForm } from "@/src/components/admin/AddTimelineForm"
import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

import { deleteProjectTimelineAction } from "@/src/lib/actions/project-timeline.actions"
import { formatLocalTime } from "@/src/lib/utils/utils"

interface ProjectTimelineTabProps {
  projectId: string
  updates: DashboardUpdate[]
}

function UpdateStatusPill({
  update,
}: {
  update: DashboardUpdate
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

export function ProjectTimelineTab({
  projectId,
  updates,
}: ProjectTimelineTabProps) {
  const t = useTranslations("Admin.projects.details")
  const [visibleUpdatesCount, setVisibleUpdatesCount] = React.useState(5)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [updateToDelete, setUpdateToDelete] = React.useState<string | null>(
    null
  )

  const visibleUpdates = React.useMemo(() => {
    return updates.slice(0, visibleUpdatesCount)
  }, [updates, visibleUpdatesCount])

  const hasMoreUpdates = visibleUpdates.length < updates.length

  const handleDelete = async () => {
    if (!updateToDelete) return

    setIsDeleting(updateToDelete)
    const result = await deleteProjectTimelineAction(updateToDelete, projectId)

    if (result.success) {
      toast.success("Atualização removida com sucesso")
    } else {
      toast.error(result.error || "Erro ao remover atualização")
    }
    setIsDeleting(null)
    setUpdateToDelete(null)
  }

  return (
    <div className="flex flex-col gap-12">
      <AddTimelineForm projectId={projectId} />

      <section className="flex flex-col gap-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("timeline_title")}
        </h3>

        <div className="ml-4 flex flex-col gap-0 border-l border-border/40">
          {visibleUpdates.map((update) => (
            <div
              key={update.id}
              id={`update-${update.id}`}
              className="relative pb-12 pl-12 transition-colors duration-1000 last:pb-0"
            >
              <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-background bg-brand-primary shadow-sm shadow-brand-primary/20" />
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/40">
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

                  <button
                    onClick={() => setUpdateToDelete(update.id)}
                    disabled={isDeleting === update.id}
                    className="ml-auto flex size-8 items-center justify-center rounded-xl bg-muted/5 text-muted-foreground/30 transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Excluir atualização"
                  >
                    <Trash
                      weight="bold"
                      className={`size-4 ${isDeleting === update.id ? "animate-pulse" : ""}`}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                    {update.title}
                  </h4>

                  {update.description && (
                    <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/60">
                      {update.description}
                    </p>
                  )}

                  {update.feedback && (
                    <div className="max-w-2xl rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-sm shadow-amber-500/10">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
                          <ChatCircleText weight="fill" className="size-5" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/80">
                            Solicitação de ajustes do cliente
                          </p>
                          <p className="text-sm font-medium leading-relaxed text-white">
                            {update.feedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <UpdateAttachmentsList attachments={update.attachments} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMoreUpdates && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleUpdatesCount(visibleUpdates.length + 5)}
              className="rounded-full border border-border/30 bg-background/60 px-6 py-3 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-foreground/80 transition hover:border-brand-primary/30 hover:text-brand-primary"
            >
              Ver Mais
            </button>
          </div>
        )}
      </section>

      <AlertDialog
        open={!!updateToDelete}
        onOpenChange={(open) => !open && setUpdateToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
              Remover Atualização
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60">
              Esta ação removerá permanentemente esta evolução da timeline do
              cliente. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive text-xs font-bold uppercase tracking-widest text-white hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
