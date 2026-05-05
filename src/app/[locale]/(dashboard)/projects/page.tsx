import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { auth } from "@clerk/nextjs/server"
import { FolderOpen } from "@phosphor-icons/react/dist/ssr"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { getClientProjects } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Meus projetos",
  description:
    "Lista autenticada de projetos, status e proximas acoes do cliente MAGUI.studio.",
  path: "/projects",
})

export default async function ProjectsPage(): Promise<React.JSX.Element> {
  const { userId } = await auth()
  const tStatus = await getTranslations("Dashboard.status")

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const projects = await getClientProjects(user.id)

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="flex w-full flex-col gap-10">
        <header className="flex flex-col justify-between gap-6 border-b border-border/20 pb-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
              <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                Portal
              </p>
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
              Meus Projetos
            </h1>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              Nenhum projeto encontrado.
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={{
                  pathname: "/projects/[id]",
                  params: { id: project.id },
                }}
              >
                <Card className="rounded-[1.75rem] border-border/40 bg-muted/10 transition-colors hover:bg-muted/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                      {project.name}
                    </CardTitle>
                    <FolderOpen
                      className="size-5 text-brand-primary"
                      weight="duotone"
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
                      Fase: {tStatus(project.status)}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50">
                      Progresso: {project.progress}%
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
