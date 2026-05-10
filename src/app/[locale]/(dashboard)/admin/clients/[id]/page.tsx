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
    <main className="relative flex flex-col gap-12 overflow-hidden bg-background/50 px-6 py-7 lg:px-12 lg:py-10">
      <div className="absolute right-0 top-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-7">
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

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            {fullName}
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Visao consolidada do cadastro, papel de acesso e projetos vinculados.
          </p>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <section className="grid gap-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
            Identificacao
          </p>
          <div className="grid gap-4">
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
          </div>
        </section>

        <section className="grid gap-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
            Permissao
          </p>
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-brand-primary" />
              <Badge
                variant="secondary"
                className="border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-primary"
              >
                {t(`roles.${role === "admin" ? "admin" : "client"}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground/75">
              Username: @{clerkUser.username || "client"}
            </p>
          </div>
        </section>

        <section className="grid gap-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
            Projetos
          </p>
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="size-5 text-brand-primary" />
              <span className="text-sm font-semibold text-foreground/85">
                {projects.length} projeto(s)
              </span>
            </div>
            <p className="text-sm text-muted-foreground/75">
              {activeProjects.length} em andamento
            </p>
          </div>
        </section>
      </div>

      {localUser ? (
        <ClientTabs
          userId={id}
          localUserId={localUser.id}
          clientFullName={fullName}
          clerkUserId={clerkUser.id}
          clientFirstName={clerkUser.firstName ?? ""}
          clientLastName={clerkUser.lastName ?? ""}
          clientUsername={clerkUser.username ?? ""}
          clientEmail={email === "Sem e-mail" ? "" : email}
          clientCompanyName={localUser.companyName ?? ""}
          clientPhone={localUser.phone ?? ""}
          clientPosition={localUser.position ?? ""}
          clientTaxId={localUser.taxId ?? ""}
          standaloneInvoices={standaloneInvoices}
          projects={projects}
          maguiConnectProfile={maguiConnectProfile}
          canAccessMaguiConnect={localUser.canAccessMaguiConnect}
        />
      ) : null}
    </main>
  )
}
