"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardProject } from "@/src/types/dashboard"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { Button } from "../ui/button"

interface ClientPendingInboxProps {
  project: DashboardProject
}

export function ClientPendingInbox({
  project,
}: ClientPendingInboxProps): React.JSX.Element {
  const t = useTranslations("Dashboard.inbox")

  const pendingApprovals = React.useMemo(
    () =>
      project.updates.filter(
        (u) => u.requiresApproval && u.approvalStatus === "PENDING"
      ),
    [project.updates]
  )

  const pendingActions = React.useMemo(
    () =>
      project.actionItems?.filter(
        (a) => a.status === "PENDING" && a.targetRole === "CLIENT"
      ) || [],
    [project.actionItems]
  )

  const hasItems = pendingApprovals.length > 0 || pendingActions.length > 0

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-4xl border border-dashed border-border/30 bg-muted/5 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <CheckCircle weight="fill" className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-lg font-black uppercase tracking-tight text-foreground/80">
            {t("empty")}
          </p>
          <p className="text-sm font-medium text-muted-foreground/60">
            Tudo sob controle no momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-2xl font-black uppercase tracking-tight">
          {t("title")}
        </h3>
        <p className="text-sm font-medium text-muted-foreground/60">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingApprovals.map((update) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col justify-between rounded-[1.8rem] border border-amber-500/20 bg-amber-500/[0.03] p-6 transition-all hover:bg-amber-500/[0.06]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <WarningCircle weight="fill" className="size-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/60">
                  {t("pending_approvals")}
                </span>
              </div>
              <div>
                <h4 className="line-clamp-1 font-heading text-lg font-black uppercase tracking-tight">
                  {update.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground/80">
                  {update.description || "Nova entrega aguardando sua revisao."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full rounded-full border-amber-500/20 bg-background/50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-background"
              onClick={() => {
                const element = document.getElementById(
                  `project-timeline-${project.id}`
                )
                element?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {t("cta_approve")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        ))}

        {pendingActions.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col justify-between rounded-[1.8rem] border border-brand-primary/20 bg-brand-primary/[0.03] p-6 transition-all hover:bg-brand-primary/[0.06]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Clock weight="fill" className="size-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary/60">
                  {t("required_documents")}
                </span>
              </div>
              <div>
                <h4 className="line-clamp-1 font-heading text-lg font-black uppercase tracking-tight">
                  {action.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground/80">
                  {action.description ||
                    "Acao pendente necessaria para o projeto."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full rounded-full border-brand-primary/20 bg-background/50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-background"
            >
              {t("cta_view")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
