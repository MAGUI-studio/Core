"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProposalStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  CaretDown,
  CaretUp,
  CaretUpDown,
  Copy,
  DotsThreeVertical,
  DownloadSimple,
  Funnel,
  LinkSimple,
  MagnifyingGlass,
  Trash,
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

import { ProposalContractDrawer } from "@/src/components/admin/proposals/ProposalContractDrawer"

import {
  deleteProposalAction,
  duplicateProposalAction,
  updateProposalStatusAction,
} from "@/src/lib/actions/proposal.actions"
import { buildProposalPublicPath } from "@/src/lib/proposals/public-links"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ProposalRecord {
  id: string
  number: number
  title: string
  status: ProposalStatus
  validUntil: Date | string | null
  totalValue: number
  currency: string
  createdAt: Date | string
  lead: {
    id: string
    companyName: string
    instagram?: string | null
  }
}

interface ProposalsOverviewListProps {
  proposals: ProposalRecord[]
}

const PROPOSAL_STATUS_OPTIONS: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]

type SortConfig = {
  key: "title" | "company" | "value" | "date" | "status"
  direction: "asc" | "desc" | null
}

export function ProposalsOverviewList({
  proposals,
}: ProposalsOverviewListProps): React.JSX.Element {
  const t = useTranslations("Proposals.status")
  const tList = useTranslations("Proposals.list")
  const tCommon = useTranslations("Admin.crm")
  const [items, setItems] = React.useState(proposals)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [sort, setSort] = React.useState<SortConfig>({
    key: "date",
    direction: "desc",
  })
  const [selectedProposalForContract, setSelectedProposalForContract] =
    React.useState<{
      id: string
      title: string
      companyName: string
    } | null>(null)

  const buildPublicProposalUrl = React.useCallback(
    (proposal: ProposalRecord) => {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL ?? "")

      return `${origin}${buildProposalPublicPath(
        proposal.lead.instagram,
        proposal.id
      )}`
    },
    []
  )

  const handleCopyPublicLink = async (proposal: ProposalRecord) => {
    await navigator.clipboard.writeText(buildPublicProposalUrl(proposal))
    toast.success("Link público da proposta copiado")
  }

  const handleDelete = async (id: string) => {
    const result = await deleteProposalAction(id)
    if (result.success) {
      toast.success(tList("messages.deleteSuccess"))
      setItems((current) => current.filter((proposal) => proposal.id !== id))
    } else {
      toast.error(tList("messages.deleteError"))
    }
  }

  const handleDuplicate = async (id: string) => {
    const result = await duplicateProposalAction(id)
    if (result.success && result.proposal) {
      toast.success(tList("messages.duplicateSuccess"))
      // In a real app, we might want to refresh the page or push the new item
      // For simplicity here, let's just refresh current data if we have access to a refetcher
      // Since this is a server component data, router.refresh() is better
      window.location.reload()
    } else {
      toast.error(tList("messages.duplicateError"))
    }
  }

  const handleStatusChange = async (id: string, status: ProposalStatus) => {
    const currentProposal = items.find((proposal) => proposal.id === id)
    if (
      !currentProposal ||
      currentProposal.status === "ACCEPTED" ||
      currentProposal.status === "REJECTED" ||
      currentProposal.status === status
    ) {
      return
    }

    const result = await updateProposalStatusAction(id, status)
    if (result.success) {
      toast.success(tList("messages.statusSuccess"))
      setItems((current) =>
        current.map((proposal) =>
          proposal.id === id ? { ...proposal, status } : proposal
        )
      )
    } else {
      toast.error(tList("messages.statusError"))
    }
  }

  const handleGenerateContract = (proposal: ProposalRecord) => {
    setSelectedProposalForContract({
      id: proposal.id,
      title: proposal.title,
      companyName: proposal.lead.companyName,
    })
  }

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

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...items]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.lead.companyName.toLowerCase().includes(query) ||
          p.number.toString().includes(query)
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter)
    }

    if (sort.direction) {
      result.sort((a, b) => {
        let valA: string | number = ""
        let valB: string | number = ""

        switch (sort.key) {
          case "title":
            valA = a.title.toLowerCase()
            valB = b.title.toLowerCase()
            break
          case "company":
            valA = a.lead.companyName.toLowerCase()
            valB = b.lead.companyName.toLowerCase()
            break
          case "value":
            valA = a.totalValue
            valB = b.totalValue
            break
          case "date":
            valA = new Date(a.createdAt).getTime()
            valB = new Date(b.createdAt).getTime()
            break
          case "status":
            valA = a.status
            valB = b.status
            break
        }

        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [items, search, statusFilter, sort])

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[8px] font-black uppercase text-emerald-600">
            {t("ACCEPTED")}
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="border-red-500/20 bg-red-500/10 text-[8px] font-black uppercase text-red-600">
            {t("REJECTED")}
          </Badge>
        )
      case "SENT":
        return (
          <Badge className="border-blue-500/20 bg-blue-500/10 text-[8px] font-black uppercase text-blue-600">
            {t("SENT")}
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge className="border-border/50 bg-muted text-[8px] font-black uppercase text-muted-foreground">
            {t("EXPIRED")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[8px] font-black uppercase">
            {t("DRAFT")}
          </Badge>
        )
    }
  }

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sort.key !== key || !sort.direction)
      return <CaretUpDown className="size-3 opacity-30" />
    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
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
            placeholder={tList("searchPlaceholder")}
            className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 text-muted-foreground/40">
            <Funnel weight="bold" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {tList("filtersLabel")}
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
                {tList("statusAll")}
              </SelectItem>
              {PROPOSAL_STATUS_OPTIONS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {t(status)}
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
                  {tList("table.company")} {getSortIcon("company")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-2">
                  {tList("table.proposal")} {getSortIcon("title")}
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
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center gap-2">
                  {tList("table.value")} {getSortIcon("value")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  {tList("table.date")} {getSortIcon("date")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {tList("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  {tList("empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((proposal) => {
                const isLockedStatus =
                  proposal.status === "ACCEPTED" ||
                  proposal.status === "REJECTED"

                return (
                  <TableRow
                    key={proposal.id}
                    className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                  >
                    <TableCell className="px-8 py-6">
                      <Link
                        href={{
                          pathname: "/admin/crm/leads/[id]/proposals",
                          params: { id: proposal.lead.id },
                        }}
                        className="font-heading text-sm font-black uppercase tracking-tight text-foreground transition-colors hover:text-brand-primary"
                      >
                        {proposal.lead.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-foreground/80">
                          {proposal.title}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                          #{proposal.number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      {getStatusBadge(proposal.status)}
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="font-sans text-xs font-black text-foreground/90">
                        {formatCurrencyBRLFromCents(proposal.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/70">
                          {new Date(proposal.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                        {proposal.validUntil && (
                          <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
                            Val:{" "}
                            {new Date(proposal.validUntil).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                          title={tList("openPdf")}
                        >
                          <a
                            href={`/api/proposals/${proposal.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ArrowSquareOut weight="bold" size={16} />
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
                                {tList("exportLabel")}
                              </p>
                            </div>
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <a
                                href={`/api/proposals/${proposal.id}/pdf?download=1`}
                                download={`proposta-${proposal.number}.pdf`}
                              >
                                <DownloadSimple className="mr-2 size-4" />{" "}
                                {tList("downloadPdf")}
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <a
                                href={buildPublicProposalUrl(proposal)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LinkSimple className="mr-2 size-4" /> Abrir
                                link público
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                void handleCopyPublicLink(proposal)
                              }
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Copy className="mr-2 size-4" /> Copiar link
                              público
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(proposal.id)}
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Copy className="mr-2 size-4" />{" "}
                              {tList("duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleGenerateContract(proposal)}
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <ArrowSquareOut className="mr-2 size-4" /> Gerar
                              contrato
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                            <div className="px-3 py-2">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                                {tList("statusLabel")}
                              </p>
                            </div>
                            <DropdownMenuItem
                              disabled={
                                isLockedStatus || proposal.status === "SENT"
                              }
                              onClick={() =>
                                handleStatusChange(proposal.id, "SENT")
                              }
                              className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-blue-500/10 focus:text-blue-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                            >
                              {tList("markAs", { status: t("SENT") })}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                isLockedStatus || proposal.status === "ACCEPTED"
                              }
                              onClick={() =>
                                handleStatusChange(proposal.id, "ACCEPTED")
                              }
                              className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-emerald-500/10 focus:text-emerald-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                            >
                              {tList("markAs", { status: t("ACCEPTED") })}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                isLockedStatus || proposal.status === "REJECTED"
                              }
                              onClick={() =>
                                handleStatusChange(proposal.id, "REJECTED")
                              }
                              className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-red-500/10 focus:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                            >
                              {tList("markAs", { status: t("REJECTED") })}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                            <DropdownMenuItem
                              onClick={() => handleDelete(proposal.id)}
                              className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash className="mr-2 size-4" />{" "}
                              {tList("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/15 px-8 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            {tList("summary", { count: filteredAndSortedItems.length })}
          </p>
        </div>
      </div>

      <ProposalContractDrawer
        proposal={selectedProposalForContract}
        open={Boolean(selectedProposalForContract)}
        onOpenChange={(open) => {
          if (!open) setSelectedProposalForContract(null)
        }}
      />
    </div>
  )
}
