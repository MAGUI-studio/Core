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

import { ProjectScheduleDelayTooltip } from "@/src/components/common/ProjectScheduleDelayTooltip"
import { Progress } from "@/src/components/ui/progress"
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
  const schedule = buildProjectScheduleView(project.scheduleData, project.status)
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
      <article className="group relative overflow-hidden rounded-4xl border border-border/25 bg-background p-5 shadow-2xl shadow-foreground/5 transition-all hover:-translate-y-1 lg:p-8">
        <div className="absolute right-6 top-6 flex size-11 items-center justify-center rounded-full bg-muted/20 text-foreground/45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-brand-primary group-hover:text-white">
          <ArrowUpRightIcon weight="bold" className="size-5" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="flex min-w-0 flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <FolderOpen
                weight="duotone"
                className="size-5 text-brand-primary"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/50">
                {t("active_project")}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="max-w-4xl font-heading text-4xl font-black uppercase leading-[0.9] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                {project.name}
              </h3>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/70 sm:text-base">
                {t("active_project_focus_description")}
              </p>
            </div>

            {project.lastUpdate && (
              <div className="flex items-start gap-3 rounded-2xl bg-muted/5 p-5 w-fit">
                <CheckCircle
                  weight="duotone"
                  className="mt-0.5 size-5 shrink-0 text-brand-primary"
                />
                <p className="text-sm font-medium leading-relaxed text-muted-foreground/75">
                  {t("last_update")}:{" "}
                  <span className="text-foreground">
                    {project.lastUpdate.title}
                  </span>
                </p>
              </div>
            )}

            {project._count.invoices > 0 && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-5 w-fit border border-amber-500/20">
                <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-widest text-amber-600">
                  Pagamento pendente
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-muted/5 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                {t("progress")}
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <span className="font-heading text-5xl font-black leading-none text-foreground">
                  {project.progress}%
                </span>
                <span className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary">
                  {statusLabel}
                </span>
              </div>
              <Progress value={project.progress} className="mt-5 h-2 w-full" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-2xl bg-muted/5 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
                  {t("phase")}
                </p>
                <p className="mt-2 font-heading text-lg font-black uppercase tracking-tight">
                  {statusLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/5 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
                  Prazo contratual
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Calendar
                    weight="duotone"
                    className="size-4 text-muted-foreground/45"
                  />
                  <p className="font-heading text-lg font-black uppercase tracking-tight">
                    {getExecutionDaysLabel(schedule.executionBusinessDays)}
                  </p>
                  {visibleDelayReasons.length > 0 ? (
                    <ProjectScheduleDelayTooltip reasons={visibleDelayReasons} />
                  ) : null}
                </div>
                {schedule.currentForecastDate ? (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/55">
                    Previsão:{" "}
                    {new Date(schedule.currentForecastDate).toLocaleDateString(
                      locale
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
