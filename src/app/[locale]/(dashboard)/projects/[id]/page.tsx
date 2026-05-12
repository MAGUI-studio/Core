import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"
import {
  CheckCircle as CheckCircleIcon,
  ClockCountdown as ClockCountdownIcon,
  CurrencyCircleDollar as CurrencyCircleDollarIcon,
  Files as FilesIcon,
  NotePencil as NotePencilIcon,
  ShieldCheck as ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr"

import { ClientActionBanner } from "@/src/components/client/ClientActionBanner"
import { ClientFeatureLink } from "@/src/components/client/ClientFeatureLink"
import { ClientLandingHero } from "@/src/components/client/ClientLandingHero"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { ProjectDelayImpact } from "@/src/components/client/ProjectDelayImpact"
import { ProjectFinancialSummary } from "@/src/components/client/ProjectFinancialSummary"
import { ProjectPerformanceHealth } from "@/src/components/client/ProjectPerformanceHealth"
import { ProjectStatusRoadmap } from "@/src/components/client/ProjectStatusRoadmap"
import { ProjectScheduleDelayTooltip } from "@/src/components/common/ProjectScheduleDelayTooltip"

import { getClientProjectOverview } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import {
  addBusinessDays,
  buildProjectScheduleView,
  getExecutionDaysLabel,
  normalizeProjectScheduleData,
} from "@/src/lib/project-schedule"
import { toHref } from "@/src/lib/utils/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectOverview(id, user.id)

  if (!project) {
    return notFound()
  }

  const tStatus = await getTranslations("Dashboard.status")
  const tDetail = await getTranslations("Dashboard.project_detail")
  const statusLabel = tStatus(project.status)
  const schedule = buildProjectScheduleView(project.scheduleData, project.status)
  const scheduleData = normalizeProjectScheduleData(project.scheduleData)

  const statusTranslations = {
    STRATEGY: tStatus("STRATEGY"),
    ARCHITECTURE: tStatus("ARCHITECTURE"),
    DESIGN: tStatus("DESIGN"),
    ENGINEERING: tStatus("ENGINEERING"),
    QA: tStatus("QA"),
    LAUNCHED: tStatus("LAUNCHED"),
  }

  const initialForecastDate =
    scheduleData.executionStartAt && scheduleData.executionBusinessDays
      ? addBusinessDays(
          new Date(scheduleData.executionStartAt),
          scheduleData.executionBusinessDays
        )
      : null

  const visibleDelayReasons = schedule.delayReasons.filter(
    (reason) => reason.businessDaysAdded > 0
  )
  const pendingApprovals = project.updates
  const clientTasks = project.actionItems ?? []
  const hasPendingPayment = project._count.invoices > 0

  const primaryHref = hasPendingPayment
    ? toHref(`/projects/${project.id}/financial`)
    : pendingApprovals[0] !== undefined
      ? toHref(`/projects/${project.id}/approvals`)
      : clientTasks[0] !== undefined
        ? toHref(`/projects/${project.id}/tasks`)
        : toHref(`/projects/${project.id}/timeline`)

  const latestVersion = project.versions[0]

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      <ClientLandingHero
        eyebrow={tDetail("eyebrow")}
        title={project.name}
        description={project.description ?? tDetail("description_fallback")}
        statusLabel={statusLabel}
        variant="project"
        primaryAction={{
          label: hasPendingPayment
            ? tDetail("primary_action.payment")
            : pendingApprovals.length > 0
              ? tDetail("primary_action.approval")
              : clientTasks.length > 0
                ? tDetail("primary_action.task")
                : tDetail("primary_action.history"),
          href: primaryHref,
        }}
        secondaryAction={{
          label: tDetail("secondary_action.files"),
          href: toHref(`/projects/${project.id}/files`),
        }}
        metrics={[
          {
            label: tDetail("metrics.progress"),
            value: `${project.progress}%`,
            detail: tDetail("metrics.progress_detail"),
          },
          {
            label: tDetail("metrics.validate"),
            value: String(pendingApprovals.length),
            detail: tDetail("metrics.validate_detail"),
          },
          {
            label: "Prazo contratado",
            value: (
              <span className="inline-flex items-center gap-2">
                <span>{getExecutionDaysLabel(schedule.executionBusinessDays)}</span>
                {visibleDelayReasons.length > 0 ? (
                  <ProjectScheduleDelayTooltip reasons={visibleDelayReasons} />
                ) : null}
              </span>
            ),
            detail: schedule.currentForecastDate
              ? `Previsão atual: ${new Date(
                  schedule.currentForecastDate
                ).toLocaleDateString()}`
              : "Contagem liberada após briefing e ativos validados.",
          },
        ]}
      />

      <div className="mx-auto w-full">
        <ProjectStatusRoadmap
          currentStatus={
            project.status === "ON_HOLD_CLIENT" || project.status === "ABANDONED"
              ? scheduleData.operationalStatus
              : project.status
          }
          translations={statusTranslations}
        />
      </div>

      <div className="flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-10">
          <ProjectDelayImpact
            initialForecastDate={initialForecastDate}
            currentForecastDate={schedule.currentForecastDate}
            clientDelayBusinessDays={schedule.clientDelayBusinessDays}
            delayMultiplier={schedule.delayMultiplier}
          />

          <div className="flex flex-col gap-5">
            <ProjectFinancialSummary invoices={project.invoices} />

            {latestVersion && (
              <ProjectPerformanceHealth
                scores={{
                  performance: latestVersion.scorePerformance,
                  accessibility: latestVersion.scoreAccessibility,
                  bestPractices: latestVersion.scoreBestPractices,
                  seo: latestVersion.scoreSEO,
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {schedule.executionState === "ABANDONED" && (
            <ClientActionBanner
              type="task"
              eyebrow="Projeto abandonado"
              title="Prazo contratual encerrado por abandono"
              description="O projeto ultrapassou 30 dias corridos sem retorno suficiente no CRM. Entre em contato com a MAGUI.studio para revisar uma retomada formal."
              href={toHref(`/projects/${project.id}/briefing`)}
              label="Revisar pendências"
              projectName={project.name}
            />
          )}

          {schedule.executionState === "ON_HOLD_CLIENT" && (
            <ClientActionBanner
              type="task"
              eyebrow="Projeto suspenso"
              title="Cronograma aguardando seu retorno"
              description="O projeto entrou em espera por inatividade contratual. Envie o briefing, os ativos ou o feedback pendente pelo CRM para reativar a contagem."
              href={toHref(`/projects/${project.id}/briefing`)}
              label="Retomar pelo CRM"
              projectName={project.name}
            />
          )}

          {hasPendingPayment && (
            <ClientActionBanner
              type="task"
              eyebrow={tDetail("banner.payment.eyebrow")}
              title={tDetail("banner.payment.title")}
              description={tDetail("banner.payment.description")}
              href={toHref(`/projects/${project.id}/financial`)}
              label={tDetail("banner.payment.label")}
              projectName={project.name}
            />
          )}

          {!hasPendingPayment &&
            (pendingApprovals.length > 0 || clientTasks.length > 0) && (
              <ClientActionBanner
                type={pendingApprovals.length > 0 ? "approval" : "task"}
                eyebrow={tDetail("banner.attention.eyebrow")}
                title={pendingApprovals[0]?.title ?? clientTasks[0]?.title ?? ""}
                description={
                  pendingApprovals.length > 0
                    ? tDetail("banner.attention.description_approval")
                    : tDetail("banner.attention.description_task")
                }
                href={primaryHref}
                label={
                  pendingApprovals.length > 0
                    ? tDetail("banner.attention.label_approval")
                    : tDetail("banner.attention.label_task")
                }
                projectName={project.name}
              />
            )}
        </div>

        <section className="grid gap-8">
          <ClientSectionHeader
            eyebrow={tDetail("explore.eyebrow")}
            title={tDetail("explore.title")}
            description={tDetail("explore.description")}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ClientFeatureLink
              title={tDetail("explore.approvals.title")}
              description={tDetail("explore.approvals.description")}
              href={toHref(`/projects/${project.id}/approvals`)}
              icon={CheckCircleIcon}
              meta={tDetail("explore.approvals.meta", {
                count: pendingApprovals.length,
              })}
            />
            <ClientFeatureLink
              title={tDetail("explore.files.title")}
              description={tDetail("explore.files.description")}
              href={toHref(`/projects/${project.id}/files`)}
              icon={FilesIcon}
              meta={tDetail("explore.files.meta", {
                count: project._count.assets,
              })}
            />
            <ClientFeatureLink
              title={tDetail("explore.timeline.title")}
              description={tDetail("explore.timeline.description")}
              href={toHref(`/projects/${project.id}/timeline`)}
              icon={ClockCountdownIcon}
              meta={tDetail("explore.timeline.meta", {
                count: project._count.updates,
              })}
            />
            <ClientFeatureLink
              title={tDetail("explore.briefing.title")}
              description={tDetail("explore.briefing.description")}
              href={toHref(`/projects/${project.id}/briefing`)}
              icon={NotePencilIcon}
              meta={tDetail("explore.briefing.meta")}
            />
            <ClientFeatureLink
              title={tDetail("explore.financial.title")}
              description={tDetail("explore.financial.description")}
              href={toHref(`/projects/${project.id}/financial`)}
              icon={CurrencyCircleDollarIcon}
              meta={tDetail("explore.financial.meta")}
            />
            <ClientFeatureLink
              title={tDetail("explore.tasks.title")}
              description={tDetail("explore.tasks.description")}
              href={toHref(`/projects/${project.id}/tasks`)}
              icon={ShieldCheckIcon}
              meta={tDetail("explore.tasks.meta", {
                count: project._count.actionItems,
              })}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
