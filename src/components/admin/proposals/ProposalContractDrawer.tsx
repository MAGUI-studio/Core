"use client"

import * as React from "react"

import { ArrowSquareOut, CircleNotch, FileText } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet"
import { Textarea } from "@/src/components/ui/textarea"

import {
  createContractFromProposalAction,
  getProposalContractPrefillAction,
} from "@/src/lib/actions/document.actions"
import { formatCurrencyBRL } from "@/src/lib/utils/utils"

type SelectedProposal = {
  id: string
  title: string
  companyName: string
}

type ContractPrefill = {
  proposalId: string
  proposalTitle: string
  companyName: string
  contractingPartyType: "INDIVIDUAL" | "COMPANY"
  contractingLegalName: string
  contractingDocumentNumber: string
  contractingAddress: string
  contractingCityState: string
  contractingSignerName: string
  renewalValue: string
  totalValueLabel: string
  timelinePreview: string
}

interface ProposalContractDrawerProps {
  proposal: SelectedProposal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: ContractPrefill = {
  proposalId: "",
  proposalTitle: "",
  companyName: "",
  contractingPartyType: "COMPANY",
  contractingLegalName: "",
  contractingDocumentNumber: "",
  contractingAddress: "",
  contractingCityState: "",
  contractingSignerName: "",
  renewalValue: "",
  totalValueLabel: "",
  timelinePreview: "",
}

export function ProposalContractDrawer({
  proposal,
  open,
  onOpenChange,
}: ProposalContractDrawerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [form, setForm] = React.useState<ContractPrefill>(EMPTY_FORM)

  React.useEffect(() => {
    if (!open || !proposal?.id) return

    let cancelled = false

    const loadPrefill = async () => {
      setIsLoading(true)
      const result = await getProposalContractPrefillAction(proposal.id)

      if (cancelled) return

      if (!result.success || !result.prefill) {
        toast.error(result.error || "Erro ao carregar os dados do contrato")
        onOpenChange(false)
        setIsLoading(false)
        return
      }

      setForm({
        ...EMPTY_FORM,
        ...result.prefill,
        contractingPartyType:
          result.prefill.contractingPartyType === "INDIVIDUAL"
            ? "INDIVIDUAL"
            : "COMPANY",
      })
      setIsLoading(false)
    }

    void loadPrefill()

    return () => {
      cancelled = true
    }
  }, [open, proposal?.id, onOpenChange])

  const updateField = <K extends keyof ContractPrefill>(
    key: K,
    value: ContractPrefill[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!proposal?.id) return

    setIsSubmitting(true)
    const result = await createContractFromProposalAction({
      proposalId: proposal.id,
      contractingPartyType: form.contractingPartyType ?? "COMPANY",
      contractingLegalName: form.contractingLegalName ?? "",
      contractingDocumentNumber: form.contractingDocumentNumber ?? "",
      contractingAddress: form.contractingAddress ?? "",
      contractingCityState: form.contractingCityState ?? "",
      contractingSignerName: form.contractingSignerName ?? "",
      renewalValue: form.renewalValue ?? "",
    })

    setIsSubmitting(false)

    if (result.success && result.documentId) {
      toast.success(
        result.reused
          ? "Contrato atualizado com sucesso."
          : "Contrato gerado com sucesso."
      )
      onOpenChange(false)
      window.open(
        `/api/documents/${result.documentId}/pdf`,
        "_blank",
        "noopener,noreferrer"
      )
      return
    }

    toast.error(result.error || "Erro ao gerar contrato")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[96vw] overflow-y-auto border-l border-border/15 bg-background p-0 sm:min-w-[40rem] sm:max-w-[42rem] sm:rounded-l-[3.5rem]"
      >
        <SheetHeader className="gap-5 border-b border-border/15 bg-brand-primary/10 px-8 py-8">
          <div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
            <FileText weight="bold" className="size-7" />
          </div>
          <div className="space-y-1.5">
            <SheetTitle className="font-heading text-2xl font-black uppercase tracking-tight text-brand-primary">
              Gerar contrato
            </SheetTitle>
            <SheetDescription className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-primary/65">
              Complete os dados faltantes antes de abrir o PDF final.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {isLoading ? (
            <div className="flex h-52 items-center justify-center rounded-[2rem] border border-dashed border-border/30 bg-muted/10 text-sm text-muted-foreground">
              <CircleNotch className="mr-3 size-5 animate-spin" />
              Carregando dados da proposta...
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-border/20 bg-muted/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
                  Proposta
                </p>
                <h3 className="mt-2 text-lg font-black text-foreground">
                  {form.proposalTitle || proposal?.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground/80">
                  {form.companyName || proposal?.companyName}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                    Total: {form.totalValueLabel || "—"}
                  </span>
                  {form.timelinePreview ? (
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Prazo: {form.timelinePreview}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Tipo de contratante
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "COMPANY", label: "Empresa" },
                      { value: "INDIVIDUAL", label: "Pessoa Física" },
                    ] as const).map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          form.contractingPartyType === option.value
                            ? "default"
                            : "outline"
                        }
                        className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        onClick={() =>
                          updateField("contractingPartyType", option.value)
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {form.contractingPartyType === "COMPANY" ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Nome da empresa
                    </Label>
                    <Input
                      value={form.contractingLegalName}
                      onChange={(event) =>
                        updateField("contractingLegalName", event.target.value)
                      }
                      className="h-12 rounded-2xl border-border/40 bg-muted/10"
                      placeholder="Ex.: 1k Salgados"
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Nome completo do dono
                  </Label>
                  <Input
                    value={form.contractingSignerName}
                    onChange={(event) =>
                      updateField("contractingSignerName", event.target.value)
                    }
                    className="h-12 rounded-2xl border-border/40 bg-muted/10"
                    placeholder="Ex.: João da Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    CPF do responsável
                  </Label>
                  <Input
                    value={form.contractingDocumentNumber}
                    onChange={(event) =>
                      updateField(
                        "contractingDocumentNumber",
                        event.target.value
                      )
                    }
                    className="h-12 rounded-2xl border-border/40 bg-muted/10"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Endereço
                  </Label>
                  <Textarea
                    value={form.contractingAddress}
                    onChange={(event) =>
                      updateField("contractingAddress", event.target.value)
                    }
                    className="min-h-24 rounded-2xl border-border/40 bg-muted/10"
                    placeholder="Rua Exemplo, Jardim Exemplo, Nº 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Cidade / UF
                  </Label>
                  <Input
                    value={form.contractingCityState}
                    onChange={(event) =>
                      updateField("contractingCityState", event.target.value)
                    }
                    className="h-12 rounded-2xl border-border/40 bg-muted/10"
                    placeholder="Ex.: São José dos Campos/SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Valor estimado de renovação
                  </Label>
                  <Input
                    value={form.renewalValue}
                    onChange={(event) =>
                      updateField(
                        "renewalValue",
                        formatCurrencyBRL(event.target.value)
                      )
                    }
                    className="h-12 rounded-2xl border-border/40 bg-muted/10"
                    placeholder="Ex.: R$ 189,90"
                  />
                  <p className="text-xs text-muted-foreground/65">
                    Este valor será usado na cláusula de renovação de domínio.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border/15 bg-background/80 px-8 py-6">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-12 rounded-2xl bg-brand-primary px-5 text-[10px] font-black uppercase tracking-[0.18em] text-white"
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />
            ) : (
              <ArrowSquareOut className="mr-2 size-4" weight="bold" />
            )}
            Gerar contrato
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
