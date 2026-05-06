import * as React from "react"

import { NextRequest, NextResponse } from "next/server"

import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer"

import { MaguiContractTemplate } from "@/src/lib/pdf/MaguiContractTemplate"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await protect("admin")
    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        clauses: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    const buffer = await renderToBuffer(
      React.createElement(MaguiContractTemplate, {
        document: {
          ...document,
        },
      }) as unknown as React.ReactElement<DocumentProps>
    )

    const shouldDownload = req.nextUrl.searchParams.get("download") === "1"
    const safeFileName = `contrato-${document.id}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${safeFileName}"`,
        "Cache-Control": "no-store, max-age=0",
        "Content-Length": String(buffer.length),
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Contract PDF Generation Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
