import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { DashboardAsset } from "@/src/types/dashboard"
import { ArrowLeft, Files } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { AssetManagement } from "@/src/components/admin/AssetManagement"

import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { getAdminProjectAssets } from "@/src/lib/project-data"
import { dashboardMetadata } from "@/src/lib/seo"

interface AssetsPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: AssetsPageProps) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project
      ? `Arquivos admin: ${project.name}`
      : "Arquivos admin do projeto",
    description: "Gestao administrativa de arquivos e assets do projeto.",
    path: `/admin/projects/${id}/assets`,
  })
}

export default async function ProjectAssetsPage({
  params,
}: AssetsPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params
  const t = await getTranslations("Admin.projects.details")

  const project = await getAdminProjectAssets(id)

  if (!project) {
    notFound()
  }

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-6">
          <Button
            asChild
            variant="ghost"
            className="-ml-4 w-max gap-2 text-muted-foreground/60 hover:text-foreground"
            size="sm"
          >
            <Link
              href={{
                pathname: "/admin/projects/[id]",
                params: { id: project.id },
              }}
            >
              <ArrowLeft weight="bold" className="size-3" />
              {t("back_button")}
            </Link>
          </Button>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Files weight="duotone" className="size-6" />
              </div>
              <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground">
                {t("assets_title")}
              </h1>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              {project.name}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
        <AssetManagement
          projectId={project.id}
          assets={project.assets as DashboardAsset[]}
        />
      </div>
    </main>
  )
}
