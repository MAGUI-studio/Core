import {
  AssetType,
  PaymentMethod,
  ProjectCategory,
  ProjectStatus,
} from "@/src/generated/client"
import { z } from "zod"

import { briefingSchema } from "@/src/lib/validations/briefing"

const optionalFormString = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined
  }

  return value
}, z.string().optional())

export const createProjectSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  projectName: z.string().min(2, "Nome do projeto ? obrigat?rio"),
  projectDescription: optionalFormString,
  budget: optionalFormString,
  executionBusinessDays: optionalFormString,
  category: z.nativeEnum(ProjectCategory),
  serviceCategoryId: optionalFormString,
  customValue: z.string().transform((v) => v === "true"),
  hasInternationalization: z.string().transform((v) => v === "true"),
  internationalizationFee: optionalFormString,
  paymentMethod: z.nativeEnum(PaymentMethod),
  installments: z
    .array(
      z.object({
        number: z.number().int().min(1),
        amount: z.number().positive(),
        dueDate: z.string(),
      })
    )
    .optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ProjectStatus),
  progress: z.number().min(0).max(100),
  liveUrl: z
    .string()
    .url("URL de produção inválida")
    .optional()
    .or(z.literal("")),
  repositoryUrl: z
    .string()
    .url("URL do reposit?rio inv?lida")
    .optional()
    .or(z.literal("")),
})

const updateAttachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  key: z.string().min(1),
  customId: z.string().nullable().optional(),
  type: z.nativeEnum(AssetType),
  mimeType: z.string().nullable().optional(),
  size: z.number().int().positive().nullable().optional(),
})

export const addProjectTimelineSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2, "T?tulo ? obrigat?rio"),
  description: optionalFormString,
  isMilestone: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal("")),
  attachments: z.array(updateAttachmentSchema).default([]),
  timezone: z.string(),
})

export const rejectProjectUpdateSchema = z.object({
  updateId: z.string().min(1),
  projectId: z.string().min(1),
  feedback: z.string().trim().min(10, "Explique o ajuste necess?rio"),
})

export { briefingSchema }
