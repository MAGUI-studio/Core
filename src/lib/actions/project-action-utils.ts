import { ApprovalStatus } from "@/src/generated/client"

export function getDashboardPath(projectId: string): string {
  return `/?project=${projectId}`
}

export function getAdminProjectPath(projectId: string): string {
  return `/admin/projects/${projectId}`
}

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
}

export function toBrazilianDate(
  value: Date | string | null | undefined
): string {
  if (!value) return ""

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value))
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
