"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProposalStatus } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import {
  ArrowSquareOut,
  DotsThreeVertical,
  DownloadSimple,
  FilePdf,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import {
  deleteProposalAction,
  getLeadProposalsAction,
  updateProposalStatusAction,
} from "@/src/lib/actions/proposal.actions"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

import { CreateProposalDrawer } from "./CreateProposalDrawer"

type LeadProposalsResult = Awaited<ReturnType<typeof getLeadProposalsAction>>
type LeadProposalRecord = LeadProposalsResult["proposals"][number]

interface LeadProposalsTabProps {
  lead: Lead
  showHeader?: boolean
  proposals?: LeadProposalRecord[]
  onProposalChanged?: () => void
}

export function LeadProposalsTab({
  lead,
  showHeader = true,
  proposals: providedProposals,
  onProposalChanged,
}: LeadProposalsTabProps) {
  const t = useTranslations("Proposals.status")
  const [proposals, setProposals] = React.useState<LeadProposalRecord[]>(
    providedProposals ?? []
  )
  const [prevProvidedProposals, setPrevProvidedProposals] =
    React.useState(providedProposals)

  if (providedProposals !== prevProvidedProposals) {
    setPrevProvidedProposals(providedProposals)
    if (providedProposals) {
      setProposals(providedProposals)
    }
  }

  const [isLoading, setIsLoading] = React.useState(!providedProposals)

  const loadProposals = React.useCallback(async () => {
    if (providedProposals) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const result = await getLeadProposalsAction(lead.id)

    if (result.success) {
      setProposals(result.proposals)
    } else {
      toast.error(result.error)
    }

    setIsLoading(false)
  }, [lead.id, providedProposals])

  React.useEffect(() => {
    if (!providedProposals) {
      void loadProposals()
    }
  }, [loadProposals, providedProposals])

  const handleDelete = async (id: string) => {
    const result = await deleteProposalAction(id)

    if (result.success) {
      toast.success("Proposta excluida")
      setProposals((current) => current.filter((proposal) => proposal.id !== id))
      onProposalChanged?.()
      return
    }

    toast.error("Erro ao excluir proposta")
  }

  const handleStatusChange = async (id: string, status: ProposalStatus) => {
    const result = await updateProposalStatusAction(id, status)

    if (result.success) {
      toast.success("Status atualizado")
      setProposals((current) =>
        current.map((proposal) =>
          proposal.id === id ? { ...proposal, status } : proposal
        )
      )
      onProposalChanged?.()
      return
    }

    toast.error("Erro ao atualizar status")
  }

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

  return (
    <div className="min-w-0 space-y-4">
      {showHeader ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
              Propostas Comerciais
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Documentos formais de investimento.
            </p>
          </div>
          <CreateProposalDrawer leadId={lead.id} />
        </div>
      ) : null}

      <div className="grid min-w-0 gap-2.5">
        {isLoading ? (
          <div className="animate-pulse py-10 text-center text-muted-foreground/40">
            Carregando propostas...
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-border/20 bg-muted/5 py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted/10 text-muted-foreground/30">
              <FilePdf size={24} weight="duotone" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
              Nenhuma proposta gerada ainda
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="min-w-0 overflow-hidden rounded-[1.35rem] border border-border/10 bg-transparent p-3.5 sm:p-4"
            >
              <div className="flex min-w-0 flex-col gap-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-brand-primary/8 text-brand-primary">
                    <FilePdf weight="duotone" className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black tracking-tight text-foreground">
                      {proposal.title}
                    </span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                        #{proposal.number}
                      </span>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full border border-transparent text-muted-foreground/40 hover:border-border/15 hover:bg-background"
                      >
                        <DotsThreeVertical weight="bold" className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 rounded-2xl border-border/20 bg-background p-1.5"
                    >
                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight">
                        <a
                          href={`/api/proposals/${proposal.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowSquareOut className="mr-2 size-4" />
                          Abrir PDF
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight">
                        <a
                          href={`/api/proposals/${proposal.id}/pdf?download=1`}
                          download={`proposta-${proposal.number}.pdf`}
                        >
                          <DownloadSimple className="mr-2 size-4" />
                          Baixar PDF
                        </a>
                      </DropdownMenuItem>
                      <div className="my-1 h-px bg-border/10" />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(proposal.id, "SENT")}
                        className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-blue-500/10 focus:text-blue-600"
                      >
                        Marcar como {t("SENT")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(proposal.id, "ACCEPTED")
                        }
                        className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-emerald-500/10 focus:text-emerald-600"
                      >
                        Marcar como {t("ACCEPTED")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(proposal.id, "REJECTED")
                        }
                        className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-red-500/10 focus:text-red-600"
                      >
                        Marcar como {t("REJECTED")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(proposal.id)}
                        className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        Excluir Proposta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/10 pt-3">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Investimento
                    </span>
                    <span className="text-sm font-black text-foreground/80">
                      {formatCurrencyBRLFromCents(proposal.totalValue)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Validade
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60">
                      {proposal.validUntil
                        ? new Date(proposal.validUntil).toLocaleDateString(
                            "pt-BR"
                          )
                        : "Indeterminado"}
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground/30">
                  Criada em{" "}
                  {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
