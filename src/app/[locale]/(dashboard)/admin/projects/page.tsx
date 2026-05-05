import * as React from "react"

import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { FolderPlus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ProjectsTable } from "@/src/components/admin/ProjectsTable"

import { getAdminProjectRows } from "@/src/lib/admin-data"
import { isAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Projetos admin",
  description:
    "Gestao administrativa de projetos, clientes e status operacionais da MAGUI.studio.",
  path: "/admin/projects",
})

interface ProjectsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { page } = await searchParams
  const currentPage = Number(page) || 1

  const t = await getTranslations("Admin.projects")

  const { projects, totalPages } = await getAdminProjectRows(currentPage, 30)

  const serializableProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progress,
    client: {
      id: p.client.clerkId,
      name: p.client.name,
      email: p.client.email,
    },
    createdAt: new Date(p.createdAt).toISOString(),
  }))

  return (
    <main className="relative flex flex-col gap-10 bg-background/50 p-6 lg:p-12 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            {t("description")}
          </p>
        </div>

        <Button
          asChild
          className="group relative h-14 overflow-hidden rounded-full px-10 font-sans font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/20"
        >
          <Link
            href="/admin/projects/register"
            className="flex items-center gap-3"
          >
            <FolderPlus
              weight="duotone"
              className="size-5 transition-transform group-hover:rotate-12"
            />
            <span>{t("create")}</span>
          </Link>
        </Button>
      </div>

      <ProjectsTable initialProjects={serializableProjects} />
    </main>
  )
}
