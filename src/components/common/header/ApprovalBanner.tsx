"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardUpdateAttachment } from "@/src/types/dashboard"
import {
  ArrowRightIcon,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CircleNotch,
  ClockCountdown,
  HandsClapping,
  NotePencil,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { Textarea } from "@/src/components/ui/textarea"

import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

import {
  approveUpdateAction,
  rejectUpdateAction,
} from "@/src/lib/actions/project.actions"

interface PendingApproval {
  count: number
  projectId: string
  projectName: string
  lastUpdateId: string
  lastUpdateTitle: string
  lastUpdateDescription: string | null
  attachments: DashboardUpdateAttachment[]
}

interface ApprovalBannerProps {
  approvals: PendingApproval[]
}

export function ApprovalBanner({ approvals }: ApprovalBannerProps) {
  const tDashboard = useTranslations("Dashboard")
  const tApp = useTranslations("Approvals")

  const [isApproving, setIsApproving] = React.useState(false)
  const [isRejecting, setIsRejecting] = React.useState(false)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [feedback, setFeedback] = React.useState("")
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([])

  const visibleApprovals = React.useMemo(
    () => approvals.filter((a) => !dismissedIds.includes(a.lastUpdateId)),
    [dismissedIds, approvals]
  )

  React.useEffect(() => {
    setCurrentIndex(0)
    setDismissedIds([])
  }, [approvals.length])

  const active = visibleApprovals[currentIndex]

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % visibleApprovals.length)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(
      (prev) => (prev - 1 + visibleApprovals.length) % visibleApprovals.length
    )
  }

  const handleApprove = async () => {
    if (!active) return
    setIsApproving(true)
    const result = await approveUpdateAction(
      active.lastUpdateId,
      active.projectId
    )
    if (result.success) {
      toast.success(tApp("toast.approve_success"))
      setDismissedIds((curr) => [...curr, active.lastUpdateId])
      setFeedback("")
      setIsSheetOpen(false)
    } else {
      toast.error(result.error ?? tApp("toast.error_approve"))
    }
    setIsApproving(false)
  }

  const handleReject = async () => {
    if (!active) return
    setIsRejecting(true)
    const result = await rejectUpdateAction({
      updateId: active.lastUpdateId,
      projectId: active.projectId,
      feedback,
    })
    if (result.success) {
      toast.success(tApp("toast.reject_success"))
      setDismissedIds((curr) => [...curr, active.lastUpdateId])
      setFeedback("")
      setIsSheetOpen(false)
    } else {
      toast.error(result.error ?? tApp("toast.error_reject"))
    }
    setIsRejecting(false)
  }

  if (visibleApprovals.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-b border-yellow-400/20 bg-linear-to-b from-yellow-700 to-yellow-600 text-white shadow-2xl shadow-yellow-950/20"
    >
      <div className="mx-auto flex w-full max-w-440 flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {visibleApprovals.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="size-6 rounded-full bg-white/5 hover:bg-white/10 text-white border-none transition-all active:scale-90"
              >
                <CaretLeft weight="bold" className="size-3" />
              </Button>
              <span className="min-w-[40px] text-center font-mono text-[10px] font-bold tracking-tighter text-white/40">
                {currentIndex + 1}
                <span className="mx-1 opacity-20">/</span>
                {visibleApprovals.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="size-6 rounded-full bg-white/5 hover:bg-white/10 text-white border-none transition-all active:scale-90"
              >
                <CaretRight weight="bold" className="size-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-white/90">
              {tApp("status.PENDING")}
            </span>
            <p className="truncate font-heading text-[10px] font-black uppercase leading-none tracking-widest text-white/60">
              {active.projectName} - {active.lastUpdateTitle}
            </p>
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="h-8 shrink-0 rounded-full border border-white/20 bg-white/10 px-6 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/20 active:scale-95 group"
            >
              {tDashboard("banner.cta")}
              <ArrowRightIcon
                weight="bold"
                className="ml-2 size-4 group-hover:translate-x-0.5 transition-all duration-300"
              />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[94vw] border-l border-border/30 bg-background p-0 sm:min-w-[38rem] sm:max-w-[40vw]"
          >
            <SheetHeader className="border-b border-border/20 bg-gradient-to-b from-brand-primary/6 to-transparent px-7 py-7">
              <div className="max-w-md text-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <ClockCountdown weight="fill" className="size-3.5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
                    {active.projectName}
                  </span>
                </div>
                <SheetTitle className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                  {active.lastUpdateTitle}
                </SheetTitle>
                {active.lastUpdateDescription && (
                  <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60">
                    {active.lastUpdateDescription}
                  </SheetDescription>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 border-t border-border/10">
              <div className="flex flex-col gap-8">
                {active.attachments?.length > 0 && (
                  <UpdateAttachmentsList attachments={active.attachments} />
                )}

                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        weight="fill"
                        className="size-4 text-emerald-500"
                      />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/70">
                        {tApp("actions.approve")}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tApp("dialog.description")}
                    </p>
                    <Button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="h-12 w-full sm:w-auto rounded-full bg-foreground px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background transition-transform"
                    >
                      {isApproving ? (
                        <CircleNotch className="mr-2 size-4 animate-spin" />
                      ) : (
                        <HandsClapping className="mr-2 size-4" weight="fill" />
                      )}
                      {tApp("actions.approve")}
                    </Button>
                  </div>

                  <div className="h-px w-full bg-border/10 my-2" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <NotePencil
                        weight="fill"
                        className="size-4 text-amber-500"
                      />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/70">
                        {tApp("actions.reject")}
                      </h4>
                    </div>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[160px] resize-none rounded-2xl border-border/40 bg-muted/10 p-5 text-sm leading-relaxed"
                      placeholder={tApp("dialog.placeholder")}
                    />
                    <Button
                      onClick={handleReject}
                      disabled={isRejecting || feedback.trim().length < 10}
                      variant="outline"
                      className="h-12 w-full sm:w-auto rounded-full border-border/40 bg-background px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-foreground/82 transition-transform hover:bg-background"
                    >
                      {isRejecting ? (
                        <CircleNotch className="mr-2 size-4 animate-spin" />
                      ) : (
                        <NotePencil className="mr-2 size-4" />
                      )}
                      {tApp("actions.send_feedback")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="bg-background/80 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 border-t border-border/10">
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="font-mono text-[10px] font-black uppercase tracking-[0.3em]"
                >
                  {tApp("actions.cancel")}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  )
}
