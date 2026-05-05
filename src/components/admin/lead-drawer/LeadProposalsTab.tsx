"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProposalStatus } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import {
  ArrowSquareOut,
  DotsThreeVertical,
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

import { CreateProposalDrawer } from "./CreateProposalDrawer"

interface LeadProposalsTabProps {
  lead: Lead
  showHeader?: boolean
}

type LeadProposalsResult = Awaited<ReturnType<typeof getLeadProposalsAction>>
type LeadProposalRecord = LeadProposalsResult["proposals"][number]

export function LeadProposalsTab({
  lead,
  showHeader = true,
}: LeadProposalsTabProps) {
  const t = useTranslations("Proposals.status")
  const [proposals, setProposals] = React.useState<LeadProposalRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadProposals = React.useCallback(async () => {
    setIsLoading(true)
    const result = await getLeadProposalsAction(lead.id)
    if (result.success) {
      setProposals(result.proposals)
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }, [lead.id])

  React.useEffect(() => {
    loadProposals()
  }, [loadProposals])

  const handleDelete = async (id: string) => {
    const result = await deleteProposalAction(id)
    if (result.success) {
      toast.success("Proposta excluída")
      setProposals((curr) => curr.filter((p) => p.id !== id))
    } else {
      toast.error("Erro ao excluir proposta")
    }
  }

  const handleStatusChange = async (id: string, status: ProposalStatus) => {
    const result = await updateProposalStatusAction(id, status)
    if (result.success) {
      toast.success("Status atualizado")
      setProposals((curr) =>
        curr.map((p) => (p.id === id ? { ...p, status } : p))
      )
    } else {
      toast.error("Erro ao atualizar status")
    }
  }

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase text-[8px] font-black">
            {t("ACCEPTED")}
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 uppercase text-[8px] font-black">
            {t("REJECTED")}
          </Badge>
        )
      case "SENT":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 uppercase text-[8px] font-black">
            {t("SENT")}
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge className="bg-muted text-muted-foreground border-border/50 uppercase text-[8px] font-black">
            {t("EXPIRED")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="uppercase text-[8px] font-black">
            {t("DRAFT")}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8">
      {showHeader ? (
        <div className="flex items-center justify-between">
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

      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground/40 animate-pulse">
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
              className="group relative flex flex-col gap-5 rounded-3xl border border-border/40 bg-background/50 p-6 transition-all hover:border-brand-primary/30 hover:bg-muted/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <FilePdf weight="duotone" className="size-6" />
                  </div>
                  <div className="flex flex-col overflow-hidden gap-1">
                    <span className="truncate text-sm font-black uppercase tracking-tight text-foreground">
                      {proposal.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground/50">
                        #{proposal.number}
                      </span>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border/40 bg-background/50 px-4 text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <a
                      href={`/api/proposals/${proposal.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir PDF <ArrowSquareOut className="ml-1.5 size-3.5" />
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border/40 bg-background/50 px-4 text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <a
                      href={`/api/proposals/${proposal.id}/pdf?download=1`}
                      download={`proposta-${proposal.number}.pdf`}
                    >
                      Baixar PDF
                    </a>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                      >
                        <DotsThreeVertical weight="bold" className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-2xl border-border/40 bg-background/95 p-1.5 backdrop-blur-xl shadow-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(proposal.id, "SENT")}
                        className="rounded-xl px-3 py-2 cursor-pointer text-[10px] font-bold uppercase tracking-tight focus:bg-blue-500/10 focus:text-blue-600"
                      >
                        Marcar como {t("SENT")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(proposal.id, "ACCEPTED")
                        }
                        className="rounded-xl px-3 py-2 cursor-pointer text-[10px] font-bold uppercase tracking-tight focus:bg-emerald-500/10 focus:text-emerald-600"
                      >
                        Marcar como {t("ACCEPTED")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(proposal.id, "REJECTED")
                        }
                        className="rounded-xl px-3 py-2 cursor-pointer text-[10px] font-bold uppercase tracking-tight focus:bg-red-500/10 focus:text-red-600"
                      >
                        Marcar como {t("REJECTED")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(proposal.id)}
                        className="rounded-xl px-3 py-2 cursor-pointer text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        Excluir Proposta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/10 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Investimento
                    </span>
                    <span className="text-sm font-black text-foreground/80">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: proposal.currency,
                      }).format(proposal.totalValue)}
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
                <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/30 italic">
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
