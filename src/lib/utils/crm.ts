import { LeadStatus } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import { formatBrazilPhoneInput } from "@/src/lib/utils/phone"

export const CRM_STATUS_ORDER: LeadStatus[] = [
  LeadStatus.GARIMPAGEM,
  LeadStatus.CONTATO_REALIZADO,
  LeadStatus.NEGOCIACAO,
  LeadStatus.CONVERTIDO,
]

export const LEAD_STATUS_STYLES: Record<
  LeadStatus,
  {
    badge: string
    accent: string
    column: string
  }
> = {
  GARIMPAGEM: {
    badge: "border-border/50 bg-muted/30 text-foreground/75",
    accent: "text-foreground/70",
    column: "border-border/40 bg-muted/10",
  },
  CONTATO_REALIZADO: {
    badge: "border-border/50 bg-muted/30 text-foreground/75",
    accent: "text-foreground/70",
    column: "border-border/40 bg-muted/10",
  },
  NEGOCIACAO: {
    badge: "border-border/50 bg-muted/30 text-foreground/75",
    accent: "text-foreground/70",
    column: "border-border/40 bg-muted/10",
  },
  CONVERTIDO: {
    badge: "border-border/50 bg-muted/30 text-foreground/75",
    accent: "text-foreground/70",
    column: "border-border/40 bg-muted/10",
  },
  DESCARTADO: {
    badge: "border-border/50 bg-muted/30 text-foreground/75",
    accent: "text-foreground/70",
    column: "border-border/40 bg-muted/10",
  },
}

export function getLeadDaysWithoutMovement(lead: Lead): number {
  const updatedAt = new Date(lead.updatedAt)
  const today = new Date()
  const diff = today.getTime() - updatedAt.getTime()

  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function isLeadStagnant(lead: Lead): boolean {
  return (
    (lead.status === LeadStatus.GARIMPAGEM ||
      lead.status === LeadStatus.CONTATO_REALIZADO) &&
    getLeadDaysWithoutMovement(lead) > 3
  )
}

export function getNextActionMeta(dateValue: string | Date | null): {
  label: string
  tone: string
} {
  if (!dateValue) {
    return {
      label: "",
      tone: "text-transparent",
    }
  }

  const target = new Date(dateValue)
  const now = new Date()
  const diffInDays = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffInDays < 0) {
    return {
      label: `Atrasado há ${Math.abs(diffInDays)} dia(s)`,
      tone: "text-[oklch(0.58_0.17_24)]",
    }
  }

  if (diffInDays <= 1) {
    return {
      label:
        diffInDays === 0
          ? "Ação prevista para hoje"
          : "Ação prevista para amanhã",
      tone: "text-[oklch(0.6_0.11_70)]",
    }
  }

  return {
    label: `Próximo toque em ${diffInDays} dia(s)`,
    tone: "text-[oklch(0.5_0.15_245)]",
  }
}

export function sanitizePhoneForWhatsApp(
  phone: string | null | undefined
): string {
  return (phone ?? "").replace(/\D/g, "")
}

export function formatLeadPhone(phone: string | null | undefined): string {
  if (!phone) return ""
  return formatBrazilPhoneInput(phone)
}

export function getLeadWhatsappLinks(lead: Lead): Array<{
  label: string
  href: string | null
  message: string
}> {
  const phone = sanitizePhoneForWhatsApp(lead.phone)
  const contact = lead.contactName || "time"
  const company = lead.companyName

  const messages = [
    {
      label: "Portal de clientes",
      message: `Olá ${contact}, vi que a ${company} ainda não possui um portal de clientes com uma experiência mais estratégica. Posso te mostrar como isso pode elevar percepção de valor, suporte e operação?`,
    },
    {
      label: "Diagnóstico rápido",
      message: `Olá ${contact}, analisei o cenário digital da ${company} e enxerguei algumas oportunidades claras de conversão e autoridade. Se fizer sentido, posso te enviar um diagnóstico rápido por aqui.`,
    },
    {
      label: "Retomar conversa",
      message: `Olá ${contact}, passando para retomar nossa conversa sobre a ${company}. Se ainda estiver no radar, consigo te propor um caminho objetivo para destravar a próxima etapa.`,
    },
  ]

  return messages.map((item) => ({
    ...item,
    href: phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(item.message)}`
      : null,
  }))
}
