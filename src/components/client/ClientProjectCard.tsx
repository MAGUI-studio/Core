import * as React from "react"

import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { ClientProjectSummary } from "@/src/types/client-portal"
import {
  ArrowUpRightIcon,
  Calendar,
  CheckCircle,
  FolderOpen,
} from "@phosphor-icons/react/dist/ssr"

import { Progress } from "@/src/components/ui/progress"

import { ProjectScheduleDelayTooltip } from "@/src/components/common/ProjectScheduleDelayTooltip"

import {
  buildProjectScheduleView,
  getExecutionDaysLabel,
} from "@/src/lib/project-schedule"

interface ClientProjectCardProps {
  project: ClientProjectSummary
}

export async function ClientProjectCard({
  project,
}: ClientProjectCardProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home.project")
  const tStatus = await getTranslations("Dashboard.status")
  const locale = await getLocale()
  const statusLabel = tStatus(project.status)
  const schedule = buildProjectScheduleView(
    project.scheduleData,
    project.status
  )
  const visibleDelayReasons = schedule.delayReasons.filter(
    (reason) => reason.businessDaysAdded > 0
  )

  return (
    <Link
      href={{
        pathname: "/projects/[id]",
        params: { id: project.id },
      }}
    >
      <article className="group overflow-hidden rounded-[1.75rem] border border-border/20 bg-background/95 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-primary/20 lg:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                  <FolderOpen
                    weight="duotone"
                    className="size-4 text-brand-primary"
                  />
                  {t("active_project")}
                </span>
                <span className="rounded-full bg-brand-primary/8 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-primary">
                  {statusLabel}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="truncate pr-2 font-heading text-2xl font-black uppercase tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2rem]">
                  {project.name}
                </h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/72">
                  {t("active_project_focus_description")}
                </p>
              </div>
            </div>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/10 text-foreground/35 transition group-hover:bg-brand-primary group-hover:text-white">
              <ArrowUpRightIcon weight="bold" className="size-5" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
            <div className="grid gap-4">
              <div className="rounded-[1.35rem] bg-muted/6 p-4">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div className="flex items-end gap-3">
                    <span className="font-heading text-4xl font-black leading-none text-foreground">
                      {project.progress}%
                    </span>
                    <span className="pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                      {t("progress")}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/55">
                    {statusLabel}
                  </span>
                </div>
                <Progress value={project.progress} className="h-2 w-full" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-muted/6 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                    {t("phase")}
                  </p>
                  <p className="mt-1 text-sm font-black uppercase tracking-tight text-foreground">
                    {statusLabel}
                  </p>
                </div>

                <div className="rounded-[1.25rem] bg-muted/6 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                    Prazo contratual
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar
                      weight="duotone"
                      className="size-4 text-muted-foreground/45"
                    />
                    <p className="text-sm font-black uppercase tracking-tight text-foreground">
                      {getExecutionDaysLabel(schedule.executionBusinessDays)}
                    </p>
                    {visibleDelayReasons.length > 0 ? (
                      <ProjectScheduleDelayTooltip
                        reasons={visibleDelayReasons}
                      />
                    ) : null}
                  </div>
                  {schedule.currentForecastDate ? (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/55">
                      Previsao:{" "}
                      {new Date(
                        schedule.currentForecastDate
                      ).toLocaleDateString(locale)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {project.lastUpdate ? (
                <div className="rounded-[1.25rem] bg-muted/6 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      weight="duotone"
                      className="mt-0.5 size-5 shrink-0 text-brand-primary"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {t("last_update")}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-foreground/84">
                        {project.lastUpdate.title}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
