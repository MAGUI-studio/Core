import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { DashboardProject } from "@/src/types/dashboard"

import { ProjectDetailsHeader } from "@/src/components/admin/ProjectDetailsHeader"
import { ProjectTabs } from "@/src/components/admin/ProjectTabs"

import { getAdminClientOptions } from "@/src/lib/client-data"
import { getProjectInvoices } from "@/src/lib/financial-data"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getAdminProjectAssets,
  getAdminProjectOverview,
  getAdminProjectTimeline,
} from "@/src/lib/project-data"
import { dashboardMetadata } from "@/src/lib/seo"

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

type AdminProjectOverview = NonNullable<
  Awaited<ReturnType<typeof getAdminProjectOverview>>
>
type AdminProjectTimeline = Awaited<ReturnType<typeof getAdminProjectTimeline>>
type AdminProjectAssets = Awaited<ReturnType<typeof getAdminProjectAssets>>

function toDashboardProject(input: {
  project: AdminProjectOverview
  timeline: AdminProjectTimeline
  assets: AdminProjectAssets
}): DashboardProject {
  const { project, timeline, assets } = input

  return {
    ...project,
    client: {
      ...project.client,
      companyName: project.client.companyName ?? null,
      phone: null,
      position: null,
      taxId: null,
    },
    briefing:
      (project.briefing as DashboardProject["briefing"] | null | undefined) ??
      null,
    updates: (timeline?.updates || []).map((update) => ({
      ...update,
      project: { name: project.name },
    })),
    members: (project.members || []).map((member) => ({
      ...member,
      user: {
        ...member.user,
        companyName: null,
      },
    })),
    assets: assets?.assets ?? [],
    auditLogs: [],
  }
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project ? `Projeto admin: ${project.name}` : "Projeto admin",
    description:
      "Detalhes administrativos, membros, atividades e atualizacoes do projeto.",
    path: `/admin/projects/${id}`,
  })
}

export default async function AdminProjectDetailPage({
  params,
}: ProjectPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params

  const project = await getAdminProjectOverview(id)

  if (!project) {
    notFound()
  }

  const [timeline, assets, clients, invoices] = await Promise.all([
    getAdminProjectTimeline(id),
    getAdminProjectAssets(id),
    getAdminClientOptions(),
    getProjectInvoices(id),
  ])

  const dashboardProject = toDashboardProject({
    project,
    timeline,
    assets,
  })

  const projectHeader = {
    id: project.id,
    name: project.name,
    budget: project.budget,
    hasInternationalization: project.hasInternationalization,
    internationalizationFee: project.internationalizationFee,
    deadline: project.deadline,
    client: {
      id: project.client.id,
      name: project.client.name,
      email: project.client.email,
    },
  }

  return (
    <main className="relative flex flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute right-0 top-0 -z-10 size-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 opacity-50 blur-3xl" />

      <ProjectDetailsHeader project={projectHeader} />

      <ProjectTabs
        project={dashboardProject}
        projectId={id}
        clients={clients}
        invoices={invoices}
      />
    </main>
  )
}
