"use client"

import * as React from "react"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Lead } from "@/src/types/crm"
import {
  CheckCircle,
  Copy,
  Checks,
  CircleNotch,
  Eye,
  EyeSlash,
  RocketLaunch,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet"

import {
  convertLeadToProjectAction,
  updateLead,
} from "@/src/lib/actions/crm.actions"
import { getExecutionDaysLabel } from "@/src/lib/project-schedule"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ConvertLeadDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Array<{ id: string; name: string | null; email: string }>
  onConverted?: (projectId: string) => void
}

function generateStrongPassword(length: number = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%&*()-_=+?"
  const all = `${upper}${lower}${digits}${symbols}`

  const getRandom = (max: number) => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      const array = new Uint32Array(1)
      crypto.getRandomValues(array)
      return array[0] % max
    }

    return Math.floor(Math.random() * max)
  }

  const passwordChars = [
    upper[getRandom(upper.length)],
    lower[getRandom(lower.length)],
    digits[getRandom(digits.length)],
    symbols[getRandom(symbols.length)],
  ]

  while (passwordChars.length < length) {
    passwordChars.push(all[getRandom(all.length)])
  }

  for (let i = passwordChars.length - 1; i > 0; i -= 1) {
    const j = getRandom(i + 1)
    ;[passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]]
  }

  return passwordChars.join("")
}

function generateUsernameFromLead(input: {
  email?: string | null
  companyName?: string | null
  contactName?: string | null
}) {
  const normalizeUsername = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "")
      .replace(/[-_]{2,}/g, "-")

  const emailPrefix = input.email?.split("@")[0]?.trim() ?? ""
  const companyUsername = input.companyName?.trim()
    ? normalizeUsername(input.companyName)
    : ""
  const contactUsername = input.contactName?.trim()
    ? normalizeUsername(input.contactName)
    : ""
  const emailUsername = emailPrefix ? normalizeUsername(emailPrefix) : ""

  const preferred =
    companyUsername || contactUsername || emailUsername || "cliente"

  return (preferred || "cliente").slice(0, 24)
}

function sanitizeUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .replace(/[-_]{2,}/g, "-")
    .slice(0, 24)
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  clients,
  onConverted,
}: ConvertLeadDialogProps): React.JSX.Element {
  const t = useTranslations("Admin.crm.convert")
  const locale = useLocale()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [clientMode, setClientMode] = React.useState<"existing" | "create">(
    "existing"
  )
  const [selectedClientId, setSelectedClientId] = React.useState("")
  const [projectName, setProjectName] = React.useState(lead.companyName)
  const [leadEmail, setLeadEmail] = React.useState(lead.email ?? "")
  const [leadUsername, setLeadUsername] = React.useState("")
  const [leadPassword, setLeadPassword] = React.useState("")
  const [showLeadPassword, setShowLeadPassword] = React.useState(false)
  const [credentialsCopied, setCredentialsCopied] = React.useState(false)

  const acceptedProposals = lead.acceptedProposals ?? []
  const [selectedProposalId, setSelectedProposalId] = React.useState(
    acceptedProposals.length === 1 ? acceptedProposals[0].id : ""
  )
  const hasAcceptedProposal = (lead.acceptedProposalCount ?? 0) > 0

  const selectedProposal = acceptedProposals.find(
    (proposal) => proposal.id === selectedProposalId
  )

  const selectedProposalCategory = selectedProposal?.projectCategory

  const selectedProposalCategoryLabel = React.useMemo(() => {
    if (!selectedProposalCategory) return "Categoria nao definida"

    return (
      {
        LANDING_PAGE: locale === "pt" ? "Landing Page" : "Landing Page",
        INSTITUTIONAL_SITE:
          locale === "pt" ? "Site Institucional" : "Institutional Website",
        BOOKING_PLATFORM:
          locale === "pt"
            ? "Plataforma de Agendamento"
            : "Booking Platform",
        STABILITY_PLAN:
          locale === "pt" ? "Plano de Estabilidade" : "Stability Plan",
      }[selectedProposalCategory] ?? selectedProposalCategory
    )
  }, [locale, selectedProposalCategory])

  const selectedProposalBudgetLabel = React.useMemo(() => {
    if (!selectedProposal) return "Orcamento nao definido"

    return formatCurrencyBRLFromCents(selectedProposal.totalValue)
  }, [selectedProposal])

  const readinessChecks = [
    { label: "Contato principal", ok: Boolean(lead.contactName?.trim()) },
    { label: "E-mail principal", ok: Boolean(leadEmail.trim()) },
    {
      label: "Proposta aceita vinculada",
      ok: !hasAcceptedProposal || Boolean(selectedProposalId),
    },
  ]
  const isReadyToConvert = readinessChecks.every((item) => item.ok)

  React.useEffect(() => {
    if (!credentialsCopied) return

    const timeout = window.setTimeout(() => {
      setCredentialsCopied(false)
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [credentialsCopied])

  const handleCopyCredentials = async () => {
    if (!leadUsername.trim() || !leadPassword.trim()) {
      toast.error("Preencha username e senha antes de copiar o acesso.")
      return
    }

    const message = `Bem-vindo(a)! Seu acesso a plataforma da MAGUI ja esta pronto.\n\nAqui estao seus dados para entrar:\n\nPlataforma: https://dashboard.magui.studio\nUsuario: ${leadUsername.trim()}\nSenha: ${leadPassword}\n\nSe precisar de apoio no primeiro acesso, pode nos chamar por aqui.`

    try {
      await navigator.clipboard.writeText(message)
      setCredentialsCopied(true)
      toast.success("Mensagem de acesso copiada.")
    } catch {
      toast.error("Nao foi possivel copiar a mensagem.")
    }
  }

  const handleConvert = async () => {
    if (clientMode === "existing" && !selectedClientId) {
      toast.error(t("select_client_error"))
      return
    }

    if (clientMode === "create" && !leadEmail.trim()) {
      toast.error(t("email_required_error"))
      return
    }

    if (clientMode === "create" && !leadUsername.trim()) {
      toast.error("Preencha o username do novo cliente.")
      return
    }

    if (clientMode === "create" && !leadPassword.trim()) {
      toast.error("Preencha a senha do novo cliente.")
      return
    }

    const failedCheck = readinessChecks.find((item) => !item.ok)
    if (failedCheck) {
      toast.error(`Complete "${failedCheck.label}" antes de converter.`)
      return
    }

    if (leadEmail.trim() !== (lead.email ?? "").trim()) {
      const updateResult = await updateLead({
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName ?? "",
        email: leadEmail.trim(),
        phone: lead.phone ?? "",
        website: lead.website ?? "",
        instagram: lead.instagram ?? "",
        source: lead.source,
      })

      if (!updateResult.success) {
        toast.error("Nao foi possivel salvar o e-mail do lead antes da conversao.")
        return
      }
    }

    setIsSubmitting(true)
    const result = await convertLeadToProjectAction({
      leadId: lead.id,
      acceptedProposalId: selectedProposalId || undefined,
      userId: clientMode === "existing" ? selectedClientId : undefined,
      newUserData:
        clientMode === "create"
          ? {
              email: leadEmail.trim(),
              name: lead.contactName || lead.companyName,
              username: sanitizeUsername(leadUsername.trim()),
              password: leadPassword,
            }
          : undefined,
      projectData: {
        name: projectName,
        paymentMethod: "FIFTY_FIFTY",
      },
    })

    if (result.success) {
      toast.success(t("success"))
      onOpenChange(false)
      if (result.projectId) {
        onConverted?.(result.projectId)
      }
      router.push(`/admin/projects/${result.projectId}`)
    } else {
      toast.error(result.error || t("error"))
    }

    setIsSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[96vw] overflow-y-auto border-l border-border/15 bg-background p-0 sm:min-w-[40rem] sm:max-w-[42rem] sm:rounded-l-[3.5rem]"
      >
        <SheetHeader className="border-b border-border/10 px-8 py-6 text-left sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-muted/10 text-brand-primary">
              <RocketLaunch weight="bold" className="size-4.5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-xl font-black tracking-tight text-foreground">
                {t("title")}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-muted-foreground/70">
                {t("description")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-7 px-8 py-7 sm:px-10 sm:py-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {readinessChecks.map((item) => (
                <span
                  key={item.label}
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    item.ok
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-amber-500/10 text-amber-700"
                  }`}
                >
                  {item.ok ? "OK" : "Pendente"} · {item.label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground/75">
              Esta conversao abre o projeto operacional usando os dados da
              proposta aceita como fonte comercial oficial.
            </p>

            {hasAcceptedProposal ? (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Proposta aceita de origem{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedProposalId}
                  onValueChange={setSelectedProposalId}
                >
                  <SelectTrigger className="h-12 rounded-2xl border border-border/30 bg-muted/10 shadow-none">
                    <SelectValue placeholder="Selecione a proposta aceita" />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedProposals.map((proposal) => (
                      <SelectItem key={proposal.id} value={proposal.id}>
                        {proposal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("client_section")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={clientMode === "existing" ? "default" : "outline"}
                  className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setClientMode("existing")}
                >
                  {t("existing_client")}
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "create" ? "default" : "outline"}
                  className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setClientMode("create")}
                >
                  {t("create_client")}
                </Button>
              </div>

              {clientMode === "existing" ? (
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger className="h-14 rounded-2xl border border-border/20 bg-muted/10 shadow-none">
                    <SelectValue placeholder="Escolha o cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name || client.email} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              <p className="text-[9px] italic text-muted-foreground/40">
                {clientMode === "create"
                  ? t("create_hint", {
                      email: leadEmail || t("missing_email"),
                    })
                  : "Vincule o projeto a um cliente ja existente."}
              </p>

              {clientMode === "create" ? (
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    E-mail principal do lead{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="h-12 rounded-2xl border border-border/20 bg-muted/10 shadow-none"
                  />

                  <Label className="pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Username do cliente{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={leadUsername}
                      onChange={(e) =>
                        setLeadUsername(sanitizeUsername(e.target.value))
                      }
                      placeholder="usuario-cliente"
                      className="h-12 rounded-2xl border border-border/20 bg-muted/10 pr-24 shadow-none"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 flex h-8 -translate-y-1/2 items-center rounded-full px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 transition-none hover:text-foreground focus:outline-none"
                      onClick={() =>
                        setLeadUsername(
                          generateUsernameFromLead({
                            email: leadEmail,
                            companyName: lead.companyName,
                            contactName: lead.contactName,
                          })
                        )
                      }
                    >
                      Gerar
                    </button>
                  </div>

                  <Label className="pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Senha do cliente{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        value={leadPassword}
                        onChange={(e) => setLeadPassword(e.target.value)}
                        placeholder="Minimo de 8 caracteres"
                        type={showLeadPassword ? "text" : "password"}
                        className="h-12 rounded-2xl border border-border/20 bg-muted/10 pr-32 shadow-none"
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-11 flex h-8 -translate-y-1/2 items-center rounded-full px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 transition-none hover:text-foreground focus:outline-none"
                        onClick={() => setLeadPassword(generateStrongPassword())}
                      >
                        Gerar
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 size-8 -translate-y-1/2 rounded-full text-muted-foreground/60 hover:bg-transparent hover:text-foreground"
                        onClick={() =>
                          setShowLeadPassword((current) => !current)
                        }
                      >
                        {showLeadPassword ? (
                          <EyeSlash className="size-4" weight="bold" />
                        ) : (
                          <Eye className="size-4" weight="bold" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full border-border/20 bg-background px-4 text-[10px] font-black uppercase tracking-widest"
                      onClick={handleCopyCredentials}
                    >
                      {credentialsCopied ? (
                        <Checks className="mr-2 size-4" weight="bold" />
                      ) : (
                        <Copy className="mr-2 size-4" weight="bold" />
                      )}
                      {credentialsCopied ? "Copiado" : "Copiar acesso"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="h-px bg-border/10" />

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("project_section")}
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="ml-1 text-[10px] font-bold uppercase tracking-tight">
                    {t("project_name")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-12 rounded-2xl border-none bg-muted/10 shadow-none"
                  />
                </div>

                {selectedProposal ? (
                  <>
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-tight">
                        Categoria herdada da proposta
                      </Label>
                      <div className="flex h-12 items-center rounded-2xl bg-muted/10 px-4 text-sm font-bold text-foreground/50 opacity-60">
                        {selectedProposalCategoryLabel}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-tight">
                        Orcamento herdado da proposta
                      </Label>
                      <div className="flex h-12 items-center rounded-2xl bg-muted/10 px-4 text-sm font-bold text-foreground/50 opacity-60">
                        {selectedProposalBudgetLabel}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-tight">
                        Prazo herdado da proposta
                      </Label>
                    <div className="flex h-12 items-center rounded-2xl bg-muted/10 px-4 text-sm font-bold text-foreground/50 opacity-60">
                      {getExecutionDaysLabel(
                        selectedProposal.executionBusinessDays
                      )}
                    </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {!hasAcceptedProposal ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                Lead ainda nao possui proposta aceita. Crie e aprove uma
                proposta antes de abrir o projeto.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-5">
              <Button
                variant="ghost"
                className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="h-16 rounded-[1.25rem] bg-brand-primary font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 hover:brightness-110"
                onClick={handleConvert}
                disabled={
                  isSubmitting ||
                  !projectName ||
                  !isReadyToConvert ||
                  !hasAcceptedProposal ||
                  (clientMode === "existing" && !selectedClientId) ||
                  (clientMode === "create" &&
                    (!leadEmail.trim() ||
                      !leadUsername.trim() ||
                      !leadPassword.trim()))
                }
              >
                {isSubmitting ? (
                  <CircleNotch className="mr-2 size-5 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 size-5" weight="bold" />
                )}
                {t("submit")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
