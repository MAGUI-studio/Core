import { NextRequest, NextResponse } from "next/server"

import { createCheckoutSession } from "@/src/lib/stripe-actions"

import { env } from "@/src/config/env"

export async function POST(req: NextRequest) {
  try {
    const { installmentId } = await req.json()

    if (!installmentId) {
      return NextResponse.json(
        { error: "Missing installmentId" },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(installmentId)

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    )
  }
}
