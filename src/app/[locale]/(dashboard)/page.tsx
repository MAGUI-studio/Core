import * as React from "react"
import { Suspense } from "react"

import { getTranslations } from "next-intl/server"

import { UserRole } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import { ClientHomeData } from "@/src/types/client-portal"
import { auth, currentUser } from "@clerk/nextjs/server"
import { FolderOpen } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { DashboardActivityWidget } from "@/src/components/admin/dashboard/DashboardActivityWidget"
import { DashboardStatsWidget } from "@/src/components/admin/dashboard/DashboardStatsWidget"
import { ClientHome } from "@/src/components/client/ClientHome"

import { getClientHomeData } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Dashboard",
  description: "MAGUI.studio",
  path: "/",
})

function DashboardSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-10">
      <div className="h-40 rounded-4xl bg-muted/10" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 rounded-[1.75rem] bg-muted/10" />
        <div className="h-32 rounded-[1.75rem] bg-muted/10" />
        <div className="h-32 rounded-[1.75rem] bg-muted/10" />
        <div className="h-32 rounded-[1.75rem] bg-muted/10" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-4xl bg-muted/10" />
        <div className="h-80 rounded-4xl bg-muted/10" />
      </div>
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard")
  const { userId: clerkId } = await auth()
  await searchParams

  if (!clerkId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true, name: true },
  })

  if (!user) {
    return <div />
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <main className="relative flex flex-col overflow-hidden bg-background px-5 py-10 sm:px-6 lg:px-12">
        <div className="flex w-full flex-col gap-12">
          <header className="flex flex-col justify-between gap-6 pb-2 md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  {t("admin_eyebrow")}
                </p>
              </div>
              <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
                {t("admin_title")}
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75">
                {t("admin_description")}
              </p>
            </div>
          </header>

          <Suspense fallback={<DashboardSkeleton />}>
            <div className="flex flex-col gap-8">
              <DashboardStatsWidget userId={user.id} />

              <div aria-hidden="true" className="h-px w-full bg-border/20" />

              <div className="w-full">
                <DashboardActivityWidget />
              </div>
            </div>
          </Suspense>
        </div>
      </main>
    )
  }

  // Client Portal
  const rawClientData = await getClientHomeData(user.id)
  const clientData: ClientHomeData = {
    pendingApprovals: [],
    pendingTasks: [],
    recentActivity: [],
    ...rawClientData,
  }
  const clerkUser = await currentUser()
  const userName =
    clerkUser?.firstName || clerkUser?.username || user.name || "Cliente"

  if (clientData.projects.length === 0) {
    return (
      <main className="relative flex min-h-[80vh] flex-col items-center justify-center bg-background/50 px-5 py-10 sm:px-6 lg:px-12">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="relative mb-8 flex size-24 items-center justify-center rounded-4xl bg-muted/10 backdrop-blur-xl">
            <div className="absolute inset-0 size-full animate-pulse rounded-4xl bg-brand-primary/5" />
            <FolderOpen
              weight="duotone"
              className="relative size-10 text-brand-primary/40"
            />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/60">
            {t("no_project_eyebrow")}
          </p>

          <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            {t("no_project")}
          </h2>

          <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground/60">
            {t("no_project_description")}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <a href="mailto:contato@magui.studio">
                {t("common.contact_team")}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border/40 bg-background/50 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Link href="/projects">{t("common.my_projects")}</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const activeProject = clientData.projects[0]
  const briefingData = activeProject.briefing as Record<string, unknown> | null
  const isBriefingEmpty = !briefingData || Object.keys(briefingData).length < 6

  return (
    <main className="relative flex flex-col overflow-hidden bg-background/50 px-5 py-10 sm:px-6 lg:px-12">
      <ClientHome
        userName={userName}
        data={clientData}
        isBriefingEmpty={isBriefingEmpty}
      />
    </main>
  )
}
