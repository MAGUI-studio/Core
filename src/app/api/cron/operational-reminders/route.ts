import { NextRequest, NextResponse } from "next/server"

import { syncOperationalReminders } from "@/src/lib/operational-reminders"

import { env } from "@/src/config/env"

export const dynamic = "force-dynamic"

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!env.OPERATIONAL_REMINDERS_SECRET) {
    return process.env.NODE_ENV === "development"
  }
  return authHeader === `Bearer ${env.OPERATIONAL_REMINDERS_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await syncOperationalReminders()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron Operational Reminders Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
