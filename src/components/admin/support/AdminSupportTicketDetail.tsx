"use client"

import * as React from "react"

import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/src/generated/client"
import { Link, useRouter } from "@/src/i18n/navigation"
import { SupportTicketRecord } from "@/src/types/support"
import {
  ArrowLeft,
  ArrowSquareOut,
  PaperPlaneTilt,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/src/components/support/SupportTicketBadges"

import {
  replySupportTicketAction,
  updateSupportTicketStatusAction,
} from "@/src/lib/actions/support.actions"
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_LABELS,
  formatSupportSlaCountdown,
} from "@/src/lib/utils/support"

export function AdminSupportTicketDetail({
  ticket,
}: {
  ticket: SupportTicketRecord
}): React.JSX.Element {
  const router = useRouter()
  const [message, setMessage] = React.useState("")
  const [internalNote, setInternalNote] = React.useState("")
  const [status, setStatus] = React.useState<SupportTicketStatus>(ticket.status)
  const [priority, setPriority] = React.useState<SupportTicketPriority>(
    ticket.priority
  )
  const [sendingReply, setSendingReply] = React.useState(false)
  const [sendingNote, setSendingNote] = React.useState(false)
  const [savingMeta, setSavingMeta] = React.useState(false)
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  const handleReply = async (isInternal: boolean) => {
    const content = isInternal ? internalNote : message
    if (!content.trim()) return

    if (isInternal) {
      setSendingNote(true)
    } else {
      setSendingReply(true)
    }

    const result = await replySupportTicketAction({
      ticketId: ticket.id,
      content,
      isInternal,
    })

    if (!result.success) {
      toast.error("Não foi possível enviar a mensagem.")
      setSendingReply(false)
      setSendingNote(false)
      return
    }

    toast.success(isInternal ? "Nota interna salva." : "Resposta enviada.")
    setMessage("")
    setInternalNote("")
    router.refresh()
    setSendingReply(false)
    setSendingNote(false)
  }

  const handleMetaUpdate = async () => {
    setSavingMeta(true)
    const result = await updateSupportTicketStatusAction({
      ticketId: ticket.id,
      status,
      priority,
    })

    if (!result.success) {
      toast.error("Não foi possível atualizar o ticket.")
      setSavingMeta(false)
      return
    }

    toast.success("Ticket atualizado.")
    router.refresh()
    setSavingMeta(false)
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 border-b border-border/20 pb-8">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para tickets
        </Link>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              Atendimento via CRM
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
              Toda a conversa, o contexto do cliente e a gestão interna do
              atendimento ficam registrados aqui no CRM.
            </p>
          </div>

          <div className="grid gap-5 border-l border-border/20 pl-0 xl:pl-8">
            <MetaBlock
              label="Cliente"
              value={
                ticket.client.companyName ?? ticket.client.name ?? "Cliente"
              }
              supporting={ticket.client.email}
            />
            <MetaBlock
              label="Projeto"
              value={ticket.project?.name ?? "Sem projeto vinculado"}
            />
            <MetaBlock
              label="Criado em"
              value={new Date(ticket.createdAt).toLocaleString("pt-BR")}
            />
            <MetaBlock
              label="SLA atual"
              value={formatSupportSlaCountdown(ticket.slaDeadlineAt, now)}
              supporting={
                ticket.slaDeadlineAt
                  ? `Prazo em ${new Date(ticket.slaDeadlineAt).toLocaleString("pt-BR")}`
                  : undefined
              }
            />
          </div>
        </div>
      </header>

      <section className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <Tabs defaultValue="messages" className="gap-0">
            <TabsList
              variant="line"
              className="w-full justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-none border-b border-border/15 px-0 py-0"
            >
              <TabsTrigger
                value="messages"
                className="h-11 flex-none rounded-none px-0 pr-6 text-[10px] font-black uppercase tracking-[0.18em]"
              >
                Atendimento
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="h-11 flex-none rounded-none px-0 pr-6 text-[10px] font-black uppercase tracking-[0.18em]"
              >
                Notas internas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-8 pt-8">
              <div className="space-y-5">
                {ticket.messages
                  ?.filter((messageItem) => !messageItem.isInternal)
                  .map((messageItem) => {
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
                            {isClient ? "Cliente" : "Equipe MAGUI"}
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

              <Separator className="bg-border/15" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    Responder cliente
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Escreva uma resposta clara, objetiva e alinhada com o atendimento..."
                    className="min-h-40 rounded-none border-x-0 border-t-0 border-b border-border/30 bg-transparent px-0 py-4 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleReply(false)}
                    disabled={sendingReply || !message.trim()}
                    className="h-12 rounded-none px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white"
                  >
                    <PaperPlaneTilt className="mr-2 size-4" />
                    {sendingReply ? "Enviando..." : "Enviar resposta"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 pt-8">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/76">
                Use este espaço para registrar decisões internas, contexto
                comercial ou observações operacionais. Essas notas não aparecem
                para o cliente.
              </p>
              <Textarea
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Ex.: cliente pediu ajuste fora do escopo, aguardando validação comercial..."
                className="min-h-44 rounded-none border border-border/25 bg-transparent px-4 py-4 shadow-none focus-visible:ring-0"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleReply(true)}
                  disabled={sendingNote || !internalNote.trim()}
                  className="h-12 rounded-none px-8 text-[10px] font-black uppercase tracking-[0.24em]"
                >
                  {sendingNote ? "Salvando..." : "Salvar nota interna"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-8 border-l border-border/20 pl-0 xl:pl-8">
          <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/55">
              Gestão do ticket
            </p>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as SupportTicketStatus)
                }
              >
                <SelectTrigger className="h-12 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent px-0 text-[10px] font-black uppercase tracking-[0.18em] shadow-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/30 bg-background">
                  {(
                    [
                      "OPEN",
                      "IN_PROGRESS",
                      "WAITING_FOR_CLIENT",
                      "ANSWERED",
                      "RESOLVED",
                      "CLOSED",
                    ] as SupportTicketStatus[]
                  ).map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="text-[10px] font-black uppercase tracking-[0.18em]"
                    >
                      {SUPPORT_STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Prioridade
              </Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as SupportTicketPriority)
                }
              >
                <SelectTrigger className="h-12 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent px-0 text-[10px] font-black uppercase tracking-[0.18em] shadow-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/30 bg-background">
                  {(
                    [
                      "LOW",
                      "NORMAL",
                      "HIGH",
                      "URGENT",
                    ] as SupportTicketPriority[]
                  ).map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="text-[10px] font-black uppercase tracking-[0.18em]"
                    >
                      {SUPPORT_PRIORITY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => void handleMetaUpdate()}
              disabled={savingMeta}
              className="mt-3 h-12 w-full rounded-none text-[10px] font-black uppercase tracking-[0.24em] text-white"
            >
              {savingMeta ? "Salvando..." : "Atualizar ticket"}
            </Button>
          </section>

          {ticket.project && (
            <>
              <Separator className="bg-border/15" />
              <section className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/55">
                  Projeto vinculado
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-none justify-between px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link
                    href={{
                      pathname: "/admin/projects/[id]",
                      params: { id: ticket.project.id },
                    }}
                  >
                    {ticket.project.name}
                    <ArrowSquareOut className="size-4" />
                  </Link>
                </Button>
              </section>
            </>
          )}

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
  supporting,
}: {
  label: string
  value: string
  supporting?: string
}): React.JSX.Element {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
        {label}
      </p>
      <p className="text-sm font-bold leading-relaxed text-foreground/82">
        {value}
      </p>
      {supporting ? (
        <p className="text-xs text-muted-foreground/65">{supporting}</p>
      ) : null}
    </div>
  )
}
