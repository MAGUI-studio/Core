"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { ProjectStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowLeft,
  ArrowSquareOut,
  Calendar,
  CurrencyDollar,
  ProjectorScreen,
  UserCircle,
} from "@phosphor-icons/react"
import { ProjectScheduleDelayTooltip } from "@/src/components/common/ProjectScheduleDelayTooltip"
import { Button } from "@/src/components/ui/button"

import {
  buildProjectScheduleView,
  getExecutionDaysLabel,
} from "@/src/lib/project-schedule"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ProjectDetailsHeaderProps {
  project: {
    id: string
    name: string
    budget: number | null
    hasInternationalization?: boolean
    internationalizationFee?: number | null
    deadline: Date | null
    scheduleData?: unknown
    status: ProjectStatus
    client: {
      id: string
      name: string | null
      email: string
    }
  }
}

export function ProjectDetailsHeader({ project }: ProjectDetailsHeaderProps) {
  const t = useTranslations("Admin.projects.details")
  const router = useRouter()
  const schedule = buildProjectScheduleView(project.scheduleData, project.status)
  const visibleDelayReasons = schedule.delayReasons.filter(
    (reason) => reason.businessDaysAdded > 0
  )

  const budgetDisplay = project.budget
    ? formatCurrencyBRLFromCents(project.budget)
    : t("no_budget")

  return (
    <div className="flex flex-col gap-10">
      <Button
        variant="ghost"
        className="-ml-4 w-max gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 transition-all hover:bg-transparent hover:text-foreground"
        size="sm"
        onClick={() => router.back()}
      >
        <ArrowLeft weight="bold" className="size-3" />
        {t("back_button")}
      </Button>

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <ProjectorScreen weight="duotone" className="size-6" />
            </div>
            <div className="grid gap-2">
              <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                <span className="inline-flex items-center gap-2">
                  <UserCircle className="size-4 text-brand-primary/70" />
                  {project.client.name || project.client.email}
                </span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-[9px] font-black uppercase tracking-[0.18em] text-brand-primary hover:bg-brand-primary/8 hover:text-brand-primary"
                >
                  <Link
                    href={{
                      pathname: "/admin/clients/[id]",
                      params: { id: project.client.id },
                    }}
                  >
                    <ArrowSquareOut className="mr-2 size-3.5" />
                    {t("open_client")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 pl-1">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted/10">
                <CurrencyDollar
                  weight="duotone"
                  className="size-4 text-brand-primary"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {t("budget_label")}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {budgetDisplay}
                </span>
                {project.hasInternationalization && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary/70">
                    i18n{" "}
                    {project.internationalizationFee
                      ? `+ ${formatCurrencyBRLFromCents(project.internationalizationFee)}`
                      : "inclusa"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted/10">
                <Calendar
                  weight="duotone"
                  className="size-4 text-brand-primary"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Prazo contratado
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {getExecutionDaysLabel(schedule.executionBusinessDays)}
                  </span>
                  {schedule.currentForecastDate && (
                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-primary">
                      previsão{" "}
                      {new Date(schedule.currentForecastDate).toLocaleDateString()}
                    </span>
                  )}
                  {visibleDelayReasons.length > 0 ? (
                    <ProjectScheduleDelayTooltip reasons={visibleDelayReasons} />
                  ) : null}
                </div>
                {schedule.clientDelayBusinessDays > 0 ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                    +{schedule.clientDelayBusinessDays} dias úteis por atraso do cliente
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
