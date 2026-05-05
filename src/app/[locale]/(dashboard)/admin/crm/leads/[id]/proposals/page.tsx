import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { LeadProposalsTab } from "@/src/components/admin/lead-drawer/LeadProposalsTab"

import { getLeadDetails } from "@/src/lib/crm-data"
import { protectAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Propostas do lead",
  description:
    "Area dedicada para listar e criar propostas comerciais de um lead.",
  path: "/admin/crm/leads/[id]/proposals",
})

interface LeadProposalsPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function LeadProposalsPage({
  params,
}: LeadProposalsPageProps): Promise<React.JSX.Element> {
  await protectAdmin()

  const { id } = await params
  const t = await getTranslations("Admin.crm")
  const lead = await getLeadDetails(id)

  if (!lead) notFound()

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6">
        <Button
          asChild
          variant="ghost"
          className="w-fit rounded-full px-0 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Link href="/admin/crm">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para CRM
          </Link>
        </Button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                {t("eyebrow")}
              </p>
            </div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              Propostas de {lead.companyName}
            </h1>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80">
              Visao centralizada das propostas comerciais vinculadas a este
              lead, com historico de status, acesso rapido ao PDF e criacao de
              novas versoes sem depender do drawer.
            </p>
          </div>

          <Button
            asChild
            className="h-12 rounded-full px-7 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Link
              href={{
                pathname: "/admin/crm/leads/[id]/proposal",
                params: { id: lead.id },
              }}
            >
              <Plus className="mr-2 size-4" />
              Nova proposta
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-4xl border border-border/40 bg-background/70 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:p-8">
        <LeadProposalsTab lead={lead} showHeader={false} />
      </div>
    </main>
  )
}
