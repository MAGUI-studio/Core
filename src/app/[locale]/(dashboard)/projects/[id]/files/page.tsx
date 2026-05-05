import * as React from "react"

import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientAssetLibrary } from "@/src/components/client/ClientAssetLibrary"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectFiles } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.project_detail.pages.files")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/projects",
  })
}

export default async function FilesPage({
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

  const project = await getClientProjectFiles(id, user.id)

  if (!project) return notFound()

  const t = await getTranslations("Dashboard.project_detail.pages.files")

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
      />

      <ClientAssetLibrary assets={project.assets} />
    </div>
  )
}
