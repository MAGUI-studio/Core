"use client"

import * as React from "react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { cn, formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ProjectFinancialSummaryProps {
  invoices: Array<{
    totalAmount: number
    status: string
    installments: Array<{
      amount: number
      dueDate: Date | string
      status: string
    }>
  }>
}

export function ProjectFinancialSummary({
  invoices,
}: ProjectFinancialSummaryProps): React.JSX.Element {
  const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const allInstallments = invoices.flatMap((inv) => inv.installments)
  const paidAmount = allInstallments
    .filter((inst) => inst.status === "PAID")
    .reduce((acc, inst) => acc + inst.amount, 0)

  const nextInstallment = allInstallments
    .filter(
      (inst) =>
        inst.status === "PENDING" ||
        inst.status === "DUE_SOON" ||
        inst.status === "OVERDUE"
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0]

  const progress = totalValue > 0 ? (paidAmount / totalValue) * 100 : 0

  return (
    <div className="flex flex-col gap-6 rounded-4xl bg-muted/30 p-8 sm:p-10">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
          Controle Financeiro
        </h4>
        <h3 className="font-heading text-xl font-black uppercase tracking-tight">
          Saúde Financeira
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-3xl bg-background/40 p-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
            Investimento Total
          </span>
          <span className="text-xl font-black text-foreground sm:text-2xl">
            {formatCurrencyBRLFromCents(totalValue)}
          </span>
        </div>
        <div className="flex flex-col gap-2 rounded-3xl bg-background/40 p-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
            Valor Liquidado
          </span>
          <span className="text-xl font-black text-green-600 sm:text-2xl">
            {formatCurrencyBRLFromCents(paidAmount)}
          </span>
        </div>
        <div className="flex flex-col gap-2 rounded-3xl bg-background/40 p-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
            Próximo Vencimento
          </span>
          <span
            className={cn(
              "text-xl font-black sm:text-2xl",
              nextInstallment?.status === "OVERDUE"
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {nextInstallment
              ? format(new Date(nextInstallment.dueDate), "dd/MM", {
                  locale: ptBR,
                })
              : "--/--"}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-3 px-1">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-muted-foreground/40">
            Progresso de Quitação
          </span>
          <span className="text-brand-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full bg-brand-primary transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
