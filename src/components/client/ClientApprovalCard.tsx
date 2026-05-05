"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ClientPortalUpdate } from "@/src/types/client-portal"
import { CheckCircle, WarningCircle } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Textarea } from "@/src/components/ui/textarea"

import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

import {
  approveUpdateAction,
  rejectUpdateAction,
} from "@/src/lib/actions/project.actions"

interface ClientApprovalCardProps {
  update: ClientPortalUpdate
  projectId: string
}

export function ClientApprovalCard({
  update,
  projectId,
}: ClientApprovalCardProps) {
  const t = useTranslations("Approvals")
  const [isPending, setIsPending] = React.useState(false)
  const [feedback, setFeedback] = React.useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false)

  async function handleApprove() {
    setIsPending(true)
    try {
      const result = await approveUpdateAction(update.id, projectId)
      if (result.success) {
        toast.success(t("toast.approve_success"))
      } else {
        toast.error(result.error || t("toast.error_approve"))
      }
    } catch {
      toast.error(t("toast.error_approve"))
    } finally {
      setIsPending(false)
    }
  }

  async function handleReject() {
    if (!feedback.trim()) return
    setIsPending(true)
    try {
      const result = await rejectUpdateAction({
        updateId: update.id,
        projectId,
        feedback,
      })
      if (result.success) {
        toast.success(t("toast.reject_success"))
        setIsRejectDialogOpen(false)
      } else {
        toast.error(result.error || t("toast.error_reject"))
      }
    } catch {
      toast.error(t("toast.error_reject"))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-border/20 bg-muted/5 transition-all hover:border-brand-primary/20">
      <CardHeader className="border-b border-border/10 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-primary">
                {t("status.PENDING")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                • {new Date(update.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <CardTitle className="font-heading text-2xl font-black uppercase leading-none tracking-tight text-foreground sm:text-3xl">
              {update.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-5 sm:p-6 lg:p-7">
        <div className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80 sm:text-base">
          {update.description || "Sem descrição detalhada."}
        </div>

        <UpdateAttachmentsList attachments={update.attachments} />
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6 lg:p-7">
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full rounded-full border-border/40 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 sm:w-auto"
            >
              <WarningCircle className="mr-2 size-4" />
              {t("actions.reject")}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-background shadow-2xl border-border/40 max-w-2xl p-8 gap-8"
            showCloseButton={false}
          >
            <DialogHeader className="gap-2">
              <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight">
                {t("dialog.title")}
              </DialogTitle>
              <DialogDescription className="text-base font-medium leading-relaxed">
                {t("dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Textarea
                placeholder={t("dialog.placeholder")}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[200px] rounded-4xl border-border/40 bg-muted/5 p-6 text-sm focus:border-brand-primary/40 leading-relaxed resize-none"
              />
            </div>

            <DialogFooter className="gap-3 sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsRejectDialogOpen(false)}
                className="h-12 rounded-full px-8 text-[10px] font-black uppercase tracking-widest hover:bg-muted/20"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isPending || !feedback.trim()}
                className="h-12 rounded-full bg-brand-primary px-10 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPending ? "Processando..." : t("actions.send_feedback")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="h-12 w-full rounded-full bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
        >
          {isPending ? (
            "Processando..."
          ) : (
            <>
              <CheckCircle className="mr-2 size-4" weight="fill" />
              {t("actions.approve")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
