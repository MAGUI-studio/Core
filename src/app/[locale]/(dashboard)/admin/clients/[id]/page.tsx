import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { clerkClient } from "@clerk/nextjs/server"
import {
  ArrowLeft,
  EnvelopeSimple,
  FolderOpen,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { ClientTabs } from "@/src/components/admin/ClientTabs"

import { getAdminClientDetails } from "@/src/lib/client-data"
import { getAdminMaguiConnectProfileByUserId } from "@/src/lib/maguiConnectData"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const localUser = await prisma.user.findUnique({
    where: { clerkId: id },
    select: { name: true, email: true },
  })
  const title = localUser?.name ?? localUser?.email ?? "Cliente"

  return dashboardMetadata({
    title: `Cliente: ${title}`,
    description:
      "Detalhes administrativos de cliente, projetos vinculados e dados de acesso.",
    path: `/admin/clients/${id}`,
  })
}

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const t = await getTranslations("Admin.clients")
  const { id } = await params
  const client = await clerkClient()

  let clerkUser
  try {
    clerkUser = await client.users.getUser(id)
  } catch {
    notFound()
  }

  const localUser = await getAdminClientDetails(id)

  const maguiConnectProfile = localUser
    ? await getAdminMaguiConnectProfileByUserId(localUser.id)
    : null
  const standaloneInvoices = localUser
    ? await prisma.invoice.findMany({
        where: {
          clientId: localUser.id,
          projectId: null,
        },
        include: {
          installments: {
            orderBy: { number: "asc" },
          },
        },
        orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
      })
    : []

  const projects = localUser?.projects ?? []
  const activeProjects = projects.filter(
    (project) => project.status !== "LAUNCHED"
  )
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "Sem e-mail"
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    "Cliente"
  const role = (clerkUser.publicMetadata.role as string) || "client"

  return (
    <main className="relative flex flex-col gap-10 bg-background/50 p-6 lg:p-12 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6">
        <Button
          asChild
          variant="ghost"
          className="w-fit rounded-full px-0 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para clientes
          </Link>
        </Button>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            {fullName}
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Visão consolidada do cadastro, papel de acesso e projetos
            vinculados.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-3">
              <UserCircle className="size-5 text-brand-primary" />
              <span className="text-sm font-semibold text-foreground/85">
                {fullName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <EnvelopeSimple className="size-5 text-brand-primary" />
              <span className="text-sm font-semibold text-foreground/85">
                {email}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
              Permissão
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-brand-primary" />
              <Badge
                variant="secondary"
                className="bg-brand-primary/5 text-brand-primary border-brand-primary/20 text-[9px] font-black uppercase tracking-widest py-1 px-3"
              >
                {t(`roles.${role === "admin" ? "admin" : "client"}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground/75">
              Username: @{clerkUser.username || "client"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
              Projetos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-3">
              <FolderOpen className="size-5 text-brand-primary" />
              <span className="text-sm font-semibold text-foreground/85">
                {projects.length} projeto(s)
              </span>
            </div>
            <p className="text-sm text-muted-foreground/75">
              {activeProjects.length} em andamento
            </p>
          </CardContent>
        </Card>
      </div>

      {localUser ? (
        <ClientTabs
          userId={id}
          localUserId={localUser.id}
          clientFullName={fullName}
          standaloneInvoices={standaloneInvoices}
          projects={projects}
          maguiConnectProfile={maguiConnectProfile}
          canAccessMaguiConnect={localUser.canAccessMaguiConnect}
        />
      ) : null}
    </main>
  )
}
