"use client"

import * as React from "react"

import { Link, useRouter } from "@/src/i18n/navigation"
import { SupportTicketRecord } from "@/src/types/support"
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { Textarea } from "@/src/components/ui/textarea"

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/src/components/support/SupportTicketBadges"

import { replySupportTicketAction } from "@/src/lib/actions/support.actions"
import { SUPPORT_CATEGORY_LABELS } from "@/src/lib/utils/support"

export function ClientSupportTicketDetail({
  ticket,
}: {
  ticket: SupportTicketRecord
}): React.JSX.Element {
  const router = useRouter()
  const [message, setMessage] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const handleReply = async () => {
    setSubmitting(true)
    const result = await replySupportTicketAction({
      ticketId: ticket.id,
      content: message,
      isInternal: false,
    })

    if (!result.success) {
      toast.error("Não foi possível enviar sua mensagem.")
      setSubmitting(false)
      return
    }

    toast.success("Mensagem enviada com sucesso.")
    setMessage("")
    router.refresh()
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 border-b border-border/20 pb-8">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para suporte
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              Ticket em andamento
            </p>
            <h1 className="max-w-4xl font-heading text-4xl font-black uppercase tracking-[-0.05em] text-foreground sm:text-6xl">
              {ticket.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <SupportStatusBadge status={ticket.status} />
              <SupportPriorityBadge priority={ticket.priority} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                Ticket #{ticket.number}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                {SUPPORT_CATEGORY_LABELS[ticket.category]}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/76">
              O suporte é realizado pelo CRM e o retorno acontece em até 24
              horas úteis. Se precisar complementar algo, responda neste mesmo
              ticket para manter o histórico organizado.
            </p>
          </div>

          <div className="grid gap-5 border-l border-border/20 pl-0 lg:pl-8">
            <MetaBlock
              label="Projeto"
              value={ticket.project?.name ?? "Sem projeto específico"}
            />
            <MetaBlock
              label="Criado em"
              value={new Date(ticket.createdAt).toLocaleString("pt-BR")}
            />
            <MetaBlock
              label="Última atualização"
              value={new Date(ticket.updatedAt).toLocaleString("pt-BR")}
            />
            <MetaBlock
              label="Prazo do SLA"
              value={
                ticket.slaDeadlineAt
                  ? new Date(ticket.slaDeadlineAt).toLocaleString("pt-BR")
                  : "Até 24h úteis"
              }
            />
          </div>
        </div>
      </header>

      <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/55">
                  Conversa
                </p>
                <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-[-0.04em] text-foreground">
                  Histórico do atendimento
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {ticket.messages?.map((messageItem) => {
                const isClient =
                  messageItem.author?.id === ticket.client.id ||
                  messageItem.author?.role === "CLIENT"

                return (
                  <article
                    key={messageItem.id}
                    className="border-b border-border/15 pb-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/82">
                        {isClient ? "Você" : "Equipe MAGUI"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/58">
                        {new Date(messageItem.createdAt).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-7 text-foreground/84">
                      {messageItem.content}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>

          <Separator className="bg-border/15" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Enviar nova mensagem
              </Label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva aqui sua continuidade, dúvida ou complemento do chamado."
                className="min-h-40 rounded-none border-x-0 border-t-0 border-b border-border/30 bg-transparent px-0 py-4 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => void handleReply()}
                disabled={submitting || message.trim().length < 2}
                className="h-12 rounded-none px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white"
              >
                <PaperPlaneTilt className="mr-2 size-4" />
                {submitting ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-8 border-l border-border/20 pl-0 lg:pl-8">
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/55">
              Resumo
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/74">
              Este ticket centraliza sua solicitação e todas as respostas da
              equipe. Sempre que houver um complemento, continue por aqui para
              preservar o contexto.
            </p>
          </section>

          <Separator className="bg-border/15" />

          <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/55">
              Descrição inicial
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">
              {ticket.description}
            </p>
          </section>
        </aside>
      </section>
    </div>
  )
}

function MetaBlock({
  label,
  value,
}: {
  label: string
  value: string
}): React.JSX.Element {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
        {label}
      </p>
      <p className="text-sm font-bold leading-relaxed text-foreground/82">
        {value}
      </p>
    </div>
  )
}
