import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import { Plus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ProposalsOverviewList } from "@/src/components/admin/proposals/ProposalsOverviewList"

import { protectAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Propostas comerciais",
  description:
    "Central comercial para consultar propostas, acompanhar investimento, status, validade e gerar novos documentos para leads e clientes.",
  path: "/admin/crm/proposals",
})

export default async function ProposalsPage(): Promise<React.JSX.Element> {
  await protectAdmin()

  const t = await getTranslations("Admin.crm")
  const proposals = await prisma.proposal.findMany({
    include: {
      lead: {
        select: {
          id: true,
          companyName: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            Propostas Comerciais
          </h1>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Consulte todas as propostas da operacao comercial, acompanhe
            investimento, validade e status, e crie novas propostas em uma area
            propria da equipe.
          </p>
        </div>

        <Button
          asChild
          className="h-12 rounded-full px-7 text-[10px] font-black uppercase tracking-[0.2em] text-white"
        >
          <Link href="/admin/crm/proposals/new">
            <Plus className="mr-2 size-4" />
            Nova proposta
          </Link>
        </Button>
      </div>

      <div className="rounded-4xl border border-border/40 bg-background/70 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:p-8">
        <ProposalsOverviewList proposals={proposals} />
      </div>
    </main>
  )
}
