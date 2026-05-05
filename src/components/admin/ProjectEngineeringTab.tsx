"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardVersion } from "@/src/types/dashboard"

import { UpdateStatusForm } from "@/src/components/admin/UpdateStatusForm"
import { VersionComparisonPanel } from "@/src/components/admin/VersionComparisonPanel"

interface ProjectEngineeringTabProps {
  project: {
    id: string
    status: string
    progress: number
    versions?: DashboardVersion[]
  }
}

export function ProjectEngineeringTab({ project }: ProjectEngineeringTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:p-12">
        <div className="mb-10 flex flex-col gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("management_title")}
          </h3>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/40">
            Controle os parâmetros de execução e o status atual do protocolo de
            engenharia deste projeto.
          </p>
        </div>

        <UpdateStatusForm
          projectId={project.id}
          currentStatus={project.status}
          currentProgress={project.progress}
        />
      </section>

      <VersionComparisonPanel versions={project.versions || []} />
    </div>
  )
}
