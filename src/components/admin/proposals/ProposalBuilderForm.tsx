"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { useRouter } from "@/src/i18n/navigation"
import { ProjectCategory } from "@/src/generated/client"
import {
  Calculator,
  ClockCountdown,
  FilePdf,
  Gift,
  Info,
  ListChecks,
  MagicWand,
  Plus,
  ShieldCheck,
  Sparkle,
  Trash,
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
import { Switch } from "@/src/components/ui/switch"
import { Textarea } from "@/src/components/ui/textarea"

import { createProposalAction } from "@/src/lib/actions/proposal.actions"
import { getExecutionDaysLabel } from "@/src/lib/project-schedule"

import {
  PROPOSAL_PRESETS,
  type ProposalPreset,
} from "@/src/config/proposal-presets"

interface ProposalBuilderFormProps {
  leads: Array<{ id: string; companyName: string }>
  initialLeadId?: string
}

interface ProposalItemForm {
  description: string
  longDescription: string
  unitValue: number
  quantity: number
}

const EMPTY_ITEM: ProposalItemForm = {
  description: "",
  longDescription: "",
  unitValue: 0,
  quantity: 1,
}

const DEFAULT_PLATFORM_FLOW =
  "Toda a comunicação, aprovações, centralização de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI. Isso reduz ruído operacional, evita retrabalho e concentra histórico, decisões e materiais em um único ambiente."

const DEFAULT_CONTRACT_ALIGNMENT_NOTES =
  'O valor investido refere-se à licença de uso da solução em ambiente de produção. O código-fonte e os arquivos editáveis permanecem sob propriedade intelectual da MAGUI.studio, e a assinatura "Desenvolvido por MAGUI.studio" constará no rodapé da entrega, salvo contratação específica de white label.'

const CONNECT_BONUS_NOTE =
  "O projeto inclui, como bônus comercial, o MAGUI Connect em condição promocional integralmente gratuita no momento da contratação."

function buildContractAlignedTimelineNarrative(days: number | null): string {
  if (!days || days <= 0) {
    return "Prazo contratual a definir, com contagem iniciada somente após a validação do briefing e envio dos ativos obrigatórios. A ausência de retorno do cliente por mais de 7 dias corridos suspende o projeto e reprograma a agenda."
  }

  return `Estimativa de ${days} dias úteis para conclusão total, com iní­cio da contagem apenas após a validação do briefing e do envio dos ativos obrigatórios pelo cliente. A ausência de retorno do cliente por mais de 7 dias corridos suspende o projeto e reprograma a agenda. O cronograma é monitorado em tempo real pela plataforma e pode ser recalculado automaticamente conforme a regra contratual de atraso do cliente.`
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "")
  return digits ? Number(digits) / 100 : 0
}

function formatCurrencyInput(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value)
}

