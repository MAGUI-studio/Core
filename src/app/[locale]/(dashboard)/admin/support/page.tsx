import * as React from "react"

import { getAdminSupportTickets } from "@/src/lib/support-data"
import { dashboardMetadata } from "@/src/lib/seo"
import { protectInternal } from "@/src/lib/permissions"

import { AdminSupportTicketsTable } from "@/src/components/admin/support/AdminSupportTicketsTable"

export const metadata = dashboardMetadata({
  title: "Tickets de suporte",
  description:
    "Central administrativa para atendimento, resposta e acompanhamento dos tickets registrados no CRM.",
  path: "/admin/support",
})

export default async function AdminSupportPage(): Promise<React.JSX.Element> {
  await protectInternal()
  const tickets = await getAdminSupportTickets()

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
            Atendimento
          </p>
        </div>
        <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
          Tickets de Suporte
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80">
          Visualize, priorize e responda todos os chamados centralizados no CRM.
          O histórico fica unificado por cliente, projeto e contexto de
          atendimento.
        </p>
      </div>

      <AdminSupportTicketsTable tickets={tickets} />
    </main>
  )
}
