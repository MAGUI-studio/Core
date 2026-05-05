import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientApprovalHistory } from "@/src/components/client/ClientApprovalHistory"
import { ClientApprovalList } from "@/src/components/client/ClientApprovalList"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectApprovals } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata() {
  const t = await getTranslations("Dashboard.project_detail.pages.approvals")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/projects",
  })
}

export default async function ApprovalsPage({
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

  const project = await getClientProjectApprovals(id, user.id)

  if (!project) return notFound()

  const t = await getTranslations("Dashboard.project_detail.pages.approvals")

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid gap-10">
        <ClientApprovalList updates={project.updates} projectId={id} />
        <ClientApprovalHistory updates={project.updates} />
      </div>
    </div>
  )
}
