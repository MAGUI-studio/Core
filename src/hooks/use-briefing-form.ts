import * as React from "react"

import { Prisma } from "@/src/generated/client"
import { toast } from "sonner"

import { updateProjectBriefingAction } from "@/src/lib/actions/project.actions"

export const stepsConfig = [
  // 1. Contexto de Negócio
  { id: "businessDescription", min: 50 },
  { id: "businessGoals", min: 50 },
  { id: "brandTone", min: 50 },
  { id: "primaryCta", min: 10 },
  { id: "targetAudience", min: 50 },
  { id: "differentiators", min: 50 },

  // 2. Identidade da Marca
  { id: "logos", min: 1 },
  { id: "palette", min: 0 },

  // 3. Direção Visual
  { id: "visualReferences", min: 0 },
  { id: "dislikedReferences", min: 0 },
  { id: "competitors", min: 0 },
] as const

export type StepId = (typeof stepsConfig)[number]["id"]

export interface BriefingFormData {
  businessDescription: string
  businessGoals: string
  brandTone: string
  primaryCta: string
  targetAudience: string
  differentiators: string
  logos: {
    primary: { name: string; url: string; key: string } | null
    secondary: { name: string; url: string; key: string } | null
  }
  palette: {
    primary: string
    secondary: string
    extra: string[]
  }
  visualReferences: string[]
  dislikedReferences: string[]
  competitors: string[]
}

export function useBriefingForm(
  projectId: string,
  initialData: Prisma.JsonValue | null | undefined,
  currentStepId: StepId,
  setCurrentStepId: (step: StepId) => void
) {
  const data = (initialData as Record<string, unknown>) || {}
  const [formData, setFormData] = React.useState<Record<string, unknown>>({
    businessDescription: String(data?.businessDescription || ""),
    businessGoals: String(data?.businessGoals || ""),
    brandTone: String(data?.brandTone || ""),
    primaryCta: String(data?.primaryCta || ""),
    targetAudience: String(data?.targetAudience || ""),
    differentiators: String(data?.differentiators || ""),

    logos: (data?.logos as Record<string, unknown>) || {
      primary: null,
      secondary: null,
    },
    palette: (data?.palette as Record<string, unknown>) || {
      primary: "#000000",
      secondary: "#FFFFFF",
      extra: [],
    },

    visualReferences: Array.isArray(data?.visualReferences)
      ? data.visualReferences
      : [""],
    dislikedReferences: Array.isArray(data?.dislikedReferences)
      ? data.dislikedReferences
      : [""],
    competitors: Array.isArray(data?.competitors) ? data.competitors : [""],
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const currentStepIndex = stepsConfig.findIndex((s) => s.id === currentStepId)

  const isFieldMissing = (id: string) => {
    const config = stepsConfig.find((s) => s.id === id)
    if (!config || config.min === 0) return false
    const val = formData[id]

    if (id === "logos") {
      const logos = val as {
        primary?: { url: string }
        secondary?: { url: string }
      } | null
      const hasPrimary = logos?.primary?.url
      const hasSecondary = logos?.secondary?.url
      return !hasPrimary && !hasSecondary
    }

    if (typeof val === "string") return val.trim().length < config.min
    return false
  }

  const handleNext = async () => {
    if (isFieldMissing(currentStepId)) {
      setShowErrors(true)
      toast.error("Preencha este campo obrigatório para prosseguir.")
      return
    }

    if (currentStepIndex < stepsConfig.length - 1) {
      setCurrentStepId(stepsConfig[currentStepIndex + 1].id)
    }
  }

  const handleSubmit = async () => {
    // BLOQUEIO CRÍTICO: Só envia se for o último passo
    if (currentStepIndex < stepsConfig.length - 1) {
      console.warn("Tentativa de envio bloqueada: não é o último passo.")
      return
    }

    if (stepsConfig.some((s) => isFieldMissing(s.id))) {
      setShowErrors(true)
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    setIsLoading(true)
    const result = await updateProjectBriefingAction(
      projectId,
      formData as Prisma.InputJsonValue
    )

    if (result.success) {
      toast.success("Briefing enviado com sucesso!")
      setIsFinished(true)
    } else {
      console.error("Briefing Submit Error:", result.error)
      toast.error(result.error || "Erro ao salvar o briefing.")
      setIsLoading(false)
      return
    }
    setIsLoading(false)
  }

  return {
    formData,
    setFormData,
    currentStepId,
    setCurrentStepId,
    currentStepIndex,
    isFinished,
    isLoading,
    showErrors,
    isFieldMissing,
    handleNext,
    handleSubmit,
    saveCurrent: async () => {
      // Desativado
    },
  }
}
