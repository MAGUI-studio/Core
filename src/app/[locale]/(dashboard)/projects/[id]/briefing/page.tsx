import * as React from "react"

import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { auth } from "@clerk/nextjs/server"
import { NotePencil } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ClientBriefingComplement } from "@/src/components/client/ClientBriefingComplement"
import { ClientBriefingView } from "@/src/components/client/ClientBriefingView"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"
import { BriefingForm } from "@/src/components/common/BriefingForm"

import { getClientProjectBriefing } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { toHref } from "@/src/lib/utils/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.project_detail.pages.briefing")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/projects",
  })
}

export default async function BriefingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { mode } = await searchParams
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectBriefing(id, user.id)

  if (!project) return notFound()

  const briefingData = project.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6
  const isEditing = mode === "edit" || isBriefingEmpty

  const t = await getTranslations("Dashboard.project_detail.pages.briefing")
  const tDetail = await getTranslations("Dashboard.project_detail")

  return (
    <div className="flex w-full flex-col gap-8">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
        action={
          !isEditing ? (
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              <Link href={toHref(`/projects/${id}/briefing?mode=edit`)}>
                <NotePencil className="mr-2 size-4" weight="duotone" />
                {tDetail("briefing_complement.edit")}
              </Link>
            </Button>
          ) : null
        }
      />

      {isEditing ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BriefingForm projectId={project.id} initialData={briefingData} />
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="flex flex-col gap-5">
            <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
              {tDetail("briefing_complement.structure_title")}
            </h2>
            <ClientBriefingView briefing={briefingData} />
          </div>

          <ClientBriefingComplement
            projectId={project.id}
            notes={project.briefingNotes}
          />
        </div>
      )}
    </div>
  )
}
