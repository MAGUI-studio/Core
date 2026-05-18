"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadSource, LeadStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretUpIcon,
  CaretUpDownIcon,
  DotsThreeVerticalIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  SealWarningIcon,
  TrashIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
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

import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"
import { deleteLead } from "@/src/lib/actions/crm.actions"

import {
  formatLeadPhone,
  getLeadDaysWithoutMovement,
  getNextActionMeta,
  isLeadStagnant,
} from "@/src/lib/utils/crm"

interface LeadsTableProps {
  leads: Lead[]
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
}

type SortConfig = {
  key: "company" | "contact" | "status" | "source" | "updatedAt"
  direction: "asc" | "desc" | null
}

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  LeadStatus.GARIMPAGEM,
  LeadStatus.CONTATO_REALIZADO,
  LeadStatus.NEGOCIACAO,
  LeadStatus.CONVERTIDO,
  LeadStatus.DESCARTADO,
]

const LEAD_SOURCE_OPTIONS: LeadSource[] = [
  LeadSource.REFERRAL,
  LeadSource.ORGANIC,
  LeadSource.INSTAGRAM,
  LeadSource.LINKEDIN,
  LeadSource.WEBSITE,
  LeadSource.OUTBOUND,
  LeadSource.EVENT,
  LeadSource.OTHER,
]

function getInstagramHandle(instagramUrl: string): string {
  const cleanedValue = instagramUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^\/+|\/+$/g, "")

  if (!cleanedValue) {
    return "@instagram"
  }

  return `@${cleanedValue.replace(/^@+/, "")}`
}

function getWebsiteLabel(websiteUrl: string): string {
  try {
    const normalizedUrl = websiteUrl.startsWith("http")
      ? websiteUrl
      : `https://${websiteUrl}`
    const url = new URL(normalizedUrl)
    return url.hostname.replace(/^www\./i, "")
  } catch {
    return websiteUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "")
  }
}

function buildInstagramUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  return `https://instagram.com/${value.replace(/^@/, "").replace(/^\/+|\/+$/g, "")}`
}

function getLeadTemperature(source: LeadSource): {
  icon: string | null
  label: string | null
} {
  switch (source) {
    case LeadSource.WEBSITE:

    case LeadSource.LINKEDIN:
    case LeadSource.REFERRAL:
    case LeadSource.ORGANIC:
      return { icon: "🔥", label: "Lead quente" }
    case LeadSource.INSTAGRAM:
    case LeadSource.OUTBOUND:
      return { icon: "🧊", label: "Lead frio" }
    default:
      return { icon: null, label: null }
  }
}

