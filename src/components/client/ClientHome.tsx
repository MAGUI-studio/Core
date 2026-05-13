import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { ClientHomeData } from "@/src/types/client-portal"
import {
  ClockCountdown,
  Files,
  Lifebuoy,
  NotePencil,
  Receipt,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr"
import { differenceInCalendarDays, startOfDay } from "date-fns"

import { Button } from "@/src/components/ui/button"

import { buildProjectScheduleView } from "@/src/lib/project-schedule"
import { toHref } from "@/src/lib/utils/navigation"

import { ClientActionBanner } from "./ClientActionBanner"
import { ClientFeatureLink } from "./ClientFeatureLink"
import { ClientLandingHero } from "./ClientLandingHero"
import { ClientProjectCard } from "./ClientProjectCard"
import { ClientRecentActivityStrip } from "./ClientRecentActivityStrip"
import { ClientSectionHeader } from "./ClientSectionHeader"

interface ClientHomeProps {
  userName: string
  data: ClientHomeData
  isBriefingEmpty: boolean
}

export async function ClientHome({
  userName,
  data,
  isBriefingEmpty,
}: ClientHomeProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home")

  const activeProject = data.projects[0]
  const activeProjectSchedule = activeProject
    ? buildProjectScheduleView(activeProject.scheduleData, activeProject.status)
    : null

  // New logical states for payment
  const allInstallments =
    activeProject?.invoices.flatMap((inv) => inv.installments) || []
  const hasPaidAtLeastOne = allInstallments.some(
    (inst) => inst.status === "PAID"
  )
  const hasAnyDueSoon = allInstallments.some((inst) => {
    if (inst.status === "PAID") return false
    const diff = differenceInCalendarDays(
      startOfDay(new Date(inst.dueDate)),
      startOfDay(new Date())
    )
    return diff <= 5
  })

  const isBlockedByPayment = !hasPaidAtLeastOne
  const shouldShowPaymentWarning = !hasPaidAtLeastOne || hasAnyDueSoon

  let nextAction: React.ComponentProps<typeof ClientActionBanner> = {
    type: "default",
    eyebrow: t("cta.type.default"),
    title: t("cta.type.default"),
    description: t("cta.description.default"),
    href: toHref(activeProject ? `/projects/${activeProject.id}` : "/projects"),
    label: t("cta.label.default"),
  }

  if (activeProject && activeProjectSchedule?.executionState === "ABANDONED") {
    nextAction = {
      type: "task",
      eyebrow: "Projeto interrompido",
      title: "Projeto encerrado por abandono",
      description:
        "O prazo contratual foi ultrapassado sem retorno suficiente no CRM. Entre em contato para revisar a retomada ou formalizar um novo escopo.",
      href: toHref(`/projects/${activeProject.id}`),
      label: "Ver detalhes",
      projectName: activeProject.name,
    }
  } else if (
    activeProject &&
    activeProjectSchedule?.executionState === "ON_HOLD_CLIENT"
  ) {
    nextAction = {
      type: "task",
      eyebrow: "Projeto suspenso",
      title: "Projeto aguardando seu retorno",
      description:
        "O cronograma foi suspenso por inatividade contratual. Envie o briefing, ativos ou feedback pendente no CRM para reativar a contagem.",
      href: toHref(`/projects/${activeProject.id}/briefing`),
      label: "Retomar projeto",
      projectName: activeProject.name,
    }
  } else if (shouldShowPaymentWarning && activeProject) {
    nextAction = {
      type: "payment",
      eyebrow: t("cta.type.payment"),
      title: t("cta.type.payment"),
      description: t("cta.description.payment"),
      href: toHref(`/projects/${activeProject.id}/financial`),
      label: t("cta.label.payment"),
      projectName: activeProject.name,
    }
  } else if (isBriefingEmpty && activeProject) {
    nextAction = {
      type: "briefing",
      eyebrow: t("cta.type.briefing"),
      title: t("cta.type.briefing"),
      description: t("cta.description.briefing"),
      href: toHref(`/projects/${activeProject.id}/briefing`),
      label: t("cta.label.briefing"),
      projectName: activeProject.name,
    }
  } else if (data.pendingApprovals.length > 0) {
    const approval = data.pendingApprovals[0]
    nextAction = {
      type: "approval",
      eyebrow: t("cta.type.approval"),
      title: approval.title,
      description: t("cta.description.approval"),
      href: toHref(`/projects/${approval.projectId}/approvals`),
      label: t("cta.label.approval"),
      projectName: approval.project.name,
    }
  } else if (data.pendingTasks.length > 0) {
    const task = data.pendingTasks[0]
    nextAction = {
      type: "task",
      eyebrow: t("cta.type.task"),
      title: task.title,
      description: t("cta.description.task"),
      href: toHref(`/projects/${task.projectId}/tasks`),
      label: t("cta.label.task"),
      projectName: task.project.name,
    }
  }

  const heroStatus:
    | "payment_pending"
    | "on_track"
    | "awaiting_approval"
    | "need_shipment"
    | "briefing_incomplete"
    | "on_hold_client"
    | "abandoned" =
    activeProjectSchedule?.executionState === "ABANDONED"
      ? "abandoned"
      : activeProjectSchedule?.executionState === "ON_HOLD_CLIENT"
        ? "on_hold_client"
        : shouldShowPaymentWarning
          ? "payment_pending"
          : isBriefingEmpty
            ? "briefing_incomplete"
            : data.pendingApprovals.length > 0
              ? "awaiting_approval"
              : data.pendingTasks.length > 0
                ? "need_shipment"
                : "on_track"

  const heroStatusLabel = {
    payment_pending: t("status.payment_pending"),
    on_track: t("status.on_track"),
    awaiting_approval: t("status.awaiting_approval"),
    need_shipment: t("status.need_shipment"),
    briefing_incomplete: t("status.briefing_incomplete"),
    on_hold_client: "Projeto suspenso",
    abandoned: "Projeto abandonado",
  }[heroStatus]

  return (
    <div className="flex flex-col">
      <ClientLandingHero
        eyebrow={t("eyebrow")}
        title={t("welcome_user", { name: userName.split(" ")[0] || userName })}
        description={t("description")}
        statusLabel={heroStatusLabel}
        primaryAction={{
          label: nextAction.label,
          href: nextAction.href,
        }}
        secondaryAction={{
          label: t("nav.projects"),
          href: toHref("/projects"),
        }}
        metrics={[
          {
            label: t("nav.projects"),
            value: String(data.projects.length),
            detail: t("project.active_project"),
          },
          {
            label: t("cta.label.approval").split(" ")[0],
            value: String(data.pendingApprovals.length),
            detail: t("inbox.pending_approvals"),
          },
          {
            label: t("cta.label.task").split(" ")[0],
            value: String(data.pendingTasks.length),
            detail: t("inbox.pending_feedback"),
          },
        ]}
      />

      <section className="mx-auto flex w-full max-w-440 flex-col gap-10">
        <ClientActionBanner {...nextAction} />

        {activeProject && (
          <div className="flex flex-col gap-6">
            <ClientSectionHeader
              eyebrow={t("active_project_eyebrow")}
              title={t("active_project_title")}
              description={t("active_project_description")}
              action={
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full px-6 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Link
                    href={{
                      pathname: "/projects/[id]",
                      params: { id: activeProject.id },
                    }}
                  >
                    {t("view_project")}
                  </Link>
                </Button>
              }
            />
            <ClientProjectCard
              project={{
                id: activeProject.id,
                name: activeProject.name,
                status: activeProject.status,
                progress: activeProject.progress,
                scheduleData: activeProject.scheduleData,
                updatedAt: activeProject.updatedAt,
                lastUpdate: activeProject.updates?.[0],
                _count: activeProject._count,
              }}
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <ClientRecentActivityStrip activities={data.recentActivity} />

          <div className="flex flex-col gap-6">
            <ClientSectionHeader
              eyebrow={t("quick_links_eyebrow")}
              title={t("quick_links_title")}
              description={t("quick_links_description")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: t("links.financial"),
                  description:
                    "Cobrancas, parcelas, pagamentos e comprovantes.",
                  href: toHref("/financial"),
                  icon: Receipt,
                },
                {
                  label: t("links.files"),
                  description:
                    "Materiais finais, referencias e arquivos enviados.",
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/files`
                      : "/projects"
                  ),
                  icon: Files,
                },
                {
                  label: t("links.briefing"),
                  description: "Respostas e alinhamentos que guiam a entrega.",
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/briefing`
                      : "/projects"
                  ),
                  icon: NotePencil,
                },
                {
                  label: t("links.timeline"),
                  description: "Historico do que evoluiu no projeto.",
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/timeline`
                      : "/projects"
                  ),
                  icon: ShieldCheck,
                },
                {
                  label: t("links.tasks"),
                  description:
                    "Pendencias e informacoes que precisamos de voce.",
                  href: toHref(
                    activeProject
                      ? `/projects/${activeProject.id}/tasks`
                      : "/projects"
                  ),
                  icon: ClockCountdown,
                },
                {
                  label: "Suporte",
                  description:
                    "Abra tickets e acompanhe respostas da equipe em até 24h úteis.",
                  href: toHref("/support"),
                  icon: Lifebuoy,
                },
              ].map((link) => (
                <ClientFeatureLink
                  key={link.label}
                  title={link.label}
                  description={link.description}
                  href={link.href}
                  icon={link.icon}
                  isLocked={
                    isBlockedByPayment && link.label !== t("links.financial")
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
