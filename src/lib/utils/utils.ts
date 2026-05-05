import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { logger } from "@/src/lib/logger"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: string | number): string {
  const amount =
    typeof value === "string" ? Number(value.replace(/\D/g, "")) / 100 : value

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
}

export function formatCurrencyBRLFromCents(cents: number | null | undefined) {
  const safe = typeof cents === "number" && Number.isFinite(cents) ? cents : 0
  return formatCurrencyBRL(safe / 100)
}

export function parseCurrencyBRLToCents(value: string): number {
  const reais = parseCurrencyBRL(value)
  return Math.round(reais * 100)
}

export function parseCurrencyBRL(value: string): number {
  if (!value) return 0
  // Handle strings that might have R$, dots for thousands and comma for decimals
  const cleanValue = value
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

export function formatLocalTime(date: Date, timezone: string): string {
  try {
    const tz = timezone || "America/Sao_Paulo"

    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(date)

    const getPart = (type: string): string =>
      parts.find((p) => p.type === type)?.value || ""

    const day = getPart("day")
    const month = getPart("month")
    const year = getPart("year")
    const hour = getPart("hour")
    const minute = getPart("minute")
    const gmt = getPart("timeZoneName")

    return `${day}/${month}/${year}, ${hour}:${minute} (${gmt})`
  } catch (error) {
    logger.error({ timezone, error }, "Format error for timezone:")
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
}