export function ProposalBuilderForm({
  leads,
  initialLeadId,
}: ProposalBuilderFormProps): React.JSX.Element {
  const t = useTranslations("Proposals")
  const tCommon = useTranslations("Admin.crm")
  const router = useRouter()
  const initialLead =
    leads.find((lead) => lead.id === initialLeadId) ?? leads[0] ?? null
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedLeadId, setSelectedLeadId] = React.useState(
    initialLead?.id ?? ""
  )
  const [projectCategory, setProjectCategory] = React.useState<string>("")
  const [title, setTitle] = React.useState(
    initialLead
      ? `${t("builder.title")} - ${initialLead.companyName}`
      : t("builder.title")
  )
  const [validUntil, setValidUntil] = React.useState("")
  const [executiveSummary, setExecutiveSummary] = React.useState("")
  const [objectives, setObjectives] = React.useState("")
  const [expectedImpact, setExpectedImpact] = React.useState("")
  const [differentials, setDifferentials] = React.useState("")
  const [executionBusinessDays, setExecutionBusinessDays] = React.useState(20)
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [acceptanceCriteria, setAcceptanceCriteria] = React.useState("")
  const [notIncluded, setNotIncluded] = React.useState("")
  const [warranty, setWarranty] = React.useState("")
  const [platformFlow, setPlatformFlow] = React.useState(DEFAULT_PLATFORM_FLOW)
  const currency = "BRL"
  const [nextSteps, setNextSteps] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [items, setItems] = React.useState<ProposalItemForm[]>([
    { ...EMPTY_ITEM },
  ])

  const setProposalValidityDays = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    setValidUntil(`${year}-${month}-${day}`)
  }

  const timeline = React.useMemo(
    () => buildContractAlignedTimelineNarrative(executionBusinessDays),
    [executionBusinessDays]
  )

  const requiredSections = [
    { label: t("builder.leadLabel"), ok: Boolean(selectedLeadId) },
    {
      label: t("builder.narrativeTitle"),
      ok: executiveSummary.trim().length > 0,
    },
    { label: "Objetivos do projeto", ok: objectives.trim().length > 0 },
    { label: "Prazo contratado", ok: executionBusinessDays > 0 },
    { label: "Condições de pagamento", ok: paymentTerms.trim().length > 0 },
    { label: "Próximos passos", ok: nextSteps.trim().length > 0 },
  ]
  const hasInvalidItems = items.some(
    (item) => !item.description.trim() || item.unitValue <= 0
  )

  React.useEffect(() => {
    const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
    if (!selectedLead) return

    setTitle((currentTitle: string) => {
      if (
        currentTitle === t("builder.title") ||
        currentTitle.startsWith(`${t("builder.title")} - `)
      ) {
        return `${t("builder.title")} - ${selectedLead.companyName}`
      }

      return currentTitle
    })
  }, [selectedLeadId, leads, t])

  const total = items.reduce(
    (acc, item) => acc + item.unitValue * item.quantity,
    0
  )

  const handleAddItem = () =>
    setItems((current) => [...current, { ...EMPTY_ITEM }])

  const handleRemoveItem = (index: number) =>
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))

  const handleItemChange = (
    index: number,
    field: keyof ProposalItemForm,
    value: string | number
  ) => {
    setItems((current) => {
      const next = [...current]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleApplyPreset = (
    setter: (value: string | ((prev: string) => string)) => void,
    content: string,
    mode: "replace" | "append" = "replace"
  ) => {
    const selectedLead = leads.find((l) => l.id === selectedLeadId)
    const processedContent = content.replace(
      /\[Empresa\]/g,
      selectedLead?.companyName ?? "empresa"
    )

    if (mode === "replace") {
      setter(processedContent)
    } else {
      setter((prev) =>
        prev ? `${prev}\n\n${processedContent}` : processedContent
      )
    }
  }

  const handleCategoryChange = (category: string) => {
    setProjectCategory(category)

    // Auto-fill presets based on category
    const selectedLead = leads.find((l) => l.id === selectedLeadId)
    const company = selectedLead?.companyName ?? "empresa"

    if (category === "landing-page") {
      setExecutiveSummary(
        PROPOSAL_PRESETS.executiveSummary[0].content.replace(
          /\[Empresa\]/g,
          company
        )
      )
      setObjectives(
        PROPOSAL_PRESETS.objectives[0].content.replace(/\[Empresa\]/g, company)
      )
      setItems([
        {
          description: PROPOSAL_PRESETS.itemDescriptions[0].content,
          longDescription: PROPOSAL_PRESETS.itemLongDescriptions[0].content,
          unitValue: 0,
          quantity: 1,
        },
      ])
      setExecutionBusinessDays(20)
    } else if (category === "institucional") {
      setExecutiveSummary(
        PROPOSAL_PRESETS.executiveSummary[1].content.replace(
          /\[Empresa\]/g,
          company
        )
      )
      setObjectives(
        PROPOSAL_PRESETS.objectives[1].content.replace(/\[Empresa\]/g, company)
      )
      setItems([
        {
          description: PROPOSAL_PRESETS.itemDescriptions[1].content,
          longDescription: PROPOSAL_PRESETS.itemLongDescriptions[1].content,
          unitValue: 0,
          quantity: 1,
        },
      ])
      setExecutionBusinessDays(20)
    } else {
      setExecutiveSummary(
        PROPOSAL_PRESETS.executiveSummary[2].content.replace(
          /\[Empresa\]/g,
          company
        )
      )
      setObjectives(
        PROPOSAL_PRESETS.objectives[1].content.replace(/\[Empresa\]/g, company)
      )
      setItems([
        {
          description: PROPOSAL_PRESETS.itemDescriptions[1].content,
          longDescription: PROPOSAL_PRESETS.itemLongDescriptions[1].content,
          unitValue: 0,
          quantity: 1,
        },
      ])
      setExecutionBusinessDays(30)
    }

    // Common presets for all categories
    setExpectedImpact(PROPOSAL_PRESETS.expectedImpact[0].content)
    setDifferentials(PROPOSAL_PRESETS.differentials[0].content)
    setPaymentTerms(PROPOSAL_PRESETS.paymentTerms[0].content)
    setNextSteps(PROPOSAL_PRESETS.nextSteps[0].content)
    setAcceptanceCriteria(PROPOSAL_PRESETS.acceptanceCriteria[0].content)
    setNotIncluded(PROPOSAL_PRESETS.notIncluded[0].content)
    setPlatformFlow(PROPOSAL_PRESETS.platformFlow[0].content)
    setWarranty(PROPOSAL_PRESETS.warranty[0].content)
    setNotes(DEFAULT_CONTRACT_ALIGNMENT_NOTES)
  }

  const [includeConnectBonus, setIncludeConnectBonus] = React.useState(false)
  const [exposeInPortfolio, setExposeInPortfolio] = React.useState(true)
  const [keepFooterCredit, setKeepFooterCredit] = React.useState(true)
  const [whiteLabelFeeValue, setWhiteLabelFeeValue] = React.useState("R$ 200,00")
  const [annualRenewalFeeValue, setAnnualRenewalFeeValue] =
    React.useState("R$ 297,00")

  const buildProposalNotes = () => {
    const sections = [
      [t("builder.narrativeTitle"), executiveSummary],
      ["Objetivos do projeto", objectives],
      ["Impacto esperado", expectedImpact],
      ["Diferenciais da entrega", differentials],
      ["Prazo estimado", timeline],
      ["Condições de pagamento", paymentTerms],
      ["Critérios de aceite", acceptanceCriteria],
      ["O que não está incluso", notIncluded],
      ["Garantia e ajustes", warranty],
      ["Operação pela plataforma", platformFlow],
      ["Próximos passos", nextSteps],
      ["Observações adicionais", notes],
      [
        t("builder.connectBonusTitle"),
        includeConnectBonus
          ? CONNECT_BONUS_NOTE
          : "",
      ],
    ]
      .map(([sectionTitle, content]) => [sectionTitle, content.trim()] as const)
      .filter(([, content]) => content.length > 0)
      .map(([sectionTitle, content]) => `## ${sectionTitle}\n${content}`)

    return sections.join("\n\n")
  }

  const handleSubmit = async () => {
    if (!selectedLeadId) {
      toast.error(t("builder.leadPlaceholder"))
      return
    }

    const requiredTextFields = [
      { value: executiveSummary, label: t("builder.narrativeTitle") },
      { value: objectives, label: "Objetivos do projeto" },
      { value: expectedImpact, label: "Impacto esperado" },
      { value: differentials, label: "Diferenciais da entrega" },
      { value: paymentTerms, label: "Condições de pagamento" },
      { value: platformFlow, label: "Operação pela plataforma" },
      { value: nextSteps, label: "Próximos passos" },
    ]

    const missingField = requiredTextFields.find((field) => !field.value.trim())
    if (missingField) {
      toast.error(`O campo "${missingField.label}" é obrigatório`)
      return
    }

    if (hasInvalidItems) {
      toast.error("Preencha nome e valor de todos os itens da proposta")
      return
    }

    if (executionBusinessDays <= 0) {
      toast.error('O campo "Prazo contratado (dias úteis)" é obrigatório')
      return
    }

    setIsSubmitting(true)

    const result = await createProposalAction({
      leadId: selectedLeadId,
      title,
      currency: currency,
      validUntil: validUntil || undefined,
      notes: buildProposalNotes() || undefined,
      projectCategory:
        projectCategory === "landing-page"
          ? ProjectCategory.LANDING_PAGE
          : projectCategory === "institucional"
            ? ProjectCategory.INSTITUTIONAL_SITE
            : undefined,
      executionBusinessDays,
      includesMaguiConnectBonus: includeConnectBonus,
      exposeInPortfolio,
      keepFooterCredit,
      whiteLabelFeeCents: Math.round(parseCurrencyInput(whiteLabelFeeValue) * 100),
      annualRenewalFeeCents: Math.round(
        parseCurrencyInput(annualRenewalFeeValue) * 100
      ),
      items: items.map((item, order) => ({
        ...item,
        description: item.description.trim(),
        longDescription: item.longDescription.trim() || undefined,
        order,
      })),
    })

    if (result.success) {
      toast.success("Proposta criada com sucesso!")
      router.push("/admin/crm/proposals")
      return
    }

    toast.error("Erro ao criar proposta")
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-10">
      <section className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted/10 text-brand-primary">
            <FilePdf weight="bold" className="size-7" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/65">
              {t("builder.title")}
            </p>
            <h2 className="font-heading text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
              {t("builder.subtitle")}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/75">
              {t("builder.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("builder.leadLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger
                size="lg"
                className="h-14 w-full rounded-2xl border-border/40 bg-muted/10 px-5 text-left font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20 data-[placeholder]:text-muted-foreground"
              >
                <SelectValue placeholder={t("builder.leadPlaceholder")} />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="min-w-(--radix-select-trigger-width)"
              >
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("builder.categoryLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={projectCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger
                size="lg"
                className="h-14 w-full rounded-2xl border-border/40 bg-muted/10 px-5 text-left font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20"
              >
                <SelectValue placeholder={t("builder.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landing-page">
                  {t("builder.categories.landing-page")}
                </SelectItem>
                <SelectItem value="institucional">
                  {t("builder.categories.institucional")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("builder.documentTitleLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 flex-1 rounded-2xl border-border/40 bg-muted/10 px-5 text-sm font-semibold transition-all focus:border-brand-primary/50 focus:bg-muted/20"
            />
            <p className="pl-1 text-[11px] text-muted-foreground/65">
              {t("builder.documentTitleHelper")}
            </p>
          </div>

          <div className="space-y-2 md:max-w-sm">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("builder.validityLabel")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 px-5 text-sm font-semibold transition-all focus:border-brand-primary/50 focus:bg-muted/20"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-14 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest"
                onClick={() => setProposalValidityDays(7)}
              >
                7 dias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-14 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest"
                onClick={() => setProposalValidityDays(14)}
              >
                14 dias
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionHeading
        icon={Sparkle}
        title={t("builder.narrativeTitle")}
        description={t("builder.narrativeDescription")}
      />

      <section className="space-y-8">
        <FieldBlock
          label={`${t("builder.narrativeTitle")} *`}
          value={executiveSummary}
          onChange={setExecutiveSummary}
          placeholder={t("builder.narrativePlaceholder")}
          minHeightClassName="min-h-40"
          presets={PROPOSAL_PRESETS.executiveSummary}
          onApplyPreset={(content) =>
            handleApplyPreset(setExecutiveSummary, content)
          }
        />
        <FieldBlock
          label={`${t("builder.projectGoal")} *`}
          value={objectives}
          onChange={setObjectives}
          placeholder={t("builder.projectGoalPlaceholder")}
          presets={PROPOSAL_PRESETS.objectives}
          onApplyPreset={(content) => handleApplyPreset(setObjectives, content)}
        />
        <FieldBlock
          label={`${t("builder.expectedImpact")} *`}
          value={expectedImpact}
          onChange={setExpectedImpact}
          placeholder={t("builder.expectedImpactPlaceholder")}
          presets={PROPOSAL_PRESETS.expectedImpact}
          onApplyPreset={(content) =>
            handleApplyPreset(setExpectedImpact, content)
          }
        />
      </section>

      <section className="space-y-8">
        <FieldBlock
          label={`${t("builder.differentials")} *`}
          value={differentials}
          onChange={setDifferentials}
          placeholder={t("builder.differentialsPlaceholder")}
          presets={PROPOSAL_PRESETS.differentials}
          onApplyPreset={(content) =>
            handleApplyPreset(setDifferentials, content)
          }
        />
        <ExecutionDaysBlock
          value={executionBusinessDays}
          onChange={setExecutionBusinessDays}
          preview={timeline}
        />
        <FieldBlock
          label={`${t("builder.paymentConditions")} *`}
          value={paymentTerms}
          onChange={setPaymentTerms}
          placeholder={t("builder.paymentConditionsPlaceholder")}
          presets={PROPOSAL_PRESETS.paymentTerms}
          onApplyPreset={(content) =>
            handleApplyPreset(setPaymentTerms, content)
          }
        />
      </section>

      <SectionHeading
        icon={ShieldCheck}
        title={t("builder.governanceTitle")}
        description={t("builder.governanceDescription")}
      />

      <section className="space-y-8">
        <FieldBlock
          label={t("builder.acceptanceCriteria")}
          value={acceptanceCriteria}
          onChange={setAcceptanceCriteria}
          description={t("builder.acceptanceCriteriaDescription")}
          placeholder={t("builder.acceptanceCriteriaPlaceholder")}
          presets={PROPOSAL_PRESETS.acceptanceCriteria}
          onApplyPreset={(content) =>
            handleApplyPreset(setAcceptanceCriteria, content)
          }
        />
        <FieldBlock
          label={t("builder.notIncluded")}
          value={notIncluded}
          onChange={setNotIncluded}
          description={t("builder.notIncludedDescription")}
          placeholder={t("builder.notIncludedPlaceholder")}
          presets={PROPOSAL_PRESETS.notIncluded}
          onApplyPreset={(content) =>
            handleApplyPreset(setNotIncluded, content)
          }
        />
        <FieldBlock
          label={t("builder.warranty")}
          value={warranty}
          onChange={setWarranty}
          description={t("builder.warrantyDescription")}
          placeholder={t("builder.warrantyPlaceholder")}
          presets={PROPOSAL_PRESETS.warranty}
          onApplyPreset={(content) => handleApplyPreset(setWarranty, content)}
        />
      </section>

      <SectionHeading
        icon={ListChecks}
        title={t("builder.investmentTitle")}
        description={t("builder.investmentDescription")}
      />

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("builder.itemsLabel")}
              </Label>
              <p className="text-xs text-muted-foreground/50">
                {t("builder.itemsDescription")}
              </p>
            </div>
            <Button
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="h-10 rounded-2xl border-border/40 px-4 text-[9px] font-black uppercase tracking-widest"
            >
              <Plus className="mr-1.5 size-3" weight="bold" />
              {t("builder.addItem")}
            </Button>
          </div>

          <div className="grid gap-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="border-t border-border/20 pt-8 first:border-t-0 first:pt-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/45">
                    {t("builder.deliveryLabel")}{" "}
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  {items.length > 1 ? (
                    <Button
                      onClick={() => handleRemoveItem(index)}
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-2xl text-muted-foreground/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash size={18} />
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                  <div className="space-y-2 md:col-span-6">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      {t("builder.deliveryNameLabel")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder={t("builder.deliveryNamePlaceholder")}
                        className="h-12 rounded-2xl border-border/40 bg-muted/10 px-4 text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {PROPOSAL_PRESETS.itemDescriptions.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() =>
                              handleItemChange(
                                index,
                                "description",
                                preset.content
                              )
                            }
                            className="rounded-full bg-muted/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-muted-foreground/60 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-4">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      {t("builder.unitValueLabel")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatCurrencyInput(item.unitValue, currency)}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitValue",
                            parseCurrencyInput(e.target.value)
                          )
                        }
                        className="h-12 rounded-2xl border-border/40 bg-muted/10 px-4 text-sm font-mono font-bold shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      {t("builder.quantityLabel")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      className="h-12 rounded-2xl border-border/40 bg-muted/10 px-3 text-center text-sm font-bold shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-12">
                    <Label className="pl-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      {t("builder.commercialExplanationLabel")}
                    </Label>
                    <div className="space-y-3">
                      <Textarea
                        value={item.longDescription}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "longDescription",
                            e.target.value
                          )
                        }
                        placeholder={t(
                          "builder.commercialExplanationPlaceholder"
                        )}
                        className="min-h-28 rounded-2xl border-border/40 bg-muted/10 px-4 py-3 text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/30"
                      />
                      <div className="flex flex-wrap gap-2">
                        {PROPOSAL_PRESETS.itemLongDescriptions.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              handleItemChange(
                                index,
                                "longDescription",
                                preset.content
                              )
                            }}
                            className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
                          >
                            <MagicWand size={10} weight="bold" />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/70">
              {t("builder.totalInvestmentLabel")}
            </p>
            <p className="font-heading text-5xl font-black tracking-tighter text-foreground">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: currency,
              }).format(total)}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/70">
              {t("builder.totalInvestmentHelper")}
            </p>
          </div>

          <div className="space-y-4 border-t border-border/20 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="size-5 text-brand-primary" weight="bold" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55">
                  {t("builder.connectBonusTitle")}
                </p>
              </div>
              <Switch
                checked={includeConnectBonus}
                onCheckedChange={setIncludeConnectBonus}
                className="data-checked:bg-brand-primary data-unchecked:bg-slate-300 dark:data-unchecked:bg-input/80"
              />
            </div>

            {includeConnectBonus && (
              <div className="rounded-2xl bg-brand-primary/5 p-4 border border-brand-primary/10 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    {t("builder.professionalProfileLabel")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/40 line-through font-medium">
                      R$ 497,00
                    </span>
                    <span className="text-xs font-black text-brand-primary uppercase tracking-tighter">
                      {t("builder.freeLabel")}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-brand-primary/60 font-medium">
                  {t("builder.connectBonusDescription")}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-border/20 pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-brand-primary" weight="bold" />
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55">
                Governanca comercial
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-border/20 bg-muted/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-foreground">
                    Expor no portfolio
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                    Autoriza a MAGUI.studio a mostrar o projeto em portfolio e materiais comerciais.
                  </p>
                </div>
                <Switch
                  checked={exposeInPortfolio}
                  onCheckedChange={setExposeInPortfolio}
                  className="data-checked:bg-brand-primary data-unchecked:bg-slate-300 dark:data-unchecked:bg-input/80"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-foreground">
                    Manter credito no rodape
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                    Se desligado, a proposta assume cenário de white label com taxa adicional.
                  </p>
                </div>
                <Switch
                  checked={keepFooterCredit}
                  onCheckedChange={setKeepFooterCredit}
                  className="data-checked:bg-brand-primary data-unchecked:bg-slate-300 dark:data-unchecked:bg-input/80"
                />
              </div>

              {!keepFooterCredit && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Taxa de white label
                  </Label>
                  <Input
                    value={whiteLabelFeeValue}
                    onChange={(e) =>
                      setWhiteLabelFeeValue(
                        formatCurrencyInput(parseCurrencyInput(e.target.value), currency)
                      )
                    }
                    className="h-12 rounded-2xl border-border/40 bg-background/60 font-mono font-bold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Taxa anual de permanencia
                </Label>
                <Input
                  value={annualRenewalFeeValue}
                  onChange={(e) =>
                    setAnnualRenewalFeeValue(
                      formatCurrencyInput(parseCurrencyInput(e.target.value), currency)
                    )
                  }
                  className="h-12 rounded-2xl border-border/40 bg-background/60 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="flex items-center justify-end gap-4 border-t border-border/10 pt-8">
        <Button
          onClick={() => router.push("/admin/crm/proposals")}
          variant="ghost"
          className="h-14 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest"
        >
          {tCommon("details.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-14 rounded-2xl bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-primary/30 transition-all hover:scale-[1.02] hover:bg-brand-primary/90 active:scale-[0.98]"
        >
          {isSubmitting ? t("builder.submitting") : t("builder.submit")}
        </Button>
      </div>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className="space-y-2 border-t border-border/15 pt-10 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-brand-primary" weight="bold" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
          {title}
        </h3>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/70">
        {description}
      </p>
    </div>
  )
}

function ExecutionDaysBlock({
  value,
  onChange,
  preview,
}: {
  value: number
  onChange: (value: number) => void
  preview: string
}): React.JSX.Element {
  const t = useTranslations("Proposals")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {t("builder.executionDaysLabel")} *
        </Label>
        <div className="rounded-full bg-brand-primary/8 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-primary">
          {getExecutionDaysLabel(value)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[11rem_minmax(0,1fr)]">
        <Input
          type="number"
          min={1}
          step={1}
          value={value}
          onChange={(event) =>
            onChange(Math.max(1, Number(event.target.value) || 1))
          }
          className="h-14 rounded-2xl border-border/40 bg-muted/10 px-5 text-sm font-black transition-all focus:border-brand-primary/50 focus:bg-muted/20"
        />
        <div className="rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-sm leading-relaxed text-muted-foreground/75">
          {preview}
        </div>
      </div>
    </div>
  )
}

function FieldBlock({
  label,
  value,
  onChange,
  placeholder,
  description,
  minHeightClassName,
  presets,
  onApplyPreset,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  description?: string
  minHeightClassName?: string
  presets?: ProposalPreset[]
  onApplyPreset?: (content: string) => void
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {label}
        </Label>
        {presets && onApplyPreset ? (
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.content)}
                className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
              >
                <MagicWand size={10} weight="bold" />
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="text-xs leading-relaxed text-muted-foreground/50">
          {description}
        </p>
      ) : null}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${minHeightClassName ?? "min-h-28"} rounded-2xl border-border/40 bg-muted/10 px-5 py-4 text-sm font-medium transition-all focus:border-brand-primary/50 focus:bg-muted/20`}
      />
    </div>
  )
}
