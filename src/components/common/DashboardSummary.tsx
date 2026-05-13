"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProjectStatus } from "@/src/generated/client"
import { DashboardProject, DashboardUpdate } from "@/src/types/dashboard"
import {
  CaretDown,
  CaretUp,
  ChatCircleText,
  CheckCircle,
  CircleNotch,
  CloudArrowUp,
  FileText,
  FlagPennant,
  GithubLogo,
  Globe,
  HandsClapping,
  NotePencil,
  WarningCircle,
} from "@phosphor-icons/react"
import { type Variants, motion } from "framer-motion"
import { toast } from "sonner"

import { ProjectScheduleDelayTooltip } from "@/src/components/common/ProjectScheduleDelayTooltip"

import {
  approveUpdateAction,
  rejectUpdateAction,
  requestScopeChangeAction,
} from "@/src/lib/actions/project.actions"
import {
  buildProjectScheduleView,
  getExecutionDaysLabel,
} from "@/src/lib/project-schedule"
import { cn, formatLocalTime } from "@/src/lib/utils/utils"

import { Button } from "../ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Textarea } from "../ui/textarea"
import { ActionItemsWidget } from "./ActionItemsWidget"
import { BriefingNotes } from "./BriefingNotes"
import { ClientPendingInbox } from "./ClientPendingInbox"
import { UpdateAttachmentsList } from "./UpdateAttachmentsList"
import { VersionsLog } from "./VersionsLog"

interface DashboardSummaryProps {
  project: DashboardProject
}

function getUpdateFlags(update: DashboardUpdate) {
  const isPendingApproval =
    update.requiresApproval && update.approvalStatus === "PENDING"
  const isApproved =
    update.requiresApproval && update.approvalStatus === "APPROVED"
  const hasFeedback = Boolean(update.feedback)
  const isPublished = !update.requiresApproval

  return {
    isApproved,
    hasFeedback,
    isPendingApproval,
    isPublished,
  }
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
}

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
}

