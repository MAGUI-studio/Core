"use client"

import * as React from "react"

import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  CaretDown,
  CopySimple,
  InstagramLogo,
  LinkSimple,
  Plus,
  RocketLaunch,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

import { saveMessageTemplateAction } from "@/src/lib/actions/crm.actions"
import { buildProposalPublicPath } from "@/src/lib/proposals/public-links"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface LeadQuickActionsProps {
  lead: Lead
  templates: MessageTemplate[]
  proposals: Array<{
    id: string
    title: string
    status: string
    totalValue: number
  }>
}

type DirectTemplateOption = {
  id: string
  name: string
  content: string
  source: "built-in" | "saved"
}

function normalizeInstagramUrl(instagram: string | null) {
  if (!instagram?.trim()) return null

  const value = instagram.trim()
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  const username = value.replace(/^@/, "").replace(/^instagram\.com\//, "")
  return `https://instagram.com/${username}`
}

export function LeadQuickActions({
  lead,
  templates,
  proposals,
}: LeadQuickActionsProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedProposalId, setSelectedProposalId] = React.useState("")
  const [customMessage, setCustomMessage] = React.useState("")
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false)
  const [siteOrigin, setSiteOrigin] = React.useState(
    process.env.NEXT_PUBLIC_SITE_URL ?? ""
  )

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setSiteOrigin(window.location.origin)
    }
  }, [])

  const selectedProposal = React.useMemo(
    () =>
      proposals.find((proposal) => proposal.id === selectedProposalId) ?? null,
    [proposals, selectedProposalId]
  )

  const proposalUrl = selectedProposal
    ? `${siteOrigin}${buildProposalPublicPath(
        lead.instagram,
        selectedProposal.id
      )}`
    : ""

  const personalize = React.useCallback(
    (content: string) => {
      return content
        .replace(/{contact}/g, lead.contactName || "tudo bem")
        .replace(/{company}/g, lead.companyName)
        .replace(/{proposalUrl}/g, proposalUrl)
    },
    [lead.companyName, lead.contactName, proposalUrl]
  )

  const builtInTemplates = React.useMemo<DirectTemplateOption[]>(
    () => [
      {
        id: "direct-general",
        name: "Geral",
        source: "built-in",
        content:
          "Oi, {contact}! Tudo bem? Analisei a presença digital da {company} e vi uma oportunidade bem clara de fortalecer a marca e converter melhor quem chega pelo Instagram. Na MAGUI.studio, criamos páginas, landing pages e sites com foco em autoridade, valor percebido e conversão. Você pode ver nosso trabalho em https://magui.studio. Montei uma proposta comercial para a {company} e estou te mandando aqui: {proposalUrl}",
      },
      {
        id: "direct-no-site",
        name: "Sem site",
        source: "built-in",
        content:
          "Oi, {contact}! Vi que a {company} ainda não tem um site estruturado e isso normalmente faz muita empresa boa parecer menor do que realmente é. Na MAGUI.studio, criamos páginas e sites para aumentar a confiança, deixar a apresentação da marca mais profissional e facilitar a conversão de novos clientes. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial pensando nesse cenário e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-ads",
        name: "Rodando anúncio",
        source: "built-in",
        content:
          "Oi, {contact}! Encontrei a {company} durante uma análise de negócios que já investem em divulgação e percebi um ponto importante: quando o tráfego cai só no Instagram ou no direct, muita conversão se perde no caminho. Na MAGUI.studio, criamos páginas e sites pensados para organizar a oferta, valorizar a marca e converter melhor cada clique investido. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial para esse cenário e estou te mandando aqui: {proposalUrl}",
      },
      {
        id: "direct-authority",
        name: "Autoridade",
        source: "built-in",
        content:
          "Oi, {contact}! A {company} tem potencial para ser percebida de forma muito mais forte no digital do que aparenta hoje. Na MAGUI.studio, desenvolvemos páginas e sites com foco em autoridade, clareza de oferta e confiança imediata para quem chega pela primeira vez. Você pode conhecer nosso trabalho em https://magui.studio. Montei uma proposta comercial nessa linha e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-store",
        name: "Loja",
        source: "built-in",
        content:
          "Oi, {contact}! Lojas como a {company} ganham muito quando têm uma página própria para apresentar produtos, diferenciais, localização e prova social com mais força do que só no Instagram. Isso aumenta bastante a percepção de profissionalismo e ajuda na decisão de compra. Na MAGUI.studio, é exatamente esse tipo de estrutura que desenvolvemos. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial para a {company} e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-clinic",
        name: "Clínica",
        source: "built-in",
        content:
          "Oi, {contact}! Clínicas e negócios de atendimento costumam ganhar muito mais confiança quando têm uma página profissional para apresentar serviços, transmitir credibilidade e facilitar o contato logo no primeiro acesso. Em segmentos assim, percepção de cuidado e autoridade pesa demais na decisão. Na MAGUI.studio, desenvolvemos esse tipo de estrutura com foco em posicionamento e conversão. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial para a {company} e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-local-business",
        name: "Negócio local",
        source: "built-in",
        content:
          "Oi, {contact}! A {company} pode ganhar muita força com uma página própria para apresentar serviços, localização, reputação e formas de contato sem depender só do Instagram. Isso costuma aumentar a confiança de quem já está interessado e diminuir a fricção na hora de entrar em contato. Na MAGUI.studio, criamos esse tipo de estrutura com foco comercial. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial para a {company} e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-service",
        name: "Prestador de serviço",
        source: "built-in",
        content:
          "Oi, {contact}! A {company} pode vender melhor com uma página profissional que organize os serviços, valorize a apresentação da marca e aumente a confiança de quem chega pelo direct. Quando a oferta fica clara e bem apresentada, a conversa comercial costuma avançar muito mais fácil. É exatamente esse tipo de presença digital que criamos na MAGUI.studio: https://magui.studio. Montei uma proposta comercial para esse cenário e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-industrial",
        name: "Técnico / oficina",
        source: "built-in",
        content:
          "Oi, {contact}! Negócios mais técnicos, como oficinas, auto centers, lojas de peças, pneus e serviços especializados, ganham muita credibilidade quando conseguem explicar bem o que fazem em uma página profissional. Isso ajuda a diferenciar a empresa, passar mais segurança e facilitar o contato comercial. Esse é um dos tipos de projeto que desenvolvemos na MAGUI.studio: https://magui.studio. Montei uma proposta comercial para a {company} e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-premium",
        name: "Mais premium",
        source: "built-in",
        content:
          "Oi, {contact}! Vi espaço real para elevar o posicionamento digital da {company}. Quando a apresentação da marca sobe de nível, a percepção de valor muda junto e isso impacta diretamente na forma como o cliente enxerga o negócio. Na MAGUI.studio, criamos páginas e sites com direção estratégica, apresentação refinada e foco em autoridade e conversão. Nosso trabalho está em https://magui.studio. Montei uma proposta comercial nessa linha e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-short",
        name: "Curta",
        source: "built-in",
        content:
          "Oi, {contact}! Na MAGUI.studio, criamos páginas, landing pages e sites profissionais para fortalecer a marca, aumentar a confiança e ajudar na conversão de clientes. Montei uma proposta comercial para a {company} e estou te enviando aqui: {proposalUrl}",
      },
      {
        id: "direct-follow-up",
        name: "Follow-up",
        source: "built-in",
        content:
          "Oi, {contact}! Passando para reforçar esse contato porque muitas marcas boas acabam parecendo menores do que realmente são por falta de uma apresentação digital mais forte. Foi exatamente pensando nisso que montei essa proposta para a {company}. Na MAGUI.studio, criamos páginas e sites estratégicos para posicionar melhor a marca e aumentar a confiança de quem chega. Nosso trabalho está em https://magui.studio. Proposta: {proposalUrl}",
      },
    ],
    []
  )

  const savedTemplates = React.useMemo<DirectTemplateOption[]>(
    () =>
      templates.map((template) => ({
        id: template.id,
        name: template.name,
        content: template.content,
        source: "saved" as const,
      })),
    [templates]
  )

  const directTemplates = React.useMemo(
    () => [...builtInTemplates, ...savedTemplates],
    [builtInTemplates, savedTemplates]
  )

  const instagramUrl = normalizeInstagramUrl(lead.instagram)

  const handleTemplateSelect = (template: DirectTemplateOption) => {
    if (!selectedProposal) {
      toast.error("Escolha uma proposta antes de gerar a mensagem.")
      return
    }

    setCustomMessage(personalize(template.content))
  }

  const handleSaveAsTemplate = async () => {
    if (!customMessage.trim()) return

    setIsSavingTemplate(true)
    const result = await saveMessageTemplateAction({
      name: `Direct ${new Date().toLocaleDateString("pt-BR")}`,
      content: customMessage
        .replaceAll(lead.companyName, "{company}")
        .replaceAll(lead.contactName || "tudo bem", "{contact}")
        .replaceAll(proposalUrl, "{proposalUrl}"),
      scope: "LEAD",
    })

    if (result.success) {
      toast.success("Mensagem salva como template.")
    } else {
      toast.error(result.error || "Erro ao salvar template.")
    }

    setIsSavingTemplate(false)
  }

  const handleCopyMessage = async () => {
    if (!selectedProposal) {
      toast.error("Escolha uma proposta antes de copiar a mensagem.")
      return
    }

    if (!customMessage.trim()) return

    await navigator.clipboard.writeText(customMessage)
    toast.success("Mensagem copiada para colar no direct.")
  }

  const handleCopyProposalLink = async () => {
    if (!selectedProposal || !proposalUrl) {
      toast.error("Escolha uma proposta para copiar o link.")
      return
    }

    await navigator.clipboard.writeText(proposalUrl)
    toast.success("Link público da proposta copiado.")
  }

  return (
    <section className="grid gap-6 border-b border-border/15 pb-8">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
              Mensagens para direct
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Escolha a proposta, gere a mensagem com o link público e copie
              para o Instagram do lead.
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
            >
              {open ? "Ocultar" : "Mostrar"}
              <CaretDown
                className={`ml-2 size-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-6 pt-6">
          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Proposta para enviar
            </Label>
            <Select
              value={selectedProposalId}
              onValueChange={setSelectedProposalId}
            >
              <SelectTrigger className="h-12 rounded-2xl border border-border/30 bg-muted/10 shadow-none">
                <SelectValue placeholder="Escolha a proposta que vai no direct" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/30 bg-background">
                {proposals.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id}>
                    {proposal.title} -{" "}
                    {formatCurrencyBRLFromCents(proposal.totalValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProposal ? (
              <div className="rounded-2xl border border-border/15 bg-muted/5 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                  Link público da proposta
                </p>
                <p className="mt-1 break-all text-sm font-medium text-foreground/75">
                  {proposalUrl}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Abordagens prontas
            </Label>
            <div className="flex flex-wrap gap-2">
              {directTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="secondary"
                  size="sm"
                  disabled={!selectedProposal}
                  onClick={() => handleTemplateSelect(template)}
                  className="rounded-full border border-border/40 bg-muted/20 text-[9px] font-black uppercase tracking-widest"
                >
                  {template.source === "built-in" ? (
                    <RocketLaunch className="mr-2 size-3.5" weight="fill" />
                  ) : (
                    <Plus className="mr-2 size-3.5" />
                  )}
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Mensagem para copiar
              </Label>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSavingTemplate || !customMessage.trim()}
                onClick={handleSaveAsTemplate}
                className="h-7 rounded-full text-[8px] font-black uppercase tracking-widest"
              >
                <Plus className="mr-1 size-3" />
                Salvar template
              </Button>
            </div>

            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={
                selectedProposal
                  ? "Escolha uma abordagem pronta ou escreva sua própria mensagem..."
                  : "Escolha uma proposta primeiro para gerar a mensagem com o link."
              }
              className="min-h-[220px] rounded-2xl border-border/40 bg-background/50 text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => void handleCopyMessage()}
                disabled={!selectedProposal || !customMessage.trim()}
                className="h-12 rounded-full bg-foreground text-[10px] font-black uppercase tracking-widest text-background"
              >
                <CopySimple size={18} weight="bold" className="mr-2" />
                Copiar mensagem
              </Button>

              <Button
                asChild
                variant="outline"
                disabled={!instagramUrl}
                className="h-12 rounded-full border-pink-500/20 bg-pink-500/5 text-[10px] font-black uppercase tracking-widest text-pink-700 hover:bg-pink-500/10"
              >
                {instagramUrl ? (
                  <a href={instagramUrl} target="_blank" rel="noreferrer">
                    <InstagramLogo size={18} weight="fill" className="mr-2" />
                    Abrir Instagram
                  </a>
                ) : (
                  <span>
                    <InstagramLogo size={18} className="mr-2" />
                    Sem Instagram
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
