import { createHmac, timingSafeEqual } from "node:crypto"

import { LeadActivityType, LeadSource, LeadStatus } from "@/src/generated/client"

import { env } from "@/src/config/env"

import { formatBrazilPhoneInput } from "@/src/lib/utils/phone"

import type { Prisma } from "@/src/generated/client"

import { z } from "zod"

export const PUBLIC_LEADS_API_KEY_HEADER = "x-magui-leads-key"
export const PUBLIC_LEADS_SIGNATURE_HEADER = "x-magui-signature"
export const PUBLIC_LEADS_TIMESTAMP_HEADER = "x-magui-timestamp"

const optionalTrimmedString = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((value) => value || undefined)

export const publicLeadPayloadSchema = z
  .object({
    companyName: z.string().trim().min(2).max(120),
    contactName: z.string().trim().min(2).max(120).optional(),
    email: z
      .string()
      .trim()
      .email()
      .max(160)
      .optional()
      .transform((value) => value?.toLowerCase()),
    phone: z.string().trim().min(8).max(24).optional(),
    website: z.string().trim().url().max(255).optional(),
    instagram: z.string().trim().url().max(255).optional(),
    message: z.string().trim().min(5).max(4000).optional(),
    pageUrl: z.string().trim().url().max(255).optional(),
    referrer: z.string().trim().url().max(255).optional(),
    utmSource: optionalTrimmedString,
    utmMedium: optionalTrimmedString,
    utmCampaign: optionalTrimmedString,
    utmContent: optionalTrimmedString,
    utmTerm: optionalTrimmedString,
  })
  .superRefine((payload, context) => {
    if (!payload.email && !payload.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one contact channel is required.",
        path: ["email"],
      })
    }
  })

export type PublicLeadPayload = z.infer<typeof publicLeadPayloadSchema>

export class PublicLeadRequestError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "PublicLeadRequestError"
    this.status = status
  }
}

function normalizeOptionalValue(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizePhoneForStorage(value?: string | null): string | null {
  const normalized = normalizeOptionalValue(value)

  if (!normalized) {
    return null
  }

  return formatBrazilPhoneInput(normalized)
}

export function normalizePublicLeadPayload(
  payload: PublicLeadPayload
): PublicLeadPayload {
  return {
    ...payload,
    companyName: payload.companyName.trim(),
    contactName: normalizeOptionalValue(payload.contactName) ?? undefined,
    email: normalizeOptionalValue(payload.email)?.toLowerCase() ?? undefined,
    phone: normalizePhoneForStorage(payload.phone) ?? undefined,
    website: normalizeOptionalValue(payload.website) ?? undefined,
    instagram: normalizeOptionalValue(payload.instagram) ?? undefined,
    message: normalizeOptionalValue(payload.message) ?? undefined,
    pageUrl: normalizeOptionalValue(payload.pageUrl) ?? undefined,
    referrer: normalizeOptionalValue(payload.referrer) ?? undefined,
    utmSource: normalizeOptionalValue(payload.utmSource) ?? undefined,
    utmMedium: normalizeOptionalValue(payload.utmMedium) ?? undefined,
    utmCampaign: normalizeOptionalValue(payload.utmCampaign) ?? undefined,
    utmContent: normalizeOptionalValue(payload.utmContent) ?? undefined,
    utmTerm: normalizeOptionalValue(payload.utmTerm) ?? undefined,
  }
}

export function getPublicLeadConfig() {
  const sharedKey = env.PUBLIC_LEADS_SHARED_KEY
  const signingSecret = env.PUBLIC_LEADS_SIGNING_SECRET

  if (!sharedKey || !signingSecret) {
    throw new PublicLeadRequestError(
      "Public lead intake is not configured.",
      503
    )
  }

  return {
    sharedKey,
    signingSecret,
    allowedOrigin: env.PUBLIC_LEADS_ALLOWED_ORIGIN,
    toleranceSeconds: env.PUBLIC_LEADS_TIMESTAMP_TOLERANCE_SECONDS,
  }
}

function constantTimeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

export function validatePublicLeadOrigin(origin: string | null): void {
  const { allowedOrigin } = getPublicLeadConfig()

  if (origin && allowedOrigin && origin !== allowedOrigin) {
    throw new PublicLeadRequestError("Origin not allowed.", 403)
  }
}

export function verifyPublicLeadRequestSignature(
  rawBody: string,
  headers: Headers
): void {
  const { sharedKey, signingSecret, toleranceSeconds } = getPublicLeadConfig()

  const providedKey = headers.get(PUBLIC_LEADS_API_KEY_HEADER)
  const providedSignature = headers.get(PUBLIC_LEADS_SIGNATURE_HEADER)
  const providedTimestamp = headers.get(PUBLIC_LEADS_TIMESTAMP_HEADER)

  if (!providedKey || !providedSignature || !providedTimestamp) {
    throw new PublicLeadRequestError("Missing authentication headers.", 401)
  }

  if (!constantTimeEquals(providedKey, sharedKey)) {
    throw new PublicLeadRequestError("Invalid API key.", 401)
  }

  const parsedTimestamp = Number(providedTimestamp)

  if (!Number.isFinite(parsedTimestamp)) {
    throw new PublicLeadRequestError("Invalid timestamp.", 401)
  }

  const driftMs = Math.abs(Date.now() - parsedTimestamp * 1000)
  if (driftMs > toleranceSeconds * 1000) {
    throw new PublicLeadRequestError("Expired request signature.", 401)
  }

  const expectedSignature = createHmac("sha256", signingSecret)
    .update(`${providedTimestamp}.${rawBody}`)
    .digest("hex")

  if (!constantTimeEquals(providedSignature, expectedSignature)) {
    throw new PublicLeadRequestError("Invalid request signature.", 401)
  }
}

export function buildPublicLeadCorsHeaders(origin: string | null): Headers {
  const headers = new Headers()
  const allowedOrigin = env.PUBLIC_LEADS_ALLOWED_ORIGIN

  if (origin && allowedOrigin && origin === allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin)
  }

  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  headers.set(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      PUBLIC_LEADS_API_KEY_HEADER,
      PUBLIC_LEADS_SIGNATURE_HEADER,
      PUBLIC_LEADS_TIMESTAMP_HEADER,
    ].join(", ")
  )
  headers.set("Access-Control-Max-Age", "600")
  headers.set("Vary", "Origin")

  return headers
}

