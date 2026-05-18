import { NextResponse } from "next/server"

import prisma from "@/src/lib/prisma"
import {
  PublicLeadRequestError,
  buildDuplicateLeadActivity,
  buildLeadDuplicateWhere,
  buildLeadUpdateFromPublicPayload,
  buildPublicLeadCorsHeaders,
  buildWebsiteLeadActivity,
  normalizePublicLeadPayload,
  publicLeadPayloadSchema,
  validatePublicLeadOrigin,
  verifyPublicLeadRequestSignature,
} from "@/src/lib/public-leads"
import {
  createNotificationsMany,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"

import { LeadSource, LeadStatus, NotificationType } from "@/src/generated/client"
import { ZodError } from "zod"

function jsonResponse(
  body: Record<string, unknown>,
  init?: ResponseInit,
  origin?: string | null
) {
  const headers = buildPublicLeadCorsHeaders(origin ?? null)

  if (init?.headers) {
    const responseHeaders = new Headers(init.headers)
    responseHeaders.forEach((value, key) => headers.set(key, value))
  }

  return NextResponse.json(body, {
    ...init,
    headers,
  })
}

function getRequestIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null
  }

  return headers.get("x-real-ip")
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin")

  try {
    validatePublicLeadOrigin(origin)
  } catch (error) {
    if (error instanceof PublicLeadRequestError) {
      return jsonResponse(
        { success: false, error: error.message },
        { status: error.status },
        origin
      )
    }

    return jsonResponse(
      { success: false, error: "Origin not allowed." },
      { status: 403 },
      origin
    )
  }

  return new NextResponse(null, {
    status: 204,
    headers: buildPublicLeadCorsHeaders(origin),
  })
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  try {
    validatePublicLeadOrigin(origin)

    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      throw new PublicLeadRequestError(
        "Unsupported content type. Expected application/json.",
        415
      )
    }

    const rawBody = await request.text()
    if (rawBody.length > 20_000) {
      throw new PublicLeadRequestError("Lead payload is too large.", 413)
    }

    verifyPublicLeadRequestSignature(rawBody, request.headers)

    const parsedPayload = publicLeadPayloadSchema.parse(JSON.parse(rawBody))
    const payload = normalizePublicLeadPayload(parsedPayload)

    const requestMetadata = {
      ipAddress: getRequestIp(request.headers),
      userAgent: request.headers.get("user-agent"),
    }

    const duplicateWhere = buildLeadDuplicateWhere(payload)
    const existingLead = duplicateWhere
      ? await prisma.lead.findFirst({
          where: duplicateWhere,
          select: {
            id: true,
            contactName: true,
            email: true,
            phone: true,
            website: true,
            instagram: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        })
      : null

    if (existingLead) {
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          ...buildLeadUpdateFromPublicPayload(existingLead, payload),
          activities: {
            create: buildDuplicateLeadActivity({
              payload,
              request: requestMetadata,
            }),
          },
        },
        select: { id: true },
      })

      return jsonResponse(
        {
          success: true,
          created: false,
          deduplicated: true,
          leadId: updatedLead.id,
        },
        { status: 200 },
        origin
      )
    }

    const lead = await prisma.lead.create({
      data: {
        companyName: payload.companyName,
        contactName: payload.contactName ?? null,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        website: payload.website ?? null,
        instagram: payload.instagram ?? null,
        source: LeadSource.WEBSITE,
        status: LeadStatus.GARIMPAGEM,
        activities: {
          create: buildWebsiteLeadActivity({
            payload,
            request: requestMetadata,
          }),
        },
      },
      select: { id: true },
    })

    const internalRecipients = await getInternalNotificationRecipients()
    await createNotificationsMany(
      internalRecipients.map((recipient) => ({
        userId: recipient.id,
        type: NotificationType.LEAD_ASSIGNED,
        title: "Novo lead recebido pelo site",
        message: `${payload.companyName} acabou de entrar no CRM via landing page.`,
        ctaPath: `/admin/crm/leads/${lead.id}`,
        metadata: {
          leadId: lead.id,
          source: "website_public_form",
          companyName: payload.companyName,
          contactName: payload.contactName ?? null,
        },
      }))
    )

    return jsonResponse(
      {
        success: true,
        created: true,
        deduplicated: false,
        leadId: lead.id,
      },
      { status: 201 },
      origin
    )
  } catch (error) {
    if (error instanceof PublicLeadRequestError) {
      return jsonResponse(
        { success: false, error: error.message },
        { status: error.status },
        origin
      )
    }

    if (error instanceof ZodError) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid lead payload.",
          issues: error.flatten().fieldErrors,
        },
        { status: 422 },
        origin
      )
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 },
        origin
      )
    }

    return jsonResponse(
      { success: false, error: "Unable to process lead submission." },
      { status: 500 },
      origin
    )
  }
}
