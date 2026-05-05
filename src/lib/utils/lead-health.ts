import { LeadSource, LeadStatus } from "@/src/generated/client"

type LeadHealthInput = {
  status: LeadStatus
  source: LeadSource
  createdAt: Date | string
  updatedAt: Date | string
  lastContactAt: Date | string | null
  contactName: string | null
  email: string | null
  phone: string | null
  instagram: string | null
  website: string | null
}

export type LeadHealthSnapshot = {
  score: number
  tone: "healthy" | "attention" | "risk"
  summary: string
  reasons: string[]
}

function daysSince(value: Date | string | null): number {
  if (!value) {
    return 999
  }

  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

export function getLeadHealth(input: LeadHealthInput): LeadHealthSnapshot {
  const reasons: string[] = []
  let score = 100

  const daysWithoutUpdate = daysSince(input.updatedAt)
  const daysWithoutContact = daysSince(input.lastContactAt)

  if (!input.contactName) {
    score -= 10
    reasons.push("sem contato principal")
  }

  if (!input.phone && !input.email && !input.instagram) {
    score -= 18
    reasons.push("sem canal de contato")
  }

  if (input.source === LeadSource.OTHER) {
    score -= 8
    reasons.push("origem pouco definida")
  }

  if (!input.website && !input.instagram) {
    score -= 8
    reasons.push("faltam referências do lead")
  }

  if (daysWithoutUpdate > 14) {
    score -= 28
    reasons.push(`${daysWithoutUpdate} dias sem avanço`)
  } else if (daysWithoutUpdate > 7) {
    score -= 18
    reasons.push(`${daysWithoutUpdate} dias sem atualização`)
  } else if (daysWithoutUpdate > 3) {
    score -= 10
    reasons.push(`${daysWithoutUpdate} dias parado`)
  }

  if (
    (input.status === LeadStatus.CONTATO_REALIZADO ||
      input.status === LeadStatus.NEGOCIACAO) &&
    daysWithoutContact > 5
  ) {
    score -= 15
    reasons.push("follow-up atrasado")
  }

  if (input.status === LeadStatus.GARIMPAGEM && daysWithoutUpdate > 5) {
    score -= 12
    reasons.push("triagem parada")
  }

  if (input.status === LeadStatus.NEGOCIACAO && daysWithoutUpdate > 10) {
    score -= 12
    reasons.push("negociação esfriando")
  }

  score = Math.max(0, Math.min(100, score))

  const tone = score >= 75 ? "healthy" : score >= 50 ? "attention" : "risk"

  return {
    score,
    tone,
    reasons,
    summary:
      reasons.length > 0
        ? reasons.slice(0, 3).join(" • ")
        : "lead bem preenchido e em movimento",
  }
}
