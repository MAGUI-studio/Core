import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { InvoiceKind } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import { clerkClient } from "@clerk/nextjs/server"
import {
  ArrowLeft,
  EnvelopeSimple,
  FolderOpen,
  Plus,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { MaguiConnectAdminView } from "@/src/components/admin/MaguiConnectAdminView"
import { AddInvoiceForm } from "@/src/components/admin/financial/AddInvoiceForm"

import { getAdminClientDetails } from "@/src/lib/client-data"
import { getAdminMaguiConnectProfileByUserId } from "@/src/lib/maguiConnectData"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

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
  const tStatus = await getTranslations("Dashboard.status")
  const tFinancial = await getTranslations("Financial.status")
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
  const primaryActionClassName =
    "h-12 rounded-full bg-brand-primary px-7 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:bg-brand-primary/90"

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

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
              Visao consolidada do cadastro, papel de acesso e projetos
              vinculados.
            </p>
          </div>

          <Button asChild className={primaryActionClassName}>
            <Link href="/admin/projects/register">
              <Plus className="mr-2 size-4" />
              Iniciar projeto
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
              Identificacao
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
              Permissao
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
        <section className="rounded-4xl border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
                Cobranca avulsa
              </p>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Emitir fatura sem projeto
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground/75">
                Use este fluxo para cobrar MAGUI Connect ou qualquer outro
                servico avulso diretamente para este cliente.
              </p>
            </div>

            <AddInvoiceForm
              clientId={localUser.id}
              defaultKind={InvoiceKind.MAGUI_CONNECT}
              defaultTitle="MAGUI Connect"
              triggerLabel="Nova cobranca"
              dialogTitle="Criar cobranca avulsa"
              triggerClassName={primaryActionClassName}
            />
          </div>
        </section>
      ) : null}

      <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
            Cobrancas avulsas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          {standaloneInvoices.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              Nenhuma cobranca avulsa emitida para este cliente.
            </div>
          ) : (
            standaloneInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-black tracking-tight text-foreground">
                        {invoice.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="border-brand-primary/20 bg-brand-primary/5 text-[9px] font-black uppercase tracking-widest text-brand-primary"
                      >
                        {invoice.kind === InvoiceKind.MAGUI_CONNECT
                          ? "MAGUI Connect"
                          : "Avulsa"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase tracking-widest"
                      >
                        {tFinancial(invoice.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground/75">
                      {invoice.description || "Cobranca sem projeto vinculado."}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Total
                    </p>
                    <p className="text-lg font-black tracking-tight text-foreground">
                      {formatCurrencyBRLFromCents(invoice.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-border/20 pt-4">
                  {invoice.installments.map((installment) => (
                    <div
                      key={installment.id}
                      className="flex flex-col gap-2 rounded-[1rem] bg-muted/30 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                          Parcela {installment.number}
                        </span>
                        <span className="text-sm font-black text-foreground">
                          {formatCurrencyBRLFromCents(installment.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          {format(new Date(installment.dueDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit text-[9px] font-black uppercase tracking-widest"
                      >
                        {tFinancial(installment.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {localUser ? (
        <MaguiConnectAdminView
          clientName={fullName}
          userId={localUser.id}
          canAccess={localUser.canAccessMaguiConnect}
          profile={maguiConnectProfile}
        />
      ) : null}

      <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
            Projetos vinculados
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          {projects.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              Nenhum projeto vinculado a este cliente.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="grid gap-1">
                  <p className="text-base font-black tracking-tight text-foreground">
                    {project.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    {project.client.name || project.client.email} •{" "}
                    {tStatus(project.status)}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link
                    href={{
                      pathname: "/admin/projects/[id]",
                      params: { id: project.id },
                    }}
                  >
                    Abrir projeto
                  </Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
