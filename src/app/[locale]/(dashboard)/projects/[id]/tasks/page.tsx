import * as React from "react"

import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { ClientPortalActionItem } from "@/src/types/client-portal"
import { auth } from "@clerk/nextjs/server"

import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { ClientTaskList } from "@/src/components/client/ClientTaskList"

import { getClientProjectTasks } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.project_detail.pages.tasks")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/projects",
  })
}

export default async function TasksPage({
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

  const project = await getClientProjectTasks(id, user.id)

  if (!project) return notFound()

  const clientTasks = project.actionItems ?? []

  const t = await getTranslations("Dashboard.project_detail.pages.tasks")

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
      />

      <ClientTaskList
        tasks={clientTasks as unknown as ClientPortalActionItem[]}
      />
    </div>
  )
}
