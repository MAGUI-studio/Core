"use client"

import * as React from "react"

import { useSearchParams } from "next/navigation"

import { Prisma } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  CreditCard,
  DownloadSimple,
  Receipt,
} from "@phosphor-icons/react"
import { differenceInCalendarDays, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

type ClientInvoice = Prisma.InvoiceGetPayload<{
  include: {
    project: { select: { id: true; name: true } }
    installments: { include: { paymentEvents: true } }
  }
}>

interface ClientFinancialViewProps {
  title?: string
  eyebrow?: string
  invoices: ClientInvoice[]
  verifyingInstallmentId?: string | null
}

export function ClientFinancialView({
  title = "Financeiro",
  eyebrow = "Status Financeiro",
  invoices,
  verifyingInstallmentId,
}: ClientFinancialViewProps): React.JSX.Element {
  const searchParams = useSearchParams()
  const [isStripeLoading, setIsStripeLoading] = React.useState<string | null>(
    null
  )
  const [isReceiptLoading, setIsReceiptLoading] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (searchParams.get("success") && !verifyingInstallmentId) {
      toast.success("Pagamento realizado com sucesso!")
    }
    if (searchParams.get("canceled")) {
      toast.error("O pagamento foi cancelado.")
    }
  }, [searchParams, verifyingInstallmentId])

  const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const paidValue = invoices.reduce(
    (acc, inv) =>
      acc +
      inv.installments
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + i.amount, 0),
    0
  )
  const pendingValue = totalValue - paidValue

  const formatBRL = (cents: number): string => formatCurrencyBRLFromCents(cents)

  const getDueMeta = (dueDate: Date, status: string) => {
    if (status === "PAID") return null

    const diff = differenceInCalendarDays(
      startOfDay(new Date(dueDate)),
      startOfDay(new Date())
    )

    if (diff < 0) {
      return { label: "Atrasado", color: "text-red-600 bg-red-500/10" }
    }

    if (diff === 0) {
      return { label: "Hoje", color: "text-red-600 bg-red-500/10" }
    }

    if (diff <= 5) {
      return { label: `${diff} dias`, color: "text-amber-700 bg-amber-500/10" }
    }

    return null
  }

  const handleStripePayment = async (
    installmentId: string,
    url?: string | null
  ) => {
    if (url) {
      window.open(url, "_blank")
      return
    }

    try {
      setIsStripeLoading(installmentId)
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId }),
      })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, "_blank")
      } else {
        throw new Error(data.error || "Erro ao processar")
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro desconhecido")
    } finally {
      setIsStripeLoading(null)
    }
  }

  const handleReceiptOpen = async (installmentId: string): Promise<void> => {
    try {
      setIsReceiptLoading(installmentId)
      const response = await fetch(
        `/api/stripe/receipt?installmentId=${installmentId}`
      )
      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Comprovante indisponivel")
      }
      window.open(data.url, "_blank")
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao abrir comprovante"
      )
    } finally {
      setIsReceiptLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-16">
      <section className="grid grid-cols-1 gap-1 md:grid-cols-3">
        <div className="bg-muted/10 p-10 md:rounded-l-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
            Total
          </p>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-[-0.05em] text-foreground lg:text-5xl">
            {formatBRL(totalValue)}
          </h2>
        </div>
        <div className="bg-emerald-500/5 p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600/60">
            Compensado
          </p>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-[-0.05em] text-emerald-700 lg:text-5xl">
            {formatBRL(paidValue)}
          </h2>
        </div>
        <div className="bg-red-500/5 p-10 md:rounded-r-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/60">
            Pendente
          </p>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-[-0.05em] text-red-700 lg:text-5xl">
            {formatBRL(pendingValue)}
          </h2>
        </div>
      </section>

      <div className="space-y-12">
        <header>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-heading text-5xl font-black uppercase tracking-[-0.05em]">
            {title}
          </h3>
        </header>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-muted/5 py-24 md:rounded-2xl">
            <Receipt
              className="size-16 text-muted-foreground/20"
              weight="thin"
            />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
              Sem registros
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {invoices.map((invoice) => (
              <section key={invoice.id} className="group">
                <div className="mb-8 flex items-end justify-between border-b-2 border-foreground/5 pb-4">
                  <div>
                    <h4 className="font-heading text-3xl font-black uppercase tracking-tight">
                      {invoice.title}
                    </h4>
                    {invoice.project?.name ? (
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                        Projeto: {invoice.project.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-px overflow-hidden bg-foreground/5 md:rounded-2xl">
                  {invoice.installments.map((inst) => {
                    const due = getDueMeta(inst.dueDate, inst.status)
                    const isPaid = inst.status === "PAID"
                    const isVerifying = verifyingInstallmentId === inst.id

                    return (
                      <div
                        key={inst.id}
                        className="grid grid-cols-1 gap-8 bg-background p-8 md:grid-cols-[1fr_auto]"
                      >
                        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Parcela
                            </p>
                            <p className="mt-1 text-xl font-black uppercase tracking-tight">
                              #{inst.number}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Valor
                            </p>
                            <p className="mt-1 text-2xl font-black uppercase tracking-tight">
                              {formatBRL(inst.amount)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Vencimento
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-bold uppercase">
                                {format(new Date(inst.dueDate), "dd MMM yyyy", {
                                  locale: ptBR,
                                })}
                              </span>
                              {due ? (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${due.color}`}
                                >
                                  {due.label}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Status
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              {isVerifying && !isPaid ? (
                                <>
                                  <div className="size-2 animate-pulse rounded-full bg-amber-500" />
                                  <span className="text-sm font-black uppercase tracking-widest text-amber-600">
                                    Verificando...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div
                                    className={`size-2 rounded-full ${isPaid ? "bg-emerald-500" : "bg-red-500"}`}
                                  />
                                  <span className="text-sm font-black uppercase tracking-widest">
                                    {isPaid ? "Pago" : "Aberto"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isPaid ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleReceiptOpen(inst.id)}
                              disabled={isReceiptLoading === inst.id}
                              className="h-12 rounded-full bg-muted/10 px-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/20"
                            >
                              <DownloadSimple
                                className="mr-2 size-4"
                                weight="bold"
                              />
                              Recibo
                            </Button>
                          ) : isVerifying ? (
                            <Button
                              disabled
                              className="h-12 rounded-full bg-muted/20 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
                            >
                              Sincronizando...
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                handleStripePayment(
                                  inst.id,
                                  inst.stripeCheckoutUrl
                                )
                              }
                              disabled={isStripeLoading === inst.id}
                              className="h-12 rounded-full bg-foreground px-8 text-[10px] font-black uppercase tracking-[0.2em] text-background hover:bg-foreground/90"
                            >
                              <CreditCard
                                className="mr-2 size-4"
                                weight="bold"
                              />
                              Pagar
                            </Button>
                          )}

                          {invoice.project?.id ? (
                            <Button
                              asChild
                              variant="ghost"
                              className="h-12 w-12 rounded-full p-0"
                            >
                              <Link
                                href={{
                                  pathname: "/projects/[id]",
                                  params: { id: invoice.project.id },
                                }}
                              >
                                <ArrowSquareOut
                                  className="size-5"
                                  weight="bold"
                                />
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
