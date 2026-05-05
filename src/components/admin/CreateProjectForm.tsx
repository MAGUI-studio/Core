"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { PaymentMethod, ServiceCategory } from "@/src/generated/client"
import {
  ArrowRightIcon,
  CalendarCheck,
  Calendar as CalendarIcon,
  CaretUpDown,
  Check,
  Clock,
  CurrencyDollar,
  FileText,
  FolderPlus,
  House,
  Lightning,
  Percent,
  Plus,
  Shield,
  ShieldCheck,
  Trash,
  User,
} from "@phosphor-icons/react"
import { addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/src/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import { Textarea } from "@/src/components/ui/textarea"

import { createProjectAction } from "@/src/lib/actions/project.actions"
import { getInternationalizationFeeCents } from "@/src/lib/utils/project-pricing"
import {
  cn,
  formatCurrencyBRL,
  formatCurrencyBRLFromCents,
  parseCurrencyBRLToCents,
} from "@/src/lib/utils/utils"

interface ClientSelection {
  id: string
  name: string | null
  email: string
}

interface CreateProjectFormProps {
  clients: ClientSelection[]
  serviceCategories: ServiceCategory[]
}

export function CreateProjectForm({
  clients,
  serviceCategories,
}: CreateProjectFormProps) {
  const t = useTranslations("Admin.projects.form")
  const router = useRouter()

  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [openClients, setOpenClients] = React.useState(false)

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("")
  const [customValue, setCustomValue] = React.useState(false)
  const [hasInternationalization, setHasInternationalization] =
    React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    PaymentMethod.FIFTY_FIFTY
  )

  const [deadline, setDeadline] = React.useState<Date | undefined>(undefined)
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date())
  const [budgetBaseValue, setBudgetBaseValue] = React.useState("")

  const [installments, setInstallments] = React.useState<
    Array<{ id: string; amount: string; dueDate: Date }>
  >([])

  const selectedService = serviceCategories.find(
    (s) => s.id === selectedCategoryId
  )
  const normalizedServiceName = selectedService?.name ?? ""
  const projectCategoryValue = normalizedServiceName.includes("Landing")
    ? "LANDING_PAGE"
    : normalizedServiceName.includes("Institucional")
      ? "INSTITUTIONAL_SITE"
      : normalizedServiceName.includes("Agendamento") ||
          normalizedServiceName.includes("Sistema")
        ? "BOOKING_PLATFORM"
        : normalizedServiceName.includes("Manutenção") ||
            normalizedServiceName.includes("Estabilidade")
          ? "STABILITY_PLAN"
          : ""

  React.useEffect(() => {
    if (selectedService && !customValue) {
      setBudgetBaseValue(
        formatCurrencyBRLFromCents(selectedService.suggestedValue)
      )
    }
  }, [selectedService, customValue])

  const baseBudgetCents = React.useMemo(
    () => parseCurrencyBRLToCents(budgetBaseValue),
    [budgetBaseValue]
  )

  const internationalizationFeeCents = React.useMemo(() => {
    if (!hasInternationalization) return 0

    return getInternationalizationFeeCents(
      selectedService?.name,
      baseBudgetCents
    )
  }, [baseBudgetCents, hasInternationalization, selectedService?.name])

  const totalBudgetCents = React.useMemo(
    () => baseBudgetCents + internationalizationFeeCents,
    [baseBudgetCents, internationalizationFeeCents]
  )

  const totalBudgetValue = React.useMemo(
    () =>
      totalBudgetCents > 0 ? formatCurrencyBRLFromCents(totalBudgetCents) : "",
    [totalBudgetCents]
  )

  // Auto-generate 50/50 installments
  React.useEffect(() => {
    if (paymentMethod === PaymentMethod.FIFTY_FIFTY && totalBudgetCents > 0) {
      const half = Math.floor(totalBudgetCents / 2)
      const remainder = totalBudgetCents - half
      setInstallments([
        {
          id: "inst-1",
          amount: formatCurrencyBRLFromCents(half),
          dueDate: new Date(),
        },
        {
          id: "inst-2",
          amount: formatCurrencyBRLFromCents(remainder),
          dueDate: addDays(new Date(), 30),
        },
      ])
    }
  }, [paymentMethod, totalBudgetCents])

  const addInstallment = () => {
    setInstallments([
      ...installments,
      {
        id: Math.random().toString(36).substr(2, 9),
        amount: "",
        dueDate: addDays(new Date(), 7 * (installments.length + 1)),
      },
    ])
  }

  const removeInstallment = (id: string) => {
    setInstallments(installments.filter((inst) => inst.id !== id))
  }

  const updateInstallment = (
    id: string,
    key: "amount" | "dueDate",
    value: string | Date | undefined
  ) => {
    setInstallments(
      installments.map((inst) =>
        inst.id === id ? { ...inst, [key]: value } : inst
      )
    )
  }

  const setDeadlineByDays = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDeadline(date)
  }

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      formData.set("clientId", selectedClientId)
      formData.set("serviceCategoryId", selectedCategoryId)
      formData.set("customValue", customValue.toString())
      formData.set(
        "hasInternationalization",
        hasInternationalization.toString()
      )
      formData.set(
        "internationalizationFee",
        formatCurrencyBRLFromCents(internationalizationFeeCents)
      )
      formData.set("paymentMethod", paymentMethod)
      formData.set("budget", totalBudgetValue)
      formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)

      if (deadline) formData.set("deadline", deadline.toISOString())
      if (startDate) formData.set("startDate", startDate.toISOString())

      // Add installments data
      if (installments.length > 0) {
        const installmentsData = installments.map((inst, index) => ({
          number: index + 1,
          amount: parseCurrencyBRLToCents(inst.amount),
          dueDate: inst.dueDate.toISOString(),
        }))
        formData.set("installments", JSON.stringify(installmentsData))
      }

      const result = await createProjectAction(formData)
      if (result.success) {
        router.push("/admin/projects")
        return { success: true, error: null }
      }
      return { success: false, error: result.error }
    },
    { success: false, error: null }
  )

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBudgetBaseValue(formatCurrencyBRL(value))
  }

  const getCategoryIcon = (name: string) => {
    if (name.includes("Landing"))
      return <Lightning className="size-5" weight="bold" />
    if (name.includes("Institucional"))
      return <House className="size-5" weight="bold" />
    if (name.includes("Agendamento"))
      return <CalendarCheck className="size-5" weight="bold" />
    return <Shield className="size-5" weight="bold" />
  }

  return (
    <form action={formAction} className="mx-auto w-full">
      <FieldGroup className="gap-12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
          Os campos marcados com <span className="text-red-500">*</span> sÃ£o
          obrigatÃ³rios.
        </p>

        <FieldSet>
          <div className="mb-6 flex flex-col gap-1">
            <FieldLegend className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
              {t("client_info")}
            </FieldLegend>
            <FieldDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              {t("client_protocol")}
            </FieldDescription>
          </div>

          <Field data-invalid={state.error && !selectedClientId}>
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Cliente Responsável <span className="text-red-500">*</span>
            </FieldLabel>

            <input type="hidden" name="clientId" value={selectedClientId} />

            <Popover open={openClients} onOpenChange={setOpenClients}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClients}
                  className="h-16 w-full justify-between rounded-3xl border-border/40 bg-muted/10 px-6 font-sans font-bold text-foreground transition-all hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <User
                      weight="bold"
                      className="size-5 text-brand-primary/60"
                    />
                    {selectedClientId
                      ? clients.find((client) => client.id === selectedClientId)
                          ?.name ||
                        clients.find((client) => client.id === selectedClientId)
                          ?.email
                      : t("select_client_placeholder")}
                  </div>
                  <CaretUpDown
                    weight="bold"
                    className="size-4 shrink-0 opacity-50"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <Command>
                  <CommandInput
                    placeholder={t("search_client_placeholder")}
                    className="h-14 border-none bg-transparent"
                  />
                  <CommandList className="max-h-80 scrollbar-hide">
                    <CommandEmpty className="py-8 text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {t("empty_clients")}
                    </CommandEmpty>
                    <CommandGroup className="p-3">
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.email}
                          onSelect={() => {
                            setSelectedClientId(client.id)
                            setOpenClients(false)
                          }}
                          className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-4 transition-all hover:bg-muted/50 aria-selected:bg-brand-primary/10"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "flex size-10 items-center justify-center rounded-xl border border-border/40 bg-background/50 text-xs font-black uppercase transition-colors",
                                selectedClientId === client.id
                                  ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
                                  : "text-muted-foreground/60"
                              )}
                            >
                              {client.name ? client.name.substring(0, 2) : "??"}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                {client.name || t("hidden_identity")}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground/40">
                                {client.email}
                              </span>
                            </div>
                          </div>
                          {selectedClientId === client.id && (
                            <Check
                              weight="bold"
                              className="size-4 text-brand-primary"
                            />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        </FieldSet>

        <FieldSet>
          <div className="mb-6 flex flex-col gap-1">
            <FieldLegend className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
              {t("project_info")}
            </FieldLegend>
            <FieldDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              EstratÃ©gia comercial e parÃ¢metros de execuÃ§Ã£o
            </FieldDescription>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("projectName")} <span className="text-red-500">*</span>
              </FieldLabel>
              <InputGroup className="h-16 rounded-3xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
                <InputGroupAddon>
                  <FolderPlus
                    weight="bold"
                    className="size-5 text-brand-primary/60"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  name="projectName"
                  placeholder="Ex: Landing Page MAGUI"
                  required
                  disabled={isPending}
                  className="font-sans font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/30"
                />
              </InputGroup>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                Categoria de ServiÃ§o <span className="text-red-500">*</span>
              </FieldLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {serviceCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col gap-4 rounded-3xl border p-6 transition-all duration-300",
                      selectedCategoryId === cat.id
                        ? "border-brand-primary bg-brand-primary/5 shadow-2xl shadow-brand-primary/10"
                        : "border-border/40 bg-muted/5 hover:border-brand-primary/40 hover:bg-muted/10"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl transition-colors",
                        selectedCategoryId === cat.id
                          ? "bg-brand-primary text-white"
                          : "bg-muted/10 text-brand-primary/60 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                      )}
                    >
                      {getCategoryIcon(cat.name)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground">
                        {cat.name}
                      </h5>
                      <p className="text-[11px] font-bold text-brand-primary">
                        {formatCurrencyBRLFromCents(cat.suggestedValue)}
                        {cat.isSubscription ? "/Mês" : ""}
                      </p>
                    </div>
                    {selectedCategoryId === cat.id && (
                      <div className="absolute top-4 right-4 animate-in fade-in zoom-in">
                        <Check
                          weight="bold"
                          className="size-4 text-brand-primary"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <input
                type="hidden"
                name="category"
                value={projectCategoryValue}
              />
            </Field>

            {selectedService && (
              <div className="md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">
                        <Lightning weight="bold" className="size-4" />
                        ServiÃ§o Selecionado
                      </h4>
                      {selectedService.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedService.imageUrl}
                          alt={selectedService.name}
                          className="h-40 w-full rounded-3xl object-cover border border-border/30 bg-muted/10"
                        />
                      ) : null}
                      {selectedService.description ? (
                        <p className="text-sm font-medium leading-relaxed text-foreground">
                          {selectedService.description}
                        </p>
                      ) : null}
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                        {selectedService.description &&
                        selectedService.description.trim() ===
                          selectedService.approach.trim()
                          ? null
                          : selectedService.approach}
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                          Valor Sugerido
                        </h4>
                        <p className="font-heading text-3xl font-black text-foreground">
                          R${" "}
                          {formatCurrencyBRLFromCents(
                            selectedService.suggestedValue
                          )}
                          {selectedService.isSubscription ? (
                            <span className="text-sm font-bold text-muted-foreground/40 ml-2">
                              /Mês
                            </span>
                          ) : (
                            ""
                          )}
                        </p>
                      </div>
                      {/* Custos de terceiros removido: nao precisamos dessa info no fluxo */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Field>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  Investimento do Projeto
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="custom-value"
                    checked={customValue}
                    onCheckedChange={(checked) =>
                      setCustomValue(checked as boolean)
                    }
                    className="size-5 rounded-lg border-brand-primary/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <label
                    htmlFor="custom-value"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 cursor-pointer"
                  >
                    Valor Personalizado
                  </label>
                </div>
              </div>
              <InputGroup
                className={cn(
                  "h-16 rounded-3xl border-border/40 bg-muted/10 transition-all",
                  customValue
                    ? "focus-within:bg-muted/20 border-brand-primary/40"
                    : "opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <InputGroupAddon>
                  <CurrencyDollar
                    weight="bold"
                    className={cn(
                      "size-5",
                      customValue
                        ? "text-brand-primary"
                        : "text-muted-foreground/40"
                    )}
                  />
                </InputGroupAddon>
                <InputGroupInput
                  value={budgetBaseValue}
                  onChange={handleBudgetChange}
                  readOnly={!customValue}
                  placeholder="R$ 0,00"
                  disabled={isPending}
                  className="font-mono text-lg font-black text-foreground placeholder:text-muted-foreground/20"
                />
              </InputGroup>
            </Field>

            <Field>
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  InternacionalizaÃ§Ã£o
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="has-internationalization"
                    checked={hasInternationalization}
                    onCheckedChange={(checked) =>
                      setHasInternationalization(Boolean(checked))
                    }
                    className="size-5 rounded-lg border-brand-primary/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <label
                    htmlFor="has-internationalization"
                    className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                  >
                    Adicionar i18n
                  </label>
                </div>
              </div>
              <div className="flex h-16 flex-col justify-center rounded-3xl border border-border/40 bg-muted/10 px-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  AcrÃ©scimo
                </span>
                <span className="font-mono text-lg font-black text-foreground">
                  {internationalizationFeeCents > 0
                    ? formatCurrencyBRLFromCents(internationalizationFeeCents)
                    : hasInternationalization
                      ? "Inclusa"
                      : "Não aplicado"}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                CondiÃ§Ã£o de Pagamento
              </FieldLabel>
              <div className="flex gap-3 h-16">
                <Button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentMethod.FIFTY_FIFTY)}
                  className={cn(
                    "flex-1 rounded-3xl font-sans font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
                    paymentMethod === PaymentMethod.FIFTY_FIFTY
                      ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                      : "bg-muted/10 text-muted-foreground/60 border border-border/20 hover:bg-muted/20"
                  )}
                >
                  <Percent weight="bold" className="size-4 mr-2" />
                  50% Entrada + 50% Final
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(PaymentMethod.MONTHLY_INSTALLMENTS)
                  }
                  className={cn(
                    "flex-1 rounded-3xl font-sans font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
                    paymentMethod === PaymentMethod.MONTHLY_INSTALLMENTS
                      ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                      : "bg-muted/10 text-muted-foreground/60 border border-border/20 hover:bg-muted/20"
                  )}
                >
                  <Clock weight="bold" className="size-4 mr-2" />
                  Parcelamento Mensal
                </Button>
              </div>
            </Field>
          </div>

          <div className="mt-8 rounded-3xl border border-brand-primary/20 bg-brand-primary/5 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                  Resumo comercial
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground/70">
                  Valor base {budgetBaseValue || "R$ 0,00"} + i18n{" "}
                  {internationalizationFeeCents > 0
                    ? formatCurrencyBRLFromCents(internationalizationFeeCents)
                    : hasInternationalization
                      ? "Inclusa"
                      : "Não aplicado"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                  Total do projeto
                </p>
                <p className="font-heading text-3xl font-black text-foreground">
                  {totalBudgetValue || "R$ 0,00"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                  Faturamento Estruturado
                </h4>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  {paymentMethod === PaymentMethod.FIFTY_FIFTY
                    ? "As faturas serÃ£o geradas automaticamente baseadas no valor total."
                    : "Defina manualmente as parcelas mensais acordadas com o cliente."}
                </p>
              </div>
              {paymentMethod === PaymentMethod.MONTHLY_INSTALLMENTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstallment}
                  className="h-12 rounded-full border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 px-6 font-sans text-[10px] font-black uppercase tracking-widest gap-2"
                >
                  <Plus weight="bold" className="size-3" />
                  Nova Parcela
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {installments.map((inst, index) => (
                <div
                  key={inst.id}
                  className="flex flex-col gap-6 p-8 rounded-[40px] border border-border/40 bg-muted/5 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-xs font-black font-mono">
                        {index + 1}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                        {index === 0
                          ? "Fatura de Entrada"
                          : index === installments.length - 1
                            ? "Fatura de Entrega"
                            : `Parcela ${index + 1}`}
                      </span>
                    </div>
                    {paymentMethod === PaymentMethod.MONTHLY_INSTALLMENTS && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstallment(inst.id)}
                        className="size-10 rounded-xl text-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Trash weight="bold" className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">
                        Valor
                      </label>
                      <InputGroup className="h-14 rounded-2xl border-border/40 bg-background/50 transition-all focus-within:bg-background">
                        <InputGroupAddon>
                          <CurrencyDollar
                            weight="bold"
                            className="size-4 text-brand-primary/60"
                          />
                        </InputGroupAddon>
                        <InputGroupInput
                          value={inst.amount}
                          onChange={(e) =>
                            updateInstallment(
                              inst.id,
                              "amount",
                              formatCurrencyBRL(e.target.value)
                            )
                          }
                          readOnly={paymentMethod === PaymentMethod.FIFTY_FIFTY}
                          placeholder="R$ 0,00"
                          className="text-sm font-bold font-mono"
                        />
                      </InputGroup>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">
                        Vencimento
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-14 w-full justify-start text-left font-mono text-sm font-bold rounded-2xl border-border/40 bg-background/50 hover:bg-background"
                          >
                            <CalendarIcon
                              className="mr-3 size-4 text-brand-primary/60"
                              weight="bold"
                            />
                            {format(inst.dueDate, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-3xl border-border/40 shadow-2xl overflow-hidden"
                          align="center"
                        >
                          <Calendar
                            mode="single"
                            selected={inst.dueDate}
                            onSelect={(date) =>
                              date &&
                              updateInstallment(inst.id, "dueDate", date)
                            }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-12">
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                Data de InÃ­cio da OperaÃ§Ã£o
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-16 justify-start text-left font-sans font-bold rounded-3xl border-border/40 bg-muted/10 px-6 transition-all hover:bg-muted/20"
                  >
                    <CalendarIcon
                      className="mr-3 size-5 text-brand-primary/60"
                      weight="bold"
                    />
                    {startDate ? (
                      format(startDate, "PPP", { locale: ptBR })
                    ) : (
                      <span className="font-medium opacity-30">
                        Definir inÃ­cio
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("deadline")}
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-16 justify-start text-left font-sans font-bold rounded-3xl border-border/40 bg-muted/10 px-6 transition-all hover:bg-muted/20",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon
                      className="mr-3 size-5 text-brand-primary/60"
                      weight="bold"
                    />
                    {deadline ? (
                      format(deadline, "PPP", { locale: ptBR })
                    ) : (
                      <span className="font-medium opacity-30">
                        {t("deadline_placeholder")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <div className="mt-4 flex flex-wrap gap-2">
                {[7, 14, 21, 30, 45, 60].map((days) => (
                  <Badge
                    key={days}
                    variant="outline"
                    className="cursor-pointer border-border/40 bg-muted/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary rounded-full"
                    onClick={() => setDeadlineByDays(days)}
                  >
                    {days} dias
                  </Badge>
                ))}
              </div>
            </Field>
          </div>

          <Field className="mt-12">
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("projectDescription")}
            </FieldLabel>
            <InputGroup className="min-h-[160px] items-start rounded-[40px] border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20 p-2">
              <InputGroupAddon className="pt-6 pl-4">
                <FileText
                  weight="bold"
                  className="size-5 text-brand-primary/60"
                />
              </InputGroupAddon>
              <Textarea
                name="projectDescription"
                placeholder={t("project_description_placeholder")}
                disabled={isPending}
                className="flex-1 border-none bg-transparent pt-6 font-sans font-bold text-foreground shadow-none ring-0 focus-visible:ring-0 placeholder:font-medium placeholder:text-muted-foreground/30 min-h-[140px]"
              />
            </InputGroup>
          </Field>
        </FieldSet>

        <div className="mt-8 flex flex-col gap-8 rounded-[40px] border border-border/40 bg-muted/5 p-10 backdrop-blur-sm">
          {state.error && (
            <div className="flex items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck weight="bold" className="size-6 text-destructive" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-destructive">
                {state.error}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
                {t("confirmation_title")}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 max-w-md">
                {t("confirmation_desc")}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !selectedClientId || !selectedCategoryId}
              className="group relative h-20 w-full max-w-sm overflow-hidden rounded-full border border-brand-primary/20 bg-brand-primary font-sans font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-brand-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <div className="relative z-10 flex items-center gap-4">
                {isPending ? (
                  <>
                    <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">{t("submit")}</span>
                    <ArrowRightIcon
                      weight="bold"
                      className="size-6 transition-transform group-hover:translate-x-3"
                      data-icon="inline-end"
                    />
                  </>
                )}
              </div>
              <div className="absolute inset-0 z-0 bg-linear-to-tr from-brand-primary via-brand-primary to-brand-luminous opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  )
}
