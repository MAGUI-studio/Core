import * as React from "react"

import { NextResponse } from "next/server"

import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer"

import { MaguiProposalTemplate } from "@/src/lib/pdf/MaguiProposalTemplate"
import prisma from "@/src/lib/prisma"
import { normalizeInstagramProposalIdentifier } from "@/src/lib/proposals/public-links"

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  )
}

async function registerProposalView(proposalId: string, request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get("user-agent")
  const referer = request.headers.get("referer")
  const viewedAt = new Date()
  const eventId = crypto.randomUUID()

  await prisma.$transaction([
    prisma.$executeRaw`
      UPDATE "Proposal"
      SET
        "lastViewedAt" = ${viewedAt},
        "viewCount" = "viewCount" + 1,
        "firstViewedAt" = COALESCE("firstViewedAt", ${viewedAt})
      WHERE "id" = ${proposalId}
    `,
    prisma.$executeRaw`
      INSERT INTO "ProposalViewEvent" (
        "id",
        "proposalId",
        "ip",
        "userAgent",
        "referer",
        "viewedAt"
      ) VALUES (
        ${eventId},
        ${proposalId},
        ${ip},
        ${userAgent},
        ${referer},
        ${viewedAt}
      )
    `,
  ])
}

async function getPublicProposalByIdentifier(identifier: string) {
  const byId = await prisma.proposal.findUnique({
    where: { id: identifier },
    include: {
      items: { orderBy: { order: "asc" } },
      lead: true,
    },
  })

  if (byId) {
    return byId
  }

  const normalizedIdentifier = normalizeInstagramProposalIdentifier(identifier)
  if (!normalizedIdentifier) {
    return null
  }

  const candidates = await prisma.proposal.findMany({
    where: {
      lead: {
        instagram: {
          contains: normalizedIdentifier,
          mode: "insensitive",
        },
      },
    },
    include: {
      items: { orderBy: { order: "asc" } },
      lead: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })

  return (
    candidates.find(
      (proposal) =>
        normalizeInstagramProposalIdentifier(proposal.lead.instagram) ===
        normalizedIdentifier
    ) ?? null
  )
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ identifier: string; locale: string }> }
) {
  try {
    const { identifier } = await params

    const proposal = await getPublicProposalByIdentifier(identifier)

    if (!proposal) {
      return new NextResponse("Proposal not found", { status: 404 })
    }

    try {
      await registerProposalView(proposal.id, req)
    } catch (error) {
      console.error("Proposal view tracking error:", error)
    }

    const buffer = await renderToBuffer(
      React.createElement(MaguiProposalTemplate, {
        proposal,
        lead: proposal.lead,
      }) as unknown as React.ReactElement<DocumentProps>
    )

    const safeFileName = `proposta-${proposal.number}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFileName}"`,
        "Cache-Control": "no-store, max-age=0",
        "Content-Length": String(buffer.length),
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Public Proposal PDF Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