export function LeadsTable({ leads }: LeadsTableProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [items, setItems] = React.useState(leads)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [sourceFilter, setSourceFilter] = React.useState<string>("ALL")
  const [prevLeads, setPrevLeads] = React.useState(leads)
  const [sort, setSort] = React.useState<SortConfig>({
    key: "updatedAt",
    direction: "desc",
  })
  const [pendingDeletion, startDeletion] = React.useTransition()

  const formatLeadSourceLabel = React.useCallback(
    (source: LeadSource) => t(`source.${source}`),
    [t]
  )

  if (leads !== prevLeads) {
    setPrevLeads(leads)
    setItems(leads)
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

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sort.key !== key || !sort.direction) {
      return <CaretUpDownIcon className="size-3 opacity-30" />
    }

    return sort.direction === "asc" ? (
      <CaretUpIcon className="size-3 text-brand-primary" />
    ) : (
      <CaretDownIcon className="size-3 text-brand-primary" />
    )
  }

  const handleDelete = (leadId: string) => {
    startDeletion(async () => {
      const result = await deleteLead(leadId)

      if (result.success) {
        setItems((current) => current.filter((lead) => lead.id !== leadId))
        setPrevLeads((current) => current.filter((lead) => lead.id !== leadId))
        toast.success("Lead removido.")
      } else {
        toast.error(result.error ?? "Nao foi possivel remover o lead.")
      }
    })
  }

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...items]

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.companyName.toLowerCase().includes(query) ||
          (lead.contactName ?? "").toLowerCase().includes(query) ||
          (lead.email ?? "").toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((lead) => lead.status === statusFilter)
    }

    if (sourceFilter !== "ALL") {
      result = result.filter((lead) => lead.source === sourceFilter)
    }

    if (sort.direction) {
      result.sort((a, b) => {
        let valueA: string | number = ""
        let valueB: string | number = ""

        switch (sort.key) {
          case "company":
            valueA = a.companyName.toLowerCase()
            valueB = b.companyName.toLowerCase()
            break
          case "contact":
            valueA = (a.contactName ?? a.email ?? "").toLowerCase()
            valueB = (b.contactName ?? b.email ?? "").toLowerCase()
            break
          case "status":
            valueA = a.status
            valueB = b.status
            break
          case "source":
            valueA = a.source
            valueB = b.source
            break
          case "updatedAt":
            valueA = new Date(a.updatedAt).getTime()
            valueB = new Date(b.updatedAt).getTime()
            break
        }

        if (valueA < valueB) return sort.direction === "asc" ? -1 : 1
        if (valueA > valueB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [items, search, sourceFilter, sort, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <MagnifyingGlassIcon
            weight="bold"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por empresa, contato ou e-mail..."
            className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl border-border/40 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
              <SelectItem
                value="ALL"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Todos os status
              </SelectItem>
              {LEAD_STATUS_OPTIONS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl border-border/40 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 sm:w-44">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
              <SelectItem
                value="ALL"
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Todas as origens
              </SelectItem>
              {LEAD_SOURCE_OPTIONS.map((source) => (
                <SelectItem
                  key={source}
                  value={source}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {formatLeadSourceLabel(source)}
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
                  {t("table.company")} {getSortIcon("company")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("contact")}
              >
                <div className="flex items-center gap-2">
                  {t("table.contact")} {getSortIcon("contact")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  {t("table.status")} {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => handleSort("source")}
              >
                <div className="flex items-center gap-2">
                  Origem {getSortIcon("source")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Contato
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
                {t("table.actions")}
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
                  {t("table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((lead) => {
                const stagnant = isLeadStagnant(lead)
                const nextAction = getNextActionMeta(lead.nextActionAt)
                const temperature = getLeadTemperature(lead.source)
                const rawContactLink = lead.instagram || lead.website || null
                const contactLinkUrl =
                  rawContactLink &&
                  (Boolean(lead.instagram) ||
                    lead.source === LeadSource.INSTAGRAM)
                    ? buildInstagramUrl(rawContactLink)
                    : rawContactLink
                const preferredLinkValue = lead.instagram || lead.website || ""
                const contactLinkLabel = preferredLinkValue
                  ? Boolean(lead.instagram) ||
                    lead.source === LeadSource.INSTAGRAM
                    ? getInstagramHandle(preferredLinkValue)
                    : getWebsiteLabel(preferredLinkValue)
                  : "Sem link"

                return (
                  <TableRow
                    key={lead.id}
                    className="group border-border/15 transition-all hover:bg-brand-primary/2"
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={{
                            pathname: "/admin/crm/leads/[id]",
                            params: { id: lead.id },
                          }}
                          className="font-heading text-sm font-black uppercase tracking-tight text-foreground transition-colors hover:text-brand-primary"
                        >
                          {lead.companyName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                          {stagnant ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                              <SealWarningIcon size={12} />
                              {getLeadDaysWithoutMovement(lead)} dia(s) sem
                              mover
                            </span>
                          ) : null}
                          {nextAction.label ? (
                            <span
                              className={`text-[8px] font-black uppercase tracking-[0.2em] ${nextAction.tone}`}
                            >
                              {nextAction.label}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-foreground/80">
                          {lead.contactName || "---"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {lead.email || "---"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {temperature.icon ? (
                          <span
                            title={temperature.label ?? undefined}
                            className="text-xs leading-none"
                          >
                            {temperature.icon}
                          </span>
                        ) : null}
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                          {formatLeadSourceLabel(lead.source)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/70">
                          {formatLeadPhone(lead.phone) || "Sem telefone"}
                        </span>
                        {contactLinkUrl ? (
                          <a
                            href={contactLinkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-brand-primary"
                          >
                            {contactLinkLabel}
                          </a>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                            {contactLinkLabel}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/70">
                          {new Date(lead.updatedAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
                          Criado em{" "}
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
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
                          title="Abrir lead"
                        >
                          <Link
                            href={{
                              pathname: "/admin/crm/leads/[id]",
                              params: { id: lead.id },
                            }}
                          >
                            <ArrowSquareOutIcon weight="bold" size={16} />
                          </Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                              title="Mais ações"
                            >
                              <DotsThreeVerticalIcon
                                weight="bold"
                                className="size-5"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-3xl border-border/40 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                          >
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Link
                                href={{
                                  pathname: "/admin/crm/leads/[id]",
                                  params: { id: lead.id },
                                  query: { mode: "edit" },
                                }}
                              >
                                <PencilSimpleIcon className="mr-2 size-4" />
                                Editar lead
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Link
                                href={{
                                  pathname: "/admin/crm/leads/[id]",
                                  params: { id: lead.id },
                                }}
                                target="_blank"
                              >
                                <ArrowSquareOutIcon className="mr-2 size-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                            >
                              <Link
                                href={{
                                  pathname: "/admin/crm/leads/[id]/proposals",
                                  params: { id: lead.id },
                                }}
                                target="_blank"
                              >
                                <ArrowSquareOutIcon className="mr-2 size-4" />
                                Ver propostas
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(event) => event.preventDefault()}
                                  className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <TrashIcon className="mr-2 size-4" />
                                  Excluir lead
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                size="default"
                                className="max-w-xl rounded-4xl border border-border/40 bg-background p-7 text-foreground shadow-2xl shadow-foreground/10 sm:max-w-xl"
                              >
                                <AlertDialogHeader className="gap-4 text-left sm:text-left">
                                  <AlertDialogTitle className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                                    Excluir lead do CRM
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="max-w-none text-sm leading-relaxed text-muted-foreground/75">
                                    Isso remove o lead de forma definitiva da lista comercial.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-muted/30 p-4 text-sm text-foreground/80">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                                      Empresa
                                    </span>
                                    <span className="text-right font-black uppercase">
                                      {lead.companyName}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                                      Contato
                                    </span>
                                    <span className="text-right font-black">
                                      {lead.contactName || "Nao informado"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-amber-800 dark:text-amber-200">
                                    <WarningOctagonIcon className="size-4 shrink-0" />
                                    <span className="text-xs font-bold">
                                      Essa acao nao pode ser desfeita.
                                    </span>
                                  </div>
                                </div>

                                <AlertDialogFooter className="pt-2">
                                  <AlertDialogCancel className="rounded-full border-border/30 bg-background">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(lead.id)}
                                    disabled={pendingDeletion}
                                    className="rounded-full bg-red-500 text-white hover:bg-red-500/90"
                                  >
                                    Confirmar exclusao
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
            Total de {filteredAndSortedItems.length} leads encontrados
          </p>
        </div>
      </div>
    </div>
  )
}
