"use client"

import * as React from "react"

import {
  SupportTicketCategory,
  SupportTicketStatus,
} from "@/src/generated/client"
import { Link, useRouter } from "@/src/i18n/navigation"
import { SupportTicketRecord } from "@/src/types/support"
import {
  ArrowSquareOut,
  ClockCountdown,
  MagnifyingGlass,
  PaperPlaneTilt,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { Textarea } from "@/src/components/ui/textarea"

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/src/components/support/SupportTicketBadges"

import { createSupportTicketAction } from "@/src/lib/actions/support.actions"
import { SUPPORT_CATEGORY_LABELS } from "@/src/lib/utils/support"

export function ClientSupportTicketsPage({
  tickets,
  projects,
}: {
  tickets: SupportTicketRecord[]
  projects: { id: string; name: string }[]
}): React.JSX.Element {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] =
    React.useState<SupportTicketCategory>("GENERAL")
  const [projectId, setProjectId] = React.useState<string>("NONE")
  const [submitting, setSubmitting] = React.useState(false)

  const filteredTickets = React.useMemo(() => {
    if (!search) return tickets

    const query = search.toLowerCase()
    return tickets.filter((ticket) =>
      [ticket.subject, String(ticket.number), ticket.project?.name ?? ""].some(
        (value) => value.toLowerCase().includes(query)
      )
    )
  }, [search, tickets])

  const metrics = React.useMemo(
    () => ({
      total: tickets.length,
      active: tickets.filter(
        (ticket) =>
          ticket.status !== SupportTicketStatus.RESOLVED &&
          ticket.status !== SupportTicketStatus.CLOSED
      ).length,
      answered: tickets.filter(
        (ticket) => ticket.status === SupportTicketStatus.ANSWERED
      ).length,
    }),
    [tickets]
  )

  const handleCreateTicket = async () => {
    setSubmitting(true)
    const result = await createSupportTicketAction({
      subject,
      description,
      priority: "NORMAL",
      category,
      projectId: projectId === "NONE" ? "" : projectId,
    })

    if (!result.success || !result.ticketId) {
      toast.error(result.error ?? "Não foi possível abrir o ticket.")
      setSubmitting(false)
      return
    }

    toast.success("Ticket criado com sucesso.")
    setSubject("")
    setDescription("")
    setCategory("GENERAL")
    setProjectId("NONE")
    router.push({
      pathname: "/support/[id]",
      params: { id: result.ticketId },
    })
    router.refresh()
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              Suporte via CRM
            </p>
            <h1 className="max-w-3xl font-heading text-4xl font-black uppercase tracking-[-0.05em] text-foreground sm:text-6xl">
              Atendimento claro, registrado e sem ruído.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground/78">
              Abra seu ticket pelo portal, acompanhe todo o histórico no mesmo
              lugar e receba resposta da equipe em até 24 horas úteis.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <HeroMetric
              value={String(metrics.total)}
              label="Tickets"
              detail="Histórico total"
            />
            <HeroMetric
              value={String(metrics.active)}
              label="Ativos"
              detail="Em acompanhamento"
            />
            <HeroMetric
              value={String(metrics.answered)}
              label="Respondidos"
              detail="Aguardando você"
            />
          </div>

          <div className="max-w-lg space-y-3 border-l border-border/35 pl-5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/55">
              Como funciona
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/76">
              Você descreve a solicitação, vincula ao projeto correto se
              necessário e a equipe organiza internamente a prioridade do
              atendimento. Assim a fila segue justa, clara e profissional.
            </p>
          </div>
        </div>

        <div className="border border-border/25 bg-background/35 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary">
              Novo ticket
            </p>
            <h2 className="font-heading text-3xl font-black uppercase tracking-[-0.04em] text-foreground">
              Envie sua solicitação
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground/76">
              Quanto mais contexto você trouxer, mais rápido o atendimento
              avança no CRM.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <Field
                label="Assunto"
                field={
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Ex.: ajuste na landing page, dúvida sobre integração..."
                    className="h-13 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  />
                }
              />

              <Field
                label="Categoria"
                field={
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as SupportTicketCategory)
                    }
                  >
                    <SelectTrigger className="h-13 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent px-0 text-[10px] font-black uppercase tracking-[0.18em] shadow-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border/30 bg-background">
                      {(
                        [
                          "GENERAL",
                          "TECHNICAL",
                          "BILLING",
                          "ACCESS",
                          "CHANGE_REQUEST",
                        ] as SupportTicketCategory[]
                      ).map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="text-[10px] font-black uppercase tracking-[0.16em]"
                        >
                          {SUPPORT_CATEGORY_LABELS[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
            </div>

            <Field
              label="Projeto relacionado"
              field={
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="h-13 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent px-0 text-[10px] font-black uppercase tracking-[0.18em] shadow-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border/30 bg-background">
                    <SelectItem
                      value="NONE"
                      className="text-[10px] font-black uppercase tracking-[0.16em]"
                    >
                      Sem projeto específico
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="text-[10px] font-black uppercase tracking-[0.16em]"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <Field
              label="Descreva o que você precisa"
              field={
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explique com o máximo de contexto possível para agilizar o atendimento."
                  className="min-h-40 rounded-none border border-border/25 bg-transparent px-0 py-4 shadow-none focus-visible:ring-0"
                />
              }
            />

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/65">
                A prioridade do ticket é definida internamente pela equipe para
                manter o fluxo de suporte organizado.
              </p>

              <Button
                type="button"
                onClick={() => void handleCreateTicket()}
                disabled={
                  submitting ||
                  subject.trim().length < 4 ||
                  description.trim().length < 10
                }
                className="h-12 rounded-none px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white"
              >
                <PaperPlaneTilt className="mr-2 size-4" />
                {submitting ? "Abrindo ticket..." : "Abrir ticket"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-muted-foreground/55">
              Histórico
            </p>
            <h2 className="font-heading text-3xl font-black uppercase tracking-[-0.04em] text-foreground">
              Seus tickets
            </h2>
          </div>

          <div className="group relative w-full max-w-md">
            <MagnifyingGlass
              weight="bold"
              className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por número, assunto ou projeto..."
              className="h-12 rounded-none border-x-0 border-t-0 border-b border-border/35 bg-transparent pl-7 pr-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="h-16 px-6 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Ticket
                </TableHead>
                <TableHead className="h-16 px-6 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Status
                </TableHead>
                <TableHead className="h-16 px-6 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Prioridade
                </TableHead>
                <TableHead className="h-16 px-6 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Projeto
                </TableHead>
                <TableHead className="h-16 px-6 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Atualização
                </TableHead>
                <TableHead className="h-16 px-6 text-right text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                  >
                    Nenhum ticket encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                  >
                    <TableCell className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {ticket.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                            #{ticket.number}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/35">
                            {SUPPORT_CATEGORY_LABELS[ticket.category]}
                          </span>
                          {ticket.clientUnreadCount > 0 && (
                            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-brand-primary">
                              {ticket.clientUnreadCount} resposta(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <SupportStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <SupportPriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className="text-[11px] font-bold text-foreground/78">
                        {ticket.project?.name ?? "Sem projeto"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/75">
                          {new Date(ticket.updatedAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {new Date(ticket.updatedAt).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                        title="Abrir ticket"
                      >
                        <Link
                          href={{
                            pathname: "/support/[id]",
                            params: { id: ticket.id },
                          }}
                        >
                          <ArrowSquareOut weight="bold" size={16} />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border/15 px-6 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              {filteredTickets.length} ticket(s) encontrado(s)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  field,
}: {
  label: string
  field: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </Label>
      {field}
    </div>
  )
}

function HeroMetric({
  value,
  label,
  detail,
}: {
  value: string
  label: string
  detail: string
}): React.JSX.Element {
  return (
    <div className="space-y-2 border-t border-border/25 pt-4">
      <div className="flex items-end gap-2">
        <strong className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
          {value}
        </strong>
        <ClockCountdown
          className="mb-1 size-4 text-brand-primary"
          weight="duotone"
        />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/70">
        {label}
      </p>
      <p className="text-sm text-muted-foreground/68">{detail}</p>
    </div>
  )
}
