import { ProjectStatus } from "@/src/generated/client"

export interface ProjectHealthInput {
  status: ProjectStatus
  progress: number
  deadline: Date | string | null
  updatedAt: Date | string
  lastUpdateAt: Date | string | null
  pendingApprovalCount: number
  overdueActionItemCount: number
}

export interface ProjectHealthResult {
  score: number
  tone: "healthy" | "attention" | "risk"
  summary: string
}

function getDaysUntil(dateValue: Date | string): number {
  const target = new Date(dateValue)
  const now = new Date()

  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getProjectHealth(
  input: ProjectHealthInput
): ProjectHealthResult {
  if (input.status === ProjectStatus.LAUNCHED) {
    return {
      score: 100,
      tone: "healthy",
      summary: "Projeto finalizado",
    }
  }

  let score = 100

  if (input.pendingApprovalCount > 0) {
    score -= Math.min(18, input.pendingApprovalCount * 6)
  }

  if (input.overdueActionItemCount > 0) {
    score -= Math.min(24, input.overdueActionItemCount * 8)
  }

  const lastSignal = input.lastUpdateAt ?? input.updatedAt
  const daysWithoutUpdate = Math.max(0, -getDaysUntil(lastSignal))

  if (daysWithoutUpdate > 14) {
    score -= 22
  } else if (daysWithoutUpdate > 7) {
    score -= 12
  }

  if (input.deadline) {
    const daysToDeadline = getDaysUntil(input.deadline)

    if (daysToDeadline < 0) {
      score -= 28
    } else if (daysToDeadline <= 3 && input.progress < 90) {
      score -= 20
    } else if (daysToDeadline <= 7 && input.progress < 75) {
      score -= 12
    }
  }

  score = Math.max(0, Math.min(100, score))

  if (score >= 76) {
    return {
      score,
      tone: "healthy",
      summary: "Operacao sob controle",
    }
  }

  if (score >= 51) {
    return {
      score,
      tone: "attention",
      summary: "Pede acompanhamento",
    }
  }

  return {
    score,
    tone: "risk",
    summary: "Exige acao rapida",
  }
}