export function buildWebsiteLeadActivityMetadata(args: {
  payload: PublicLeadPayload
  request: {
    ipAddress: string | null
    userAgent: string | null
  }
}): Prisma.InputJsonValue {
  const { payload, request } = args

  return {
    intake: "public-website-form",
    source: LeadSource.WEBSITE,
    pageUrl: payload.pageUrl ?? null,
    referrer: payload.referrer ?? null,
    utmSource: payload.utmSource ?? null,
    utmMedium: payload.utmMedium ?? null,
    utmCampaign: payload.utmCampaign ?? null,
    utmContent: payload.utmContent ?? null,
    utmTerm: payload.utmTerm ?? null,
    submittedAt: new Date().toISOString(),
    ipAddress: request.ipAddress,
    userAgent: request.userAgent,
  }
}

export function buildWebsiteLeadActivity(args: {
  payload: PublicLeadPayload
  request: {
    ipAddress: string | null
    userAgent: string | null
  }
}) {
  return {
    type: LeadActivityType.CONTACT_UPDATED,
    title: "Lead recebido via landing page",
    content: args.payload.message ?? "Novo envio recebido pelo formulario do site.",
    metadata: buildWebsiteLeadActivityMetadata(args),
  }
}

export function buildDuplicateLeadActivity(args: {
  payload: PublicLeadPayload
  request: {
    ipAddress: string | null
    userAgent: string | null
  }
}) {
  return {
    type: LeadActivityType.CONTACT_UPDATED,
    title: "Novo envio identificado via landing page",
    content:
      args.payload.message ??
      "O mesmo contato enviou uma nova solicitacao pelo formulario do site.",
    metadata: buildWebsiteLeadActivityMetadata(args),
  }
}

export function buildLeadDuplicateWhere(
  payload: PublicLeadPayload
): Prisma.LeadWhereInput | null {
  const orClauses: Prisma.LeadWhereInput[] = []

  if (payload.email) {
    orClauses.push({ email: payload.email })
  }

  if (payload.phone) {
    orClauses.push({ phone: payload.phone })
  }

  if (payload.companyName && payload.contactName) {
    orClauses.push({
      companyName: payload.companyName,
      contactName: payload.contactName,
    })
  }

  if (orClauses.length === 0) {
    return null
  }

  return {
    status: {
      notIn: [LeadStatus.DESCARTADO, LeadStatus.CONVERTIDO],
    },
    OR: orClauses,
  }
}

export function buildLeadUpdateFromPublicPayload(
  existingLead: {
    contactName: string | null
    email: string | null
    phone: string | null
    website: string | null
    instagram: string | null
  },
  payload: PublicLeadPayload
) {
  return {
    contactName: existingLead.contactName ?? payload.contactName ?? null,
    email: existingLead.email ?? payload.email ?? null,
    phone: existingLead.phone ?? payload.phone ?? null,
    website: existingLead.website ?? payload.website ?? null,
    instagram: existingLead.instagram ?? payload.instagram ?? null,
  }
}
