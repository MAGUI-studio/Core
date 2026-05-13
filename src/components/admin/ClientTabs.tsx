"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { InvoiceKind, Prisma } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  CurrencyCircleDollar,
  FolderOpen,
  Globe,
  Plus,
  SlidersHorizontal,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { parseAsString, useQueryState } from "nuqs"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { ClientPasswordResetCard } from "@/src/components/admin/ClientPasswordResetCard"
import { ClientProfileForm } from "@/src/components/admin/ClientProfileForm"
import { MaguiConnectAdminView } from "@/src/components/admin/MaguiConnectAdminView"
import { AddInvoiceForm } from "@/src/components/admin/financial/AddInvoiceForm"

import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ClientTabsProps {
  userId: string
  localUserId: string
  clientFullName: string
  clerkUserId: string
  clientFirstName: string
  clientLastName: string
  clientUsername: string
  clientEmail: string
  clientCompanyName: string
  clientPhone: string
  clientPosition: string
  clientTaxId: string
  standaloneInvoices: Prisma.InvoiceGetPayload<{
    include: {
      installments: true
    }
  }>[]
  projects: Prisma.ProjectGetPayload<{
    include: {
      client: {
        select: {
          name: true
          email: true
        }
      }
    }
  }>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maguiConnectProfile: any
  canAccessMaguiConnect: boolean
}

export function ClientTabs({
  userId,
  localUserId,
  clientFullName,
  clerkUserId,
  clientFirstName,
  clientLastName,
  clientUsername,
  clientEmail,
  clientCompanyName,
  clientPhone,
  clientPosition,
  clientTaxId,
  standaloneInvoices,
  projects,
  maguiConnectProfile,
  canAccessMaguiConnect,
}: ClientTabsProps) {
  const t = useTranslations("Admin.clients")
  const tFinancial = useTranslations("Financial.status")
  const tStatus = useTranslations("Dashboard.status")
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("billing")
  )

  const primaryActionClassName =
    "h-12 rounded-full bg-brand-primary px-7 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:bg-brand-primary/90"

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="mb-10 flex items-center justify-between overflow-x-auto border-b border-border/40 pb-4 scrollbar-hide">
        <TabsList variant="line" className="flex-nowrap bg-transparent p-0">
          <TabsTrigger
            value="billing"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <CurrencyCircleDollar weight="duotone" className="mr-2 size-4" />
            {t("tabs.billing")}
          </TabsTrigger>
          <TabsTrigger
            value="connect"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Globe weight="duotone" className="mr-2 size-4" />
            {t("tabs.connect")}
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <FolderOpen weight="duotone" className="mr-2 size-4" />
            {t("tabs.projects")}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <SlidersHorizontal weight="duotone" className="mr-2 size-4" />
            Configuracoes
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="billing"
        className="space-y-6 focus-visible:outline-none"
      >
        <section className="rounded-4xl border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
                {t("tabs.billing")}
              </p>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {t("billing.title")}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground/75">
                {t("billing.description")}
              </p>
            </div>

            <AddInvoiceForm
              clientId={localUserId}
              defaultKind={InvoiceKind.MAGUI_CONNECT}
              defaultTitle="MAGUI Connect"
              triggerLabel={t("billing.trigger")}
              dialogTitle={t("billing.dialogTitle")}
              triggerClassName={primaryActionClassName}
            />
          </div>
        </section>

        <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader className="border-b border-border/20">
            <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
              {t("billing.listTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            {standaloneInvoices.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                {t("billing.empty")}
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
                            : t("billing.kindStandalone")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-widest"
                        >
                          {tFinancial(invoice.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground/75">
                        {invoice.description ||
                          t("billing.noProjectDescription")}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                        {t("billing.totalLabel")}
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
                            {t("billing.installmentLabel")} {installment.number}
                          </span>
                          <span className="text-sm font-black text-foreground">
                            {formatCurrencyBRLFromCents(installment.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {format(
                              new Date(installment.dueDate),
                              "dd/MM/yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
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
      </TabsContent>

      <TabsContent value="connect" className="mt-0 focus-visible:outline-none">
        <MaguiConnectAdminView
          clientName={clientFullName}
          userId={localUserId}
          canAccess={canAccessMaguiConnect}
          profile={maguiConnectProfile}
        />
      </TabsContent>

      <TabsContent value="projects" className="mt-0 focus-visible:outline-none">
        <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
          <CardHeader className="border-b border-border/20">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                {t("tabs.projects")}
              </CardTitle>
              <Button asChild className={primaryActionClassName}>
                <Link href="/admin/projects/register">
                  <Plus className="mr-2 size-4" />
                  {t("projects.start")}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            {projects.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                {t("projects.empty")}
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
                      {t("projects.open")}
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent
        value="settings"
        className="mt-0 space-y-10 focus-visible:outline-none"
      >
        <ClientProfileForm
          clerkUserId={clerkUserId}
          firstName={clientFirstName}
          lastName={clientLastName}
          username={clientUsername}
          email={clientEmail}
          companyName={clientCompanyName}
          phone={clientPhone}
          position={clientPosition}
          taxId={clientTaxId}
        />

        <ClientPasswordResetCard
          clerkUserId={clerkUserId}
          username={clientUsername || null}
        />
      </TabsContent>
    </Tabs>
  )
}
