import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ProposalBuilderForm } from "@/src/components/admin/proposals/ProposalBuilderForm"

import { getLeads } from "@/src/lib/crm-data"
import { protectAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Nova proposta comercial",
  description:
    "Monte uma proposta comercial completa com lead selecionado, narrativa de valor, escopo detalhado e PDF pronto para apresentacao e download.",
  path: "/admin/crm/proposals/new",
})

interface CreateProposalPageProps {
  searchParams?: Promise<{ leadId?: string }>
}

export default async function CreateProposalPage({
  searchParams,
}: CreateProposalPageProps): Promise<React.JSX.Element> {
  await protectAdmin()

  const t = await getTranslations("Admin.crm")
  const leads = await getLeads(1, 500)
  const resolvedSearchParams = searchParams ? await searchParams : undefined

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
          <Link href="/admin/crm/proposals">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para propostas
          </Link>
        </Button>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            Nova Proposta
          </h1>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Selecione o lead, organize as entregas e construa uma proposta
            comercial com mais clareza, percepcao de valor e governanca
            operacional.
          </p>
        </div>
      </div>

      <div className="w-full">
        <ProposalBuilderForm
          leads={leads.map((lead) => ({
            id: lead.id,
            companyName: lead.companyName,
          }))}
          initialLeadId={resolvedSearchParams?.leadId}
        />
      </div>
    </main>
  )
}