export function DashboardSummary({
  project,
}: DashboardSummaryProps): React.JSX.Element {
  const t = useTranslations("Dashboard")
  const tStatus = useTranslations("Dashboard.status")
  const tApp = useTranslations("Approvals")
  const [isApproving, setIsApproving] = React.useState<string | null>(null)
  const [isRejecting, setIsRejecting] = React.useState<string | null>(null)
  const [rejectDialogUpdateId, setRejectDialogUpdateId] = React.useState<
    string | null
  >(null)
  const [approvalComment, setApprovalComment] = React.useState("")
  const [feedback, setFeedback] = React.useState("")
  const [scopeDialogUpdateId, setScopeDialogUpdateId] = React.useState<
    string | null
  >(null)
  const [scopeReason, setScopeReason] = React.useState("")
  const [isRequestingScope, setIsRequestingScope] = React.useState<
    string | null
  >(null)
  const [visibleUpdatesCount, setVisibleUpdatesCount] = React.useState(5)

  const pendingApprovalCount = React.useMemo(
    () =>
      project.updates.filter(
        (update) =>
          update.requiresApproval && update.approvalStatus === "PENDING"
      ).length,
    [project.updates]
  )

  const statusSteps = [
    "STRATEGY",
    "ARCHITECTURE",
    "DESIGN",
    "ENGINEERING",
    "QA",
    "LAUNCHED",
  ]
  const currentStatusIndex = statusSteps.indexOf(project.status as string)
  const nextStatus =
    currentStatusIndex >= 0 && currentStatusIndex < statusSteps.length - 1
      ? statusSteps[currentStatusIndex + 1]
      : null

  const visibleUpdates = project.updates.slice(0, visibleUpdatesCount)
  const hasMoreUpdates = visibleUpdatesCount < project.updates.length
  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  )
  const schedule = buildProjectScheduleView(
    project.scheduleData,
    project.status
  )
  const visibleDelayReasons = schedule.delayReasons.filter(
    (reason) => reason.businessDaysAdded > 0
  )

  const handleApprove = async (updateId: string) => {
    setIsApproving(updateId)
    const result = await approveUpdateAction(
      updateId,
      project.id,
      approvalComment
    )

    if (result.success) {
      toast.success(tApp("toast.approve_success"))
      setApprovalComment("")
    } else {
      toast.error(result.error ?? tApp("toast.error_approve"))
    }

    setIsApproving(null)
  }

  const handleReject = async (updateId: string) => {
    setIsRejecting(updateId)
    const result = await rejectUpdateAction({
      updateId,
      projectId: project.id,
      feedback,
    })

    if (result.success) {
      toast.success(tApp("toast.reject_success"))
      setFeedback("")
      setRejectDialogUpdateId(null)
    } else {
      toast.error(result.error ?? tApp("toast.error_reject"))
    }

    setIsRejecting(null)
  }

  const handleScopeChange = async (updateId: string) => {
    setIsRequestingScope(updateId)
    const result = await requestScopeChangeAction({
      updateId,
      projectId: project.id,
      justification: scopeReason,
    })

    if (result.success) {
      toast.success("Novo escopo solicitado com sucesso.")
      setScopeReason("")
      setScopeDialogUpdateId(null)
    } else {
      toast.error(result.error ?? "Erro ao solicitar novo escopo.")
    }

    setIsRequestingScope(null)
  }

  return (
    <motion.div
      className="flex w-full flex-col gap-14"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <ClientPendingInbox project={project} />

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_340px]">
        <div className="relative space-y-14">
          {/* Vertical Divider */}
          <div className="absolute -right-5 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-border/40 to-transparent lg:block" />

          <motion.section
            id={`project-timeline-${project.id}`}
            className="scroll-mt-40 space-y-10"
            variants={sectionVariants}
          >
            <motion.div
              className="flex items-center gap-4"
              variants={sectionVariants}
            >
              <div className="h-[1px] w-12 bg-border/40" />
              <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
                {t("timeline.title")}
              </h3>
            </motion.div>

            <motion.div className="space-y-8" variants={listVariants}>
              {visibleUpdates.map((update) => {
                const { isApproved, hasFeedback, isPendingApproval } =
                  getUpdateFlags(update)

                const statusLabel = isPendingApproval
                  ? tApp("status.PENDING")
                  : hasFeedback
                    ? t("timeline.status_adjustments_requested")
                    : isApproved
                      ? t("timeline.status_approved")
                      : t("timeline.status_published")

                const StatusIcon = isPendingApproval
                  ? WarningCircle
                  : hasFeedback
                    ? NotePencil
                    : isApproved
                      ? CheckCircle
                      : Globe

                const statusTone = isPendingApproval
                  ? "bg-warning/12 text-warning"
                  : hasFeedback
                    ? "bg-orange/12 text-orange"
                    : isApproved
                      ? "bg-success/12 text-success"
                      : "bg-info/10 text-info"

                return (
                  <motion.article
                    key={update.id}
                    variants={cardVariants}
                    whileHover={{
                      y: -3,
                      transition: { duration: 0.18, ease: "easeOut" },
                    }}
                    className={cn(
                      "rounded-[1.6rem] bg-background/78 p-6 ring-1 ring-black/6 backdrop-blur-xl transition-[background-color,box-shadow,transform] duration-300 hover:bg-background/88 dark:ring-white/10 sm:p-7",
                      isPendingApproval && "dark:ring-brand-primary/18"
                    )}
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted/38 text-foreground/60 transition-colors duration-300 group-hover:text-foreground">
                          {hasFeedback ? (
                            <ChatCircleText weight="fill" className="size-5" />
                          ) : isPendingApproval ? (
                            <WarningCircle weight="fill" className="size-5" />
                          ) : (
                            <CheckCircle weight="fill" className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.24em] transition-transform duration-200",
                                statusTone
                              )}
                            >
                              <StatusIcon weight="fill" className="size-3.5" />
                              {statusLabel}
                            </span>

                            {update.isMilestone && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.24em] text-brand-primary">
                                <FlagPennant
                                  weight="fill"
                                  className="size-3.5"
                                />
                                {t("timeline.milestone")}
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground/94">
                              {update.title}
                            </h4>
                            {update.description && (
                              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/72">
                                {update.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <UpdateAttachmentsList
                        attachments={update.attachments}
                        compact
                      />

                      {hasFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="rounded-[1.35rem] bg-muted/24 p-5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground/55">
                              <ChatCircleText
                                weight="fill"
                                className="size-5"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
                                {t("timeline.requested_adjustments_title")}
                              </p>
                              <p className="text-sm font-medium leading-relaxed text-foreground/84">
                                {update.feedback}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {isPendingApproval && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="rounded-[1.35rem] bg-muted/24 p-5 sm:p-6"
                        >
                          <div className="flex flex-col gap-5">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-primary">
                                {tApp("status.PENDING")}
                              </p>
                              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/78">
                                {tApp("dialog.description")}
                              </p>
                            </div>

                            <Textarea
                              value={approvalComment}
                              onChange={(e) =>
                                setApprovalComment(e.target.value)
                              }
                              placeholder="Adicionar um comentario opcional..."
                              className="min-h-[100px] rounded-2xl border-border/40 bg-background/50 text-sm"
                            />

                            <div className="flex flex-wrap items-center gap-4">
                              <motion.div
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Button
                                  onClick={() => handleApprove(update.id)}
                                  disabled={isApproving === update.id}
                                  className="h-11 rounded-full bg-foreground px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background transition-transform"
                                >
                                  {isApproving === update.id ? (
                                    <CircleNotch className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <HandsClapping
                                      className="mr-2 size-4"
                                      weight="fill"
                                    />
                                  )}
                                  {tApp("actions.approve")}
                                </Button>
                              </motion.div>

                              <Sheet
                                open={rejectDialogUpdateId === update.id}
                                onOpenChange={(open) => {
                                  setRejectDialogUpdateId(
                                    open ? update.id : null
                                  )
                                  if (!open) {
                                    setFeedback("")
                                  }
                                }}
                              >
                                <SheetTrigger asChild>
                                  <motion.div
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <Button
                                      variant="outline"
                                      className="h-11 rounded-full border-transparent bg-background px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-foreground/82 shadow-none transition-transform hover:bg-background"
                                    >
                                      <NotePencil className="mr-2 size-4" />
                                      {tApp("actions.reject")}
                                    </Button>
                                  </motion.div>
                                </SheetTrigger>
                                <SheetContent
                                  side="right"
                                  className="w-[94vw] border-l border-border/30 bg-background/95 p-0 sm:min-w-[38rem] sm:max-w-[40vw]"
                                >
                                  <SheetHeader className="border-b border-border/20 bg-gradient-to-b from-brand-primary/6 to-transparent px-7 py-7 text-left">
                                    <div className="flex items-start justify-between gap-5 pr-10 text-left">
                                      <div className="max-w-md">
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                                            <NotePencil
                                              weight="fill"
                                              className="size-3.5"
                                            />
                                          </div>
                                          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
                                            {tApp("actions.reject")}
                                          </span>
                                        </div>
                                        <SheetTitle className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                                          {tApp("dialog.title")}
                                        </SheetTitle>
                                        <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60 text-left">
                                          {tApp("dialog.description")}
                                        </SheetDescription>
                                      </div>
                                    </div>
                                  </SheetHeader>

                                  <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                                    <Textarea
                                      value={feedback}
                                      onChange={(event) =>
                                        setFeedback(event.target.value)
                                      }
                                      className="min-h-[220px] max-h-[46svh] resize-none overflow-y-auto rounded-3xl border-border/40 bg-muted/10 p-6 text-base leading-relaxed"
                                      placeholder={tApp("dialog.placeholder")}
                                    />
                                  </div>

                                  <SheetFooter className="bg-background/80 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                                    <SheetClose asChild>
                                      <Button
                                        variant="ghost"
                                        className="font-mono text-[10px] font-black uppercase tracking-[0.3em]"
                                      >
                                        {tApp("actions.cancel")}
                                      </Button>
                                    </SheetClose>
                                    <Button
                                      onClick={() => handleReject(update.id)}
                                      disabled={
                                        isRejecting === update.id ||
                                        feedback.trim().length < 10
                                      }
                                      className="h-12 rounded-full bg-foreground px-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background"
                                    >
                                      {isRejecting === update.id ? (
                                        <CircleNotch className="mr-2 size-4 animate-spin" />
                                      ) : null}
                                      {tApp("actions.send_feedback")}
                                    </Button>
                                  </SheetFooter>
                                </SheetContent>
                              </Sheet>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {isApproved && (
                        <Sheet
                          open={scopeDialogUpdateId === update.id}
                          onOpenChange={(open) => {
                            setScopeDialogUpdateId(open ? update.id : null)
                            if (!open) setScopeReason("")
                          }}
                        >
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-11 rounded-full border-transparent bg-background px-6 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-foreground/82 shadow-none hover:bg-background"
                            >
                              <NotePencil className="mr-2 size-4" />
                              Solicitar novo escopo
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="w-[94vw] border-l border-border/30 bg-background/95 p-0 sm:min-w-[38rem] sm:max-w-[40vw]"
                          >
                            <SheetHeader className="border-b border-border/20 bg-gradient-to-b from-brand-primary/6 to-transparent px-7 py-7 text-left">
                              <SheetTitle className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                                Formalizar novo escopo
                              </SheetTitle>
                              <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60 text-left">
                                Use este fluxo quando a etapa ja foi aprovada,
                                mas voce precisa solicitar mudancas que
                                extrapolam o combinado original.
                              </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                              <Textarea
                                value={scopeReason}
                                onChange={(event) =>
                                  setScopeReason(event.target.value)
                                }
                                className="min-h-[220px] max-h-[46svh] resize-none overflow-y-auto rounded-3xl border-border/40 bg-muted/10 p-6 text-base leading-relaxed"
                                placeholder="Descreva o que mudou, por que isso sai do escopo aprovado e o que voce espera que seja reavaliado."
                              />
                            </div>

                            <SheetFooter className="border-t border-border/20 bg-background/80 px-6 py-5 sm:px-8">
                              <SheetClose asChild>
                                <Button
                                  variant="ghost"
                                  className="rounded-full font-mono text-[10px] font-black uppercase tracking-[0.24em]"
                                >
                                  Cancelar
                                </Button>
                              </SheetClose>
                              <Button
                                onClick={() => handleScopeChange(update.id)}
                                disabled={isRequestingScope === update.id}
                                className="rounded-full bg-foreground font-mono text-[10px] font-black uppercase tracking-[0.24em] text-background"
                              >
                                {isRequestingScope === update.id ? (
                                  <CircleNotch className="mr-2 size-4 animate-spin" />
                                ) : (
                                  <NotePencil className="mr-2 size-4" />
                                )}
                                Formalizar pedido
                              </Button>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      )}

                      <div className="flex items-end justify-end gap-4 pt-1">
                        {isApproved && update.approvedAt && (
                          <span className="text-right text-[10px] font-medium leading-tight text-muted-foreground/52">
                            {t("timeline.approved_on")}{" "}
                            {dateFormatter.format(new Date(update.approvedAt))}
                          </span>
                        )}

                        <span className="text-right text-[10px] font-medium leading-tight text-muted-foreground/46">
                          {t("timeline.posted_at")}{" "}
                          {formatLocalTime(
                            new Date(update.createdAt),
                            update.timezone
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>

            {(hasMoreUpdates || visibleUpdatesCount > 5) && (
              <motion.div
                className="flex justify-center gap-4 pt-2"
                variants={sectionVariants}
              >
                {hasMoreUpdates && (
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setVisibleUpdatesCount((current) => current + 5)
                      }
                      className="h-11 rounded-full border-border/30 bg-background/60 px-6 font-mono text-[10px] font-black uppercase tracking-[0.26em] transition-all hover:bg-background"
                    >
                      <CaretDown className="mr-2 size-4" />
                      {t("timeline.see_more")}
                    </Button>
                  </motion.div>
                )}

                {visibleUpdatesCount > 5 && (
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVisibleUpdatesCount(5)}
                      className="h-11 rounded-full border-border/30 bg-background/60 px-6 font-mono text-[10px] font-black uppercase tracking-[0.26em] transition-all hover:bg-background"
                    >
                      <CaretUp className="mr-2 size-4" />
                      {t("timeline.see_less")}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.section>

          <motion.div variants={sectionVariants}>
            <VersionsLog versions={project.versions || []} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <ActionItemsWidget items={project.actionItems || []} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <BriefingNotes
              projectId={project.id}
              notes={project.briefingNotes || []}
            />
          </motion.div>
        </div>

        <motion.aside
          className="space-y-8 self-start lg:sticky lg:top-36"
          variants={sectionVariants}
        >
          <motion.section
            whileHover={{ y: -2 }}
            className="rounded-4xl bg-background/60 p-7 ring-1 ring-black/5 backdrop-blur-3xl dark:ring-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-brand-primary">
                  {t("status.title")}
                </p>
                <h3 className="mt-4 font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                  {tStatus(project.status as ProjectStatus)}
                </h3>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-muted-foreground/75">
                  {pendingApprovalCount > 0
                    ? t("status.pending_validations", {
                        count: pendingApprovalCount,
                      })
                    : t("status.no_pending_validations")}
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                <span className="text-xs font-black uppercase tracking-tighter">
                  {project.progress}%
                </span>
              </div>
            </div>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-muted/40 p-0.5">
              <motion.div
                className="h-full rounded-full bg-brand-primary shadow-[0_0_12px_rgba(var(--brand-primary-rgb),0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, ease: "circOut", delay: 0.35 }}
              />
            </div>

            <div className="mt-8 space-y-3">
              <div className="group rounded-2xl bg-muted/20 px-4 py-4 ring-1 ring-black/5 transition-all duration-300 hover:bg-muted/30 dark:ring-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/45">
                  {t("status.current_phase")}
                </p>
                <p className="mt-2 text-[11px] font-black uppercase leading-tight tracking-[0.1em] text-foreground/90">
                  {tStatus(project.status as ProjectStatus)}
                </p>
              </div>

              <div className="group rounded-2xl bg-muted/20 px-4 py-4 ring-1 ring-black/5 transition-all duration-300 hover:bg-muted/30 dark:ring-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/45">
                  {t("status.next_phase")}
                </p>
                <p className="mt-2 text-[11px] font-black uppercase leading-tight tracking-[0.1em] text-foreground/90">
                  {nextStatus
                    ? tStatus(nextStatus as ProjectStatus)
                    : t("status.completed_phase")}
                </p>
              </div>

              <div className="group rounded-2xl bg-muted/20 px-4 py-4 ring-1 ring-black/5 transition-all duration-300 hover:bg-muted/30 dark:ring-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/45">
                  Prazo contratado
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase leading-tight tracking-[0.1em] text-foreground/90">
                    {getExecutionDaysLabel(schedule.executionBusinessDays)}
                  </p>
                  {visibleDelayReasons.length > 0 ? (
                    <ProjectScheduleDelayTooltip
                      reasons={visibleDelayReasons}
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-[10px] font-semibold leading-tight text-muted-foreground/65">
                  {schedule.currentForecastDate
                    ? `Previsão ${dateFormatter.format(
                        new Date(schedule.currentForecastDate)
                      )}`
                    : "Contagem liberada após briefing e ativos validados."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {project.liveUrl && (
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-foreground p-4 transition-all"
                >
                  <Globe
                    weight="bold"
                    className="size-5 text-background transition-transform duration-200 group-hover:rotate-12"
                  />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-background">
                    {t("live")}
                  </span>
                </motion.a>
              )}

              {project.repositoryUrl && (
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/40 p-4 transition-all hover:bg-muted/60"
                >
                  <GithubLogo
                    weight="bold"
                    className="size-5 text-foreground transition-transform duration-200 group-hover:rotate-12"
                  />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">
                    Code
                  </span>
                </motion.a>
              )}
            </div>
          </motion.section>

          <motion.section
            whileHover={{ y: -2 }}
            className="rounded-4xl bg-background/60 p-7 ring-1 ring-black/5 backdrop-blur-3xl dark:ring-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">
                {t("assets_engine")}
              </h3>
              <CloudArrowUp
                weight="bold"
                className="size-4 text-brand-primary/40"
              />
            </div>

            {project.assets.filter((a) => a.visibility === "CLIENT").length ===
            0 ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/10 px-6 py-10">
                <FileText
                  weight="thin"
                  className="size-10 text-muted-foreground/15"
                />
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/25">
                  {t("waiting_files")}
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-3">
                {project.assets
                  .filter((a) => a.visibility === "CLIENT")
                  .map((asset, index) => (
                    <motion.a
                      key={asset.id}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.35 }}
                      whileHover={{ x: 4 }}
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-muted/20 p-4 transition-all hover:bg-muted/40"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm transition-all duration-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                        <FileText weight="fill" className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[10px] font-black uppercase tracking-tight text-foreground/85">
                          {asset.name}
                        </span>
                        <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          {t("view_document")}
                        </span>
                      </div>
                    </motion.a>
                  ))}
              </div>
            )}
          </motion.section>
        </motion.aside>
      </div>
    </motion.div>
  )
}
