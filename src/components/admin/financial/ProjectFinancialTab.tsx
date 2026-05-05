"use client"

import * as React from "react"

import { useSearchParams } from "next/navigation"

import { Prisma } from "@/src/generated/client"
import {
  Bank,
  CheckCircle,
  Clock,
  CreditCard,
  FilePdf,
  Receipt,
  Wallet,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { differenceInCalendarDays, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { registerPaymentAction } from "@/src/lib/actions/financial.actions"
import { cn, formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

import { usePermissions } from "@/src/hooks/use-permissions"

import { AddInvoiceForm } from "./AddInvoiceForm"

type InvoiceWithInstallments = Prisma.InvoiceGetPayload<{
  include: {
    project: {
      select: {
        id: true
        name: true
      }
    }
    installments: {
      include: {
        paymentEvents: true
      }
    }
  }
}>

interface ProjectFinancialTabProps {
  projectId: string
  invoices: InvoiceWithInstallments[]
  projectName?: string
}

export function ProjectFinancialTab({
  projectId,
  invoices,
  projectName,
}: ProjectFinancialTabProps) {
  const { isAdmin } = usePermissions()
  const searchParams = useSearchParams()
  const [selectedInstallment, setSelectedInstallment] = React.useState<
    InvoiceWithInstallments["installments"][number] | null
  >(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
  const [paymentType, setPaymentType] = React.useState("PIX")
  const [isStripeLoading, setIsStripeLoading] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Pagamento realizado com sucesso!")
    }
    if (searchParams.get("canceled")) {
      toast.error("O pagamento foi cancelado.")
    }
  }, [searchParams])

  const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const paidValue = invoices.reduce((acc, inv) => {
    return (
      acc +
      inv.installments
        .filter((i) => i.status === "PAID")
        .reduce((sum, inst) => sum + inst.amount, 0)
    )
  }, 0)

  const formatBRL = (cents: number) => formatCurrencyBRLFromCents(cents)
  const pendingValue = totalValue - paidValue

  const getDueBadge = (
    inst: InvoiceWithInstallments["installments"][number]
  ): { label: string; className: string } | null => {
    if (inst.status === "PAID") return null

    const today = startOfDay(new Date())
    const dueDate = startOfDay(new Date(inst.dueDate))
    const diff = differenceInCalendarDays(dueDate, today)

    if (diff < 0 || diff > 5) return null

    if (diff === 0) {
      return {
        label: "Vence hoje",
        className: "border-red-500/20 bg-red-500/10 text-red-600",
      }
    }

    if (diff === 1) {
      return {
        label: "Vence amanha",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
      }
    }

    return {
      label: `Vence em ${diff} dias`,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    }
  }

  const handleRegisterPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInstallment) return

    const formData = new FormData(e.currentTarget)
    const result = await registerPaymentAction({
      installmentId: selectedInstallment.id,
      type: paymentType,
      amount: selectedInstallment.amount,
      date: new Date(),
      note: formData.get("note") as string,
    })

    if (result.success) {
      toast.success("Pagamento registrado!")
      setIsPaymentDialogOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  const handleStripePayment = async (
    inst: InvoiceWithInstallments["installments"][number]
  ) => {
    if (inst.stripeCheckoutUrl) {
      window.open(inst.stripeCheckoutUrl, "_blank")
      return
    }

    try {
      setIsStripeLoading(inst.id)
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId: inst.id }),
      })

      const data = await response.json()
      if (data.url) window.open(data.url, "_blank")
      else throw new Error(data.error || "Erro ao criar sessão")
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsStripeLoading(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <Card className="overflow-hidden rounded-[2.5rem] border border-border/20 bg-linear-to-br from-foreground/[0.03] via-background to-muted/10 shadow-none">
          <CardContent className="p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-foreground/5 text-foreground/40">
                <Receipt size={18} weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Investimento Total
              </span>
            </div>
            <p className="text-4xl font-black uppercase tracking-tight text-foreground">
              {formatBRL(totalValue)}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground/65">
              {projectName
                ? `Resumo consolidado do investimento do projeto ${projectName}.`
                : "Resumo consolidado do investimento deste projeto."}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[2.5rem] border border-emerald-500/10 bg-emerald-500/[0.03] shadow-none">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle size={18} weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">
                Total Liquidado
              </span>
            </div>
            <p className="text-4xl font-black uppercase tracking-tight text-emerald-600">
              {formatBRL(paidValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[2.5rem] border border-red-500/10 bg-red-500/[0.03] shadow-none">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <Wallet size={18} weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600/70">
                Saldo devedor
              </span>
            </div>
            <p className="text-4xl font-black uppercase tracking-tight text-red-600">
              {formatBRL(pendingValue)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-red-600/70">
              {pendingValue > 0
                ? "Valor ainda pendente para liberar a operacao completa."
                : "Nao existe saldo em aberto neste momento."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-border/20 pb-6">
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
              Cronograma Financeiro
            </h3>
            <p className="text-xs font-medium text-muted-foreground/50">
              Acompanhe suas faturas e realize pagamentos de forma segura.
            </p>
          </div>
          {isAdmin && <AddInvoiceForm projectId={projectId} />}
        </div>

        <div className="space-y-6">
          {invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/20 rounded-[3rem] bg-muted/2">
              <Receipt
                weight="thin"
                className="size-20 text-muted-foreground/10 mb-6"
              />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                Nenhum registro financeiro encontrado.
              </p>
            </div>
          )}
          {invoices.map((invoice) => (
            <div key={invoice.id} className="space-y-4">
              <div className="rounded-4xl border border-border/20 bg-muted/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="rounded-full bg-foreground px-3 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-background">
                        FATURA
                      </Badge>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
                        {invoice.title}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/70">
                      {invoice.description ||
                        "Cobranca vinculada a este projeto."}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
                      Projeto relacionado
                    </p>
                    <p className="text-sm font-black uppercase tracking-tight text-foreground">
                      {invoice.project?.name || projectName || "Projeto"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {invoice.installments.map((inst, index) => {
                  const previousInstallments = invoice.installments.slice(
                    0,
                    index
                  )
                  const hasUnpaidPrevious = previousInstallments.some(
                    (p) => p.status !== "PAID"
                  )

                  const dueBadge = getDueBadge(inst)
                  const isOverdue =
                    isAfter(
                      startOfDay(new Date()),
                      startOfDay(new Date(inst.dueDate))
                    ) && inst.status !== "PAID"

                  return (
                    <div
                      key={inst.id}
                      className={cn(
                        "group relative flex flex-col md:flex-row md:items-center justify-between p-8 rounded-4xl border transition-all duration-500",
                        inst.status === "PAID"
                          ? "border-emerald-500/10 bg-emerald-500/[0.01] opacity-60"
                          : hasUnpaidPrevious
                            ? "border-border/20 bg-muted/2 opacity-40 grayscale"
                            : isOverdue
                              ? "border-red-500/20 bg-red-500/[0.03] hover:border-red-500/30"
                              : "border-border/40 bg-muted/5 hover:border-brand-primary/30 hover:bg-brand-primary/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-8">
                        <div
                          className={cn(
                            "flex size-14 items-center justify-center rounded-2xl border-2 transition-all",
                            inst.status === "PAID"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                              : "border-border/60 bg-background text-muted-foreground/30"
                          )}
                        >
                          {inst.status === "PAID" ? (
                            <CheckCircle weight="fill" className="size-8" />
                          ) : hasUnpaidPrevious ? (
                            <Clock
                              weight="duotone"
                              className="size-8 opacity-20"
                            />
                          ) : (
                            <Clock weight="duotone" className="size-8" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                              Parcela {inst.number}
                            </p>
                            {inst.status !== "PAID" && !dueBadge && (
                              <span
                                className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                  hasUnpaidPrevious
                                    ? "bg-muted/10 text-muted-foreground/40 border border-border/10"
                                    : isOverdue
                                      ? "border border-red-500/20 bg-red-500/10 text-red-600"
                                      : "bg-muted/10 text-muted-foreground/60 border border-border/10"
                                )}
                              >
                                {hasUnpaidPrevious
                                  ? "Aguardando anterior"
                                  : isOverdue
                                    ? "Vencida"
                                    : `Vencimento ${format(new Date(inst.dueDate), "dd/MM", { locale: ptBR })}`}
                              </span>
                            )}
                            {dueBadge && !hasUnpaidPrevious ? (
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest",
                                  dueBadge.className
                                )}
                              >
                                {dueBadge.label}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-3xl font-black uppercase tracking-tighter text-foreground">
                            {formatBRL(inst.amount)}
                          </p>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                              Projeto
                            </p>
                            <p className="text-xs font-bold text-foreground/75">
                              {invoice.project?.name ||
                                projectName ||
                                "Projeto"}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground/60">
                              Vencimento em{" "}
                              {format(
                                new Date(inst.dueDate),
                                "dd 'de' MMMM 'de' yyyy",
                                {
                                  locale: ptBR,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
                        {inst.status !== "PAID" ? (
                          <>
                            <Button
                              onClick={() => handleStripePayment(inst)}
                              disabled={!!isStripeLoading || hasUnpaidPrevious}
                              className={cn(
                                "h-14 px-10 rounded-2xl font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all gap-3",
                                hasUnpaidPrevious
                                  ? "bg-muted text-muted-foreground/50 border-none shadow-none pointer-events-none"
                                  : "bg-brand-primary text-white shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95"
                              )}
                            >
                              {isStripeLoading === inst.id ? (
                                <Clock className="size-4 animate-spin" />
                              ) : (
                                <CreditCard weight="fill" className="size-5" />
                              )}
                              {hasUnpaidPrevious ? "Bloqueado" : "Pagar Agora"}
                            </Button>

                            {isAdmin && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedInstallment(inst)
                                  setIsPaymentDialogOpen(true)
                                }}
                                className="h-14 px-8 rounded-2xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 font-mono text-[10px] font-black uppercase tracking-widest"
                              >
                                Baixa Manual
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="text-right mr-4 hidden md:block">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                Pago em
                              </p>
                              <p className="text-xs font-bold text-emerald-600/60">
                                {inst.paidAt
                                  ? format(
                                      new Date(inst.paidAt),
                                      "dd 'de' MMMM",
                                      { locale: ptBR }
                                    )
                                  : "-"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              className="h-14 px-6 rounded-2xl text-muted-foreground/40 hover:text-brand-primary transition-all font-mono text-[9px] font-black uppercase tracking-[0.2em] gap-2"
                            >
                              <FilePdf size={18} weight="fill" />
                              Recibo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="rounded-[3rem] sm:max-w-[500px] border-border/10 bg-background/95 backdrop-blur-3xl p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tighter text-foreground">
              Baixa Manual
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterPayment} className="space-y-8">
            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-2">
                  Valor a ser liquidado
                </p>
                <p className="text-4xl font-black text-emerald-700 tracking-tighter">
                  {selectedInstallment
                    ? formatBRL(selectedInstallment.amount)
                    : "R$ 0,00"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">
                  Origem do Recurso
                </label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/40 bg-muted/5 px-6 font-bold text-sm">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl">
                    <SelectItem value="PIX">PIX Direto</SelectItem>
                    <SelectItem value="TED">Transferência Bancária</SelectItem>
                    <SelectItem value="CASH">Dinheiro / Espécie</SelectItem>
                    <SelectItem value="OTHER">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">
                  Notas de Auditoria
                </label>
                <textarea
                  name="note"
                  placeholder="Descreva detalhes do recebimento..."
                  className="w-full min-h-[120px] rounded-4xl border border-border/40 bg-muted/5 p-6 font-bold text-sm outline-none focus:border-brand-primary text-foreground resize-none transition-all focus:bg-background"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-16 w-full rounded-2xl bg-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:scale-[1.01] active:scale-95"
            >
              Confirmar Recebimento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
