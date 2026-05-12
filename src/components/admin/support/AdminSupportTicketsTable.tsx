"use client"

import * as React from "react"

import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/src/generated/client"
import { Link, useRouter } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  CaretDown,
  CaretUp,
  CaretUpDown,
  DotsThreeVertical,
  Funnel,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/src/components/support/SupportTicketBadges"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Input } from "@/src/components/ui/input"
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

import { updateSupportTicketStatusAction } from "@/src/lib/actions/support.actions"
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_LABELS,
  formatSupportSlaCountdown,
} from "@/src/lib/utils/support"
import { SupportTicketRecord } from "@/src/types/support"

type SortKey =
  | "client"
  | "subject"
  | "status"
  | "priority"
  | "updatedAt"

const STATUS_FILTERS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_CLIENT",
  "ANSWERED",
  "RESOLVED",
  "CLOSED",
] as const

const PRIORITY_FILTERS = ["ALL", "LOW", "NORMAL", "HIGH", "URGENT"] as const

export function AdminSupportTicketsTable({
  tickets,
}: {
  tickets: SupportTicketRecord[]
}): React.JSX.Element {
  const router = useRouter()
  const [items, setItems] = React.useState(tickets)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]>("ALL")
  const [priorityFilter, setPriorityFilter] =
    React.useState<(typeof PRIORITY_FILTERS)[number]>("ALL")
  const [sort, setSort] = React.useState<{
    key: SortKey
    direction: "asc" | "desc" | null
  }>({
    key: "updatedAt",
    direction: "desc",
  })
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key, direction: null }
        return { key, direction: "asc" }
      }

      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (key: SortKey) => {
    if (sort.key !== key || !sort.direction) {
      return <CaretUpDown className="size-3 opacity-30" />
    }

    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
  }

  const filteredItems = React.useMemo(() => {
    let result = [...items]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter((ticket) =>
        [
          ticket.subject,
          ticket.client.companyName ?? "",
          ticket.client.name ?? "",
          ticket.client.email,
          String(ticket.number),
        ].some((value) => value.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((ticket) => ticket.status === statusFilter)
    }

    if (priorityFilter !== "ALL") {
      result = result.filter((ticket) => ticket.priority === priorityFilter)
    }

    if (sort.direction) {
      result.sort((a, b) => {
        const direction = sort.direction === "asc" ? 1 : -1

        switch (sort.key) {
          case "client":
            return (
              (a.client.companyName ?? a.client.name ?? "").localeCompare(
                b.client.companyName ?? b.client.name ?? ""
              ) * direction
            )
          case "subject":
            return a.subject.localeCompare(b.subject) * direction
          case "status":
            return a.status.localeCompare(b.status) * direction
          case "priority":
            return a.priority.localeCompare(b.priority) * direction
          case "updatedAt":
          default:
            return (
              (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
              direction
            )
        }
      })
    }

    return result
  }, [items, priorityFilter, search, sort, statusFilter])

  const handleStatusUpdate = async (
    ticketId: string,
    status: SupportTicketStatus
  ) => {
    const current = items.find((ticket) => ticket.id === ticketId)
    if (!current) return

    const result = await updateSupportTicketStatusAction({
      ticketId,
      status,
      priority: current.priority,
    })

    if (!result.success) {
      toast.error("Não foi possível atualizar o ticket.")
      return
    }

    toast.success("Ticket atualizado.")
    setItems((currentItems) =>
      currentItems.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
              updatedAt: new Date().toISOString(),
            }
          : ticket
      )
    )
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="group relative flex-1">
          <MagnifyingGlass
            weight="bold"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ticket, cliente, empresa ou e-mail..."
            className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 px-3 text-muted-foreground/40">
            <Funnel weight="bold" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Filtros
            </span>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as (typeof STATUS_FILTERS)[number])
            }
          >
            <SelectTrigger className="h-12 w-full rounded-2xl border-border/40 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 sm:w-52">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
              {STATUS_FILTERS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {status === "ALL"
                    ? "Todos os status"
                    : SUPPORT_STATUS_LABELS[status as SupportTicketStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) =>
              setPriorityFilter(value as (typeof PRIORITY_FILTERS)[number])
            }
          >
            <SelectTrigger className="h-12 w-full rounded-2xl border-border/40 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 sm:w-48">
              <SelectValue placeholder="Todas as prioridades" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
              {PRIORITY_FILTERS.map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {priority === "ALL"
                    ? "Todas as prioridades"
                    : SUPPORT_PRIORITY_LABELS[
                        priority as SupportTicketPriority
                      ]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("client")}
              >
                <div className="flex items-center gap-2">
                  Cliente {getSortIcon("client")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("subject")}
              >
                <div className="flex items-center gap-2">
                  Ticket {getSortIcon("subject")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-2">
                  Prioridade {getSortIcon("priority")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Projeto
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                SLA
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("updatedAt")}
              >
                <div className="flex items-center gap-2">
                  Atualização {getSortIcon("updatedAt")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  Nenhum ticket encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                        {ticket.client.companyName ?? ticket.client.name ?? "Cliente"}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60">
                        {ticket.client.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-foreground/85">
                        {ticket.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                          #{ticket.number}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/35">
                          {SUPPORT_CATEGORY_LABELS[ticket.category]}
                        </span>
                        {ticket.adminUnreadCount > 0 && (
                          <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-brand-primary">
                            {ticket.adminUnreadCount} nova(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <SupportStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <SupportPriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    {ticket.project ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-foreground/80">
                          {ticket.project.name}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                          Vinculado
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/45">
                        Sem projeto
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-foreground/80">
                        {formatSupportSlaCountdown(ticket.slaDeadlineAt, now)}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {ticket.slaDeadlineAt
                          ? new Date(ticket.slaDeadlineAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Sem prazo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground/75">
                        {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {new Date(ticket.updatedAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                        title="Abrir ticket"
                      >
                        <Link
                          href={{
                            pathname: "/admin/support/[id]",
                            params: { id: ticket.id },
                          }}
                        >
                          <ArrowSquareOut weight="bold" size={16} />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                          >
                            <DotsThreeVertical weight="bold" className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-[1.5rem] border-border/40 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                        >
                          <DropdownMenuLabel className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                            Atualizar status
                          </DropdownMenuLabel>
                          {(
                            [
                              "OPEN",
                              "IN_PROGRESS",
                              "WAITING_FOR_CLIENT",
                              "ANSWERED",
                              "RESOLVED",
                              "CLOSED",
                            ] as SupportTicketStatus[]
                          ).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => void handleStatusUpdate(ticket.id, status)}
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              {status.replaceAll("_", " ")}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="my-1.5 bg-border/40" />
                          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary">
                            <Link
                              href={{
                                pathname: "/admin/support/[id]",
                                params: { id: ticket.id },
                              }}
                            >
                              Ver atendimento
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/15 px-8 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            {filteredItems.length} ticket(s) encontrado(s)
          </p>
        </div>
      </div>
    </div>
  )
}
