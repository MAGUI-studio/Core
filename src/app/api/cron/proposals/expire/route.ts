import { NextRequest, NextResponse } from "next/server"

import { ProposalStatus } from "@/src/generated/client"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.OPERATIONAL_REMINDERS_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const now = new Date()

    const result = await prisma.proposal.updateMany({
      where: {
        status: { in: [ProposalStatus.DRAFT, ProposalStatus.SENT] },
        validUntil: { lt: now },
      },
      data: {
        status: ProposalStatus.EXPIRED,
      },
    })

    logger.info({ count: result.count }, "Expired proposals updated via cron")

    return NextResponse.json({ success: true, expiredCount: result.count })
  } catch (error) {
    logger.error({ error }, "Proposal Expiration Cron Error")
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
