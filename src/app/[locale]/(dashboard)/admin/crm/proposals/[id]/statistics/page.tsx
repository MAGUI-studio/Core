import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Prisma } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowLeft,
  ArrowSquareOut,
  ChartBar,
  ClockCounterClockwise,
  Eye,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { buildProposalPublicPath } from "@/src/lib/proposals/public-links"
import { protectAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

export const metadata = dashboardMetadata({
  title: "Estatísticas da Proposta",
  description:
    "Visualização de acessos, IPs e histórico de aberturas do link público da proposta comercial.",
  path: "/admin/crm/proposals/[id]/statistics",
})

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Ainda não houve"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value))
}

function buildPublicProposalUrl(proposal: {
  id: string
  lead: { instagram?: string | null }
}) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboard.magui.studio"
  return `${origin}${buildProposalPublicPath(proposal.lead.instagram, proposal.id)}`
}

function summarizeUserAgent(userAgent: string | null) {
  if (!userAgent) return "Não informado"
  if (userAgent.length <= 96) return userAgent
  return `${userAgent.slice(0, 93)}...`
}

type ProposalViewEventRow = {
  id: string
  ip: string | null
  userAgent: string | null
  referer: string | null
  viewedAt: Date
}

type ProposalStatisticsRow = {
  firstViewedAt: Date | null
  lastViewedAt: Date | null
  viewCount: number
}

export default async function ProposalStatisticsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<React.JSX.Element> {
  await protectAdmin()

  const { id } = await params
  const t = await getTranslations("Admin.crm")

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      lead: {
        select: {
          id: true,
          companyName: true,
          instagram: true,
        },
      },
    },
  })

  if (!proposal) {
    notFound()
  }

  const [stats] = await prisma.$queryRaw<ProposalStatisticsRow[]>(Prisma.sql`
    SELECT
      "firstViewedAt",
      "lastViewedAt",
      "viewCount"
    FROM "Proposal"
    WHERE "id" = ${id}
    LIMIT 1
  `)

  const viewEvents = await prisma.$queryRaw<ProposalViewEventRow[]>(Prisma.sql`
    SELECT
      "id",
      "ip",
      "userAgent",
      "referer",
      "viewedAt"
    FROM "ProposalViewEvent"
    WHERE "proposalId" = ${id}
    ORDER BY "viewedAt" DESC
    LIMIT 100
  `)

  const publicUrl = buildPublicProposalUrl(proposal)

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute right-0 top-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-border/40 bg-background/70 px-5 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Link href="/admin/crm/proposals">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para propostas
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
          >
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut className="mr-2 size-4" />
              Abrir link público
            </a>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            Estatísticas da Proposta
          </h1>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-foreground/80">
              {proposal.title} <span className="text-muted-foreground/50">#{proposal.number}</span>
            </p>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground/80">
              {proposal.lead.companyName} · {formatCurrencyBRLFromCents(proposal.totalValue)}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-brand-primary/10 bg-[radial-gradient(circle_at_top,rgba(228,90,44,0.12),transparent_55%),rgba(255,255,255,0.78)] p-6 shadow-sm backdrop-blur">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/80">
                Radar comercial
              </span>
              <div className="flex items-center gap-2 text-foreground">
                <Eye className="size-4 text-brand-primary" weight="fill" />
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  Visualizações
                </p>
              </div>
            </div>
            <Badge className="border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
              Total
            </Badge>
          </div>
          <p className="font-heading text-4xl font-black tracking-[-0.05em] text-foreground">
            {stats?.viewCount ?? 0}
          </p>
          <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground/70">
            Total de aberturas registradas do link público.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-background/75 p-6 shadow-sm backdrop-blur">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/45">
                Linha do tempo
              </span>
              <div className="flex items-center gap-2 text-foreground">
                <ClockCounterClockwise className="size-4 text-brand-primary" weight="fill" />
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  Primeira visualização
                </p>
              </div>
            </div>
            <Badge variant="outline">Início</Badge>
          </div>
          <p className="text-lg font-black text-foreground">
            {formatDateTime(stats?.firstViewedAt)}
          </p>
          <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground/70">
            Primeira vez em que este link foi aberto.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-background/75 p-6 shadow-sm backdrop-blur">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/45">
                Movimento recente
              </span>
              <div className="flex items-center gap-2 text-foreground">
                <ChartBar className="size-4 text-brand-primary" weight="fill" />
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  Última visualização
                </p>
              </div>
            </div>
            <Badge variant="outline">Agora</Badge>
          </div>
          <p className="text-lg font-black text-foreground">
            {formatDateTime(stats?.lastViewedAt)}
          </p>
          <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground/70">
            Último acesso que o sistema conseguiu registrar.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/40 bg-background/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-5 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">
            Link público
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm font-bold text-foreground/80 transition-colors hover:text-brand-primary"
          >
            {publicUrl}
          </a>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Quando
              </TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                IP
              </TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Origem
              </TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Navegador / dispositivo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewEvents.length ? (
              viewEvents.map((event) => (
                <TableRow key={event.id} className="border-border/15">
                  <TableCell className="py-4 text-xs font-bold text-foreground/85">
                    {formatDateTime(event.viewedAt)}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-mono text-muted-foreground/80">
                    {event.ip ?? "Não informado"}
                  </TableCell>
                  <TableCell className="max-w-[240px] py-4 text-xs text-muted-foreground/80">
                    <span className="line-clamp-2 break-all">
                      {event.referer ?? "Direto / sem referer"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[360px] py-4 text-xs text-muted-foreground/80">
                    <span className="line-clamp-2 break-all">
                      {summarizeUserAgent(event.userAgent)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-36 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  Nenhuma visualização registrada ainda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
