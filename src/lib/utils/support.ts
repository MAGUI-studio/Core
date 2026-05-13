import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/src/generated/client"

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_FOR_CLIENT: "Aguardando cliente",
  ANSWERED: "Respondido",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
}

export const SUPPORT_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
}

export const SUPPORT_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  GENERAL: "Geral",
  TECHNICAL: "Técnico",
  BILLING: "Financeiro",
  ACCESS: "Acesso",
  CHANGE_REQUEST: "Solicitação",
}

export const SUPPORT_STATUS_STYLES: Record<SupportTicketStatus, string> = {
  OPEN: "border-sky-500/20 bg-sky-500/10 text-sky-600",
  IN_PROGRESS: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  WAITING_FOR_CLIENT: "border-violet-500/20 bg-violet-500/10 text-violet-600",
  ANSWERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  RESOLVED: "border-green-500/20 bg-green-500/10 text-green-700",
  CLOSED: "border-border/40 bg-muted text-muted-foreground",
}

export const SUPPORT_PRIORITY_STYLES: Record<SupportTicketPriority, string> = {
  LOW: "border-border/40 bg-muted/40 text-muted-foreground/70",
  NORMAL: "border-slate-500/15 bg-slate-500/10 text-foreground/80",
  HIGH: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  URGENT: "border-red-500/20 bg-red-500/10 text-red-600",
}

const SUPPORT_BUSINESS_START_HOUR = 9
const SUPPORT_BUSINESS_END_HOUR = 18

function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

function setBusinessTime(date: Date, hour: number, minute = 0): Date {
  const next = new Date(date)
  next.setHours(hour, minute, 0, 0)
  return next
}

function moveToNextBusinessDayStart(date: Date): Date {
  const next = setBusinessTime(date, SUPPORT_BUSINESS_START_HOUR)

  do {
    next.setDate(next.getDate() + 1)
    next.setHours(SUPPORT_BUSINESS_START_HOUR, 0, 0, 0)
  } while (!isBusinessDay(next))

  return next
}

function moveToCurrentOrNextBusinessStart(date: Date): Date {
  const current = new Date(date)

  if (!isBusinessDay(current)) {
    while (!isBusinessDay(current)) {
      current.setDate(current.getDate() + 1)
    }

    return setBusinessTime(current, SUPPORT_BUSINESS_START_HOUR)
  }

  const start = setBusinessTime(current, SUPPORT_BUSINESS_START_HOUR)
  const end = setBusinessTime(current, SUPPORT_BUSINESS_END_HOUR)

  if (current < start) {
    return start
  }

  if (current >= end) {
    return moveToNextBusinessDayStart(current)
  }

  return current
}

export function addBusinessHours(date: Date, hours: number): Date {
  let result = moveToCurrentOrNextBusinessStart(date)
  let remainingMinutes = Math.max(0, Math.round(hours * 60))

  while (remainingMinutes > 0) {
    const businessEnd = setBusinessTime(result, SUPPORT_BUSINESS_END_HOUR)
    const availableMinutes = Math.max(
      0,
      Math.floor((businessEnd.getTime() - result.getTime()) / 60000)
    )

    if (availableMinutes === 0) {
      result = moveToNextBusinessDayStart(result)
      continue
    }

    if (remainingMinutes <= availableMinutes) {
      result = new Date(result.getTime() + remainingMinutes * 60000)
      remainingMinutes = 0
      break
    }

    remainingMinutes -= availableMinutes
    result = moveToNextBusinessDayStart(result)
  }

  return result
}

function padTimeUnit(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatSupportSlaCountdown(
  deadline: Date | string | null | undefined,
  now = new Date()
): string {
  if (!deadline) return "Sem prazo"

  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline)

  if (Number.isNaN(deadlineDate.getTime())) {
    return "Sem prazo"
  }

  const diffMs = deadlineDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return "Prazo vencido"
  }

  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${padTimeUnit(remainingHours)}:${padTimeUnit(minutes)}`
  }

  return `${padTimeUnit(hours)}:${padTimeUnit(minutes)}`
}
