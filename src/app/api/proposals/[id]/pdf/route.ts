import * as React from "react"

import { NextRequest, NextResponse } from "next/server"

import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer"

import { MaguiProposalTemplate } from "@/src/lib/pdf/MaguiProposalTemplate"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await protect("admin")
    const { id } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        items: { orderBy: { order: "asc" } },
        lead: true,
      },
    })

    if (!proposal) {
      return new NextResponse("Proposal not found", { status: 404 })
    }

    const buffer = await renderToBuffer(
      React.createElement(MaguiProposalTemplate, {
        proposal,
        lead: proposal.lead,
      }) as unknown as React.ReactElement<DocumentProps>
    )

    const shouldDownload = req.nextUrl.searchParams.get("download") === "1"
    const safeFileName = `proposta-${proposal.number}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${safeFileName}"`,
        "Cache-Control": "no-store, max-age=0",
        "Content-Length": String(buffer.length),
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error: unknown) {
    console.error("PDF Generation Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
