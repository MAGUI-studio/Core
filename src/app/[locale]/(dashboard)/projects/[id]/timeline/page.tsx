import * as React from "react"

import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import {
  Milestone,
  ProjectMilestoneCalendar,
} from "@/src/components/client/ProjectMilestoneCalendar"
import { ClientTimeline } from "@/src/components/client/ClientTimeline"

import {
  getClientProjectCalendarData,
  getClientProjectTimeline,
} from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { buildProjectScheduleView } from "@/src/lib/project-schedule"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.project_detail.pages.timeline")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/projects",
  })
}

export default async function TimelinePage({
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

  const [project, calendarData] = await Promise.all([
    getClientProjectTimeline(id, user.id),
    getClientProjectCalendarData(id, user.id),
  ])

  if (!project || !calendarData) return notFound()

  const schedule = buildProjectScheduleView(
    calendarData.scheduleData,
    calendarData.status
  )

  const milestones: Milestone[] = [
    ...calendarData.updates.map(
      (u) =>
        ({
          date: new Date(u.createdAt),
          title: u.title,
          type: u.isMilestone ? "milestone" : "update",
        }) satisfies Milestone
    ),
    ...calendarData.actionItems.map(
      (a) =>
        ({
          date: a.dueDate ? new Date(a.dueDate) : new Date(),
          title: a.title,
          type: "deadline",
        }) satisfies Milestone
    ),
  ]

  if (schedule.currentForecastDate) {
    milestones.push({
      date: new Date(schedule.currentForecastDate),
      title: "Lançamento do Projeto",
      type: "forecast",
    })
  }

  const t = await getTranslations("Dashboard.project_detail.pages.timeline")

  return (
    <div className="flex w-full flex-col gap-10">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
      />

      <ProjectMilestoneCalendar milestones={milestones} />

      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">
          Histórico Detalhado
        </h3>
        <ClientTimeline updates={project.updates} />
      </div>
    </div>
  )
}
