"use client"

import * as React from "react"

import { DocumentStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  CaretDown,
  CaretUp,
  CaretUpDown,
  DotsThreeVertical,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { updateDocumentStatusAction } from "@/src/lib/actions/document.actions"

type ContractRecord = {
  id: string
  title: string
  status: DocumentStatus
  companyName: string
  proposalTitle: string | null
  projectName: string | null
  clientId: string | null
  projectId: string | null
  createdAt: Date | string
  updatedAt: Date | string
  latestVersionNumber: number
}

interface ContractsOverviewListProps {
  contracts: ContractRecord[]
}

const DOCUMENT_STATUS_OPTIONS: DocumentStatus[] = [
  "DRAFT",
  "SENT",
  "SIGNED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]

type SortConfig = {
  key: "company" | "title" | "status" | "date" | "version"
  direction: "asc" | "desc" | null
}

function getStatusBadge(status: DocumentStatus) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[8px] font-black uppercase text-emerald-600">
          Concluído
        </Badge>
      )
    case "SIGNED":
      return (
        <Badge className="border-sky-500/20 bg-sky-500/10 text-[8px] font-black uppercase text-sky-600">
          Assinado
        </Badge>
      )
    case "SENT":
      return (
        <Badge className="border-blue-500/20 bg-blue-500/10 text-[8px] font-black uppercase text-blue-600">
          Enviado
        </Badge>
      )
    case "VIEWED":
      return (
        <Badge className="border-violet-500/20 bg-violet-500/10 text-[8px] font-black uppercase text-violet-600">
          Visualizado
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge className="border-red-500/20 bg-red-500/10 text-[8px] font-black uppercase text-red-600">
          Rejeitado
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge className="border-rose-500/20 bg-rose-500/10 text-[8px] font-black uppercase text-rose-600">
          Cancelado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[8px] font-black uppercase">
          Rascunho
        </Badge>
      )
  }
}

export function ContractsOverviewList({
  contracts,
}: ContractsOverviewListProps): React.JSX.Element {
  const [items, setItems] = React.useState(contracts)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [sort, setSort] = React.useState<SortConfig>({
    key: "date",
    direction: "desc",
  })

  const handleSort = (key: SortConfig["key"]) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key, direction: null }
        return { key, direction: "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sort.key !== key || !sort.direction) {
      return <CaretUpDown className="size-3 opacity-30" />
    }

    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
  }

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...items]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (contract) =>
          contract.title.toLowerCase().includes(query) ||
          contract.companyName.toLowerCase().includes(query) ||
          (contract.proposalTitle || "").toLowerCase().includes(query) ||
          (contract.projectName || "").toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((contract) => contract.status === statusFilter)
    }

    if (sort.direction) {
      result.sort((a, b) => {
        let valA: string | number = ""
        let valB: string | number = ""

        switch (sort.key) {
          case "company":
            valA = a.companyName.toLowerCase()
            valB = b.companyName.toLowerCase()
            break
          case "title":
            valA = a.title.toLowerCase()
            valB = b.title.toLowerCase()
            break
          case "status":
            valA = a.status
            valB = b.status
            break
          case "version":
            valA = a.latestVersionNumber
            valB = b.latestVersionNumber
            break
          case "date":
            valA = new Date(a.createdAt).getTime()
            valB = new Date(b.createdAt).getTime()
            break
        }

        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [items, search, sort, statusFilter])

  const handleStatusChange = async (id: string, status: DocumentStatus) => {
    const currentContract = items.find((contract) => contract.id === id)
    if (!currentContract || currentContract.status === status) {
      return
    }

    const result = await updateDocumentStatusAction({
      documentId: id,
      status,
    })

    if (result.success) {
      toast.success("Status do contrato atualizado.")
      setItems((current) =>
        current.map((contract) =>
          contract.id === id ? { ...contract, status } : contract
        )
      )
    } else {
      toast.error(result.error || "Erro ao atualizar status do contrato.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <MagnifyingGlass
            weight="bold"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contratos por empresa, projeto ou proposta..."
            className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 text-muted-foreground/40">
            <Funnel weight="bold" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Filtros
            </span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-44 rounded-2xl border-border/40 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
              <SelectItem
                value="ALL"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Todos os status
              </SelectItem>
              {DOCUMENT_STATUS_OPTIONS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {getStatusBadge(status).props.children}
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
                onClick={() => handleSort("company")}
              >
                <div className="flex items-center gap-2">
                  Empresa {getSortIcon("company")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-2">
                  Contrato {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Origem
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
                onClick={() => handleSort("version")}
              >
                <div className="flex items-center gap-2">
                  Versão {getSortIcon("version")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  Criado em {getSortIcon("date")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  Nenhum contrato encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((contract) => (
                <TableRow
                  key={contract.id}
                  className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                >
                  <TableCell className="px-8 py-6">
                    <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                      {contract.companyName}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-foreground/80">
                        {contract.title}
                      </span>
                      {contract.projectName ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                          Projeto: {contract.projectName}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground/70">
                        {contract.proposalTitle || "Sem proposta vinculada"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                      v{contract.latestVersionNumber}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground/70">
                        {new Date(contract.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
                        Atualizado em{" "}
                        {new Date(contract.updatedAt).toLocaleDateString(
                          "pt-BR"
                        )}
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
                        title="Abrir PDF"
                      >
                        <a
                          href={`/api/documents/${contract.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowSquareOut weight="bold" size={16} />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                        title="Baixar PDF"
                      >
                        <a
                          href={`/api/documents/${contract.id}/pdf?download=1`}
                          download
                        >
                          <DownloadSimple weight="bold" size={16} />
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                          >
                            <DotsThreeVertical
                              weight="bold"
                              className="size-5"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-[1.5rem] border-border/40 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Navegação
                            </p>
                          </div>
                          {contract.clientId ? (
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Link
                                href={{
                                  pathname: "/admin/clients/[id]",
                                  params: { id: contract.clientId },
                                }}
                              >
                                Cliente
                              </Link>
                            </DropdownMenuItem>
                          ) : null}
                          {contract.projectId ? (
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Link
                                href={{
                                  pathname: "/admin/projects/[id]",
                                  params: { id: contract.projectId },
                                }}
                              >
                                Projeto
                              </Link>
                            </DropdownMenuItem>
                          ) : null}

                          <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                          <div className="px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                              Status
                            </p>
                          </div>
                          {DOCUMENT_STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() =>
                                handleStatusChange(contract.id, status)
                              }
                              disabled={contract.status === status}
                              className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                            >
                              {getStatusBadge(status).props.children}
                            </DropdownMenuItem>
                          ))}
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
            {filteredAndSortedItems.length} contrato(s)
          </p>
        </div>
      </div>
    </div>
  )
}
