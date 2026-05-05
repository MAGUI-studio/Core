import { z } from "zod"

const optionalUrlList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    return value
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
  })
  .pipe(z.array(z.string().url("Cada referência precisa ser uma URL válida")))

const assetSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  key: z.string(),
})

export const briefingSchema = z.object({
  // 1. Contexto de Negócio
  businessDescription: z
    .string()
    .trim()
    .min(50, "Descreva o negócio (mínimo 50 caracteres)"),
  brandTone: z.string().trim().min(50, "Descreva o tom da marca (mínimo 50)"),
  businessGoals: z
    .string()
    .trim()
    .min(50, "Defina os objetivos do projeto (mínimo 50)"),
  primaryCta: z.string().trim().min(10, "Informe a principal conversão"),
  targetAudience: z
    .string()
    .trim()
    .min(50, "Descreva o público-alvo (mínimo 50)"),
  differentiators: z
    .string()
    .trim()
    .min(50, "Liste os diferenciais da marca (mínimo 50)"),

  // 2. Identidade da Marca
  logos: z
    .object({
      primary: assetSchema.nullable().optional(),
      secondary: assetSchema.nullable().optional(),
    })
    .refine((data) => data.primary || data.secondary, {
      message: "Envie pelo menos um logo (Principal ou Secundário)",
    })
    .optional(),
  palette: z
    .object({
      primary: z
        .string()
        .transform((v) => (v === "" ? undefined : v))
        .pipe(
          z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex inválido")
            .optional()
        )
        .nullable()
        .optional(),
      secondary: z
        .string()
        .transform((v) => (v === "" ? undefined : v))
        .pipe(
          z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex inválido")
            .optional()
        )
        .nullable()
        .optional(),
      extra: z.array(z.string()).optional(),
    })
    .optional(),

  // 3. Direção Visual
  visualReferences: optionalUrlList,
  dislikedReferences: optionalUrlList,
  competitors: z.array(z.string()).optional(),
})

export type BriefingInput = z.infer<typeof briefingSchema>
