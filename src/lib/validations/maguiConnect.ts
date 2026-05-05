import { z } from "zod"

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function normalizeOptionalText(value?: string | null) {
  if (value === undefined) return undefined
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const optionalSlugSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .transform((value) =>
    value === undefined ? undefined : value ? normalizeSlug(value) : null
  )
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      (value.length >= 3 && value.length <= 40),
    {
      message: "Slug deve ter entre 3 e 40 caracteres",
    }
  )
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    {
      message: "Slug invalido",
    }
  )

const optionalDomainSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .transform((value) =>
    value === undefined ? undefined : value ? value.toLowerCase() : null
  )
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      /^(?=.{3,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
        value
      ),
    "Dominio invalido"
  )

const safeUrlSchema = z
  .string()
  .min(1)
  .transform(normalizeUrl)
  .refine((value) => {
    try {
      const url = new URL(value)
      return ["http:", "https:"].includes(url.protocol)
    } catch {
      return false
    }
  }, "URL invalida")

const optionalSafeUrlSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .transform((value) =>
    value === undefined ? undefined : value ? normalizeUrl(value) : null
  )
  .refine(
    (value) => {
      if (value === undefined || value === null) return true
      try {
        const url = new URL(value)
        return ["http:", "https:"].includes(url.protocol)
      } catch {
        return false
      }
    },
    { message: "URL invalida" }
  )

const optionalHexColorSchema = z
  .string()
  .optional()
  .nullable()
  .transform(normalizeOptionalText)
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
    {
      message:
        "Invalid string: must match pattern /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/",
    }
  )

export const maguiConnectProfileSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(280).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  bannerUrl: z.string().url().optional().nullable().or(z.literal("")),
  ogImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  slug: optionalSlugSchema,
  domain: optionalDomainSchema,
  professionalCategory: z.string().max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  companyName: z.string().max(100).optional().nullable(),
  publicEmail: z.string().email().optional().nullable().or(z.literal("")),
  publicPhone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  whatsappMessage: z.string().max(200).optional().nullable(),
  primaryCtaLabel: z.string().max(40).optional().nullable(),
  primaryCtaUrl: optionalSafeUrlSchema,
  themeAccent: optionalHexColorSchema,
  themeBackground: optionalHexColorSchema,
  themeForeground: optionalHexColorSchema,
  seoTitle: z.string().max(100).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
})

export const maguiConnectLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: safeUrlSchema,
  icon: z.string().optional().nullable(),
  kind: z.string().default("LINK"),
  isFeatured: z.boolean().default(false),
  openInNewTab: z.boolean().default(true),
  sectionId: z.string().cuid().optional().nullable(),
})

export const maguiConnectSectionSchema = z.object({
  title: z.string().min(1).max(80),
  isActive: z.boolean().default(true),
  isCollapsible: z.boolean().default(false),
})

export type MaguiConnectProfileInput = z.infer<typeof maguiConnectProfileSchema>
export type MaguiConnectLinkInput = z.infer<typeof maguiConnectLinkSchema>
export type MaguiConnectSectionInput = z.infer<typeof maguiConnectSectionSchema>
