import * as React from "react"

import { getTranslations } from "next-intl/server"

import {
  Briefcase,
  Receipt,
  TrendUp,
  Users,
} from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent } from "@/src/components/ui/card"

import prisma from "@/src/lib/prisma"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

export async function AdminFinancialMetrics() {
  const t = await getTranslations("Admin.dashboard")

  // Simple sum of all PAID installments (total revenue history)
  const revenueResult = await prisma.installment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  })

  // Revenue from the last 30 days
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const recentRevenueResult = await prisma.installment.aggregate({
    where: {
      status: "PAID",
      paidAt: { gte: last30Days },
    },
    _sum: { amount: true },
  })

  // Active proposals value (DRAFT or SENT)
  const activeProposalsResult = await prisma.proposal.aggregate({
    where: { status: { in: ["DRAFT", "SENT"] } },
    _sum: { totalValue: true },
  })

  const stats = [
    {
      label: "Receita Total",
      value: formatCurrencyBRLFromCents(revenueResult._sum.amount || 0),
      description: "Valor total liquidado",
      icon: Receipt,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Últimos 30 dias",
      value: formatCurrencyBRLFromCents(recentRevenueResult._sum.amount || 0),
      description: "Liquidez recente",
      icon: TrendUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pipeline Comercial",
      value: formatCurrencyBRLFromCents(
        activeProposalsResult._sum.totalValue || 0
      ),
      description: "Propostas em aberto",
      icon: Briefcase,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="overflow-hidden border-border/40 bg-muted/5 backdrop-blur-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}
              >
                <stat.icon size={24} weight="duotone" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {stat.label}
                </p>
                <p className="font-heading text-2xl font-black tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground/40">
                  {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
