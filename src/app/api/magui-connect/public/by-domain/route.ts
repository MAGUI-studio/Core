import { NextRequest, NextResponse } from "next/server"

import { getPublicMaguiConnectByDomain } from "@/src/lib/maguiConnectData"

import { env } from "@/src/config/env"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-magui-connect-key")

  if (
    !env.MAGUI_CONNECT_RENDERER_SHARED_SECRET ||
    authHeader !== env.MAGUI_CONNECT_RENDERER_SHARED_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const domain = searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 })
  }

  try {
    const payload = await getPublicMaguiConnectByDomain(domain)

    if (!payload) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
