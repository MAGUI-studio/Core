import { NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"

import prisma from "@/src/lib/prisma"
import { stripe } from "@/src/lib/stripe"

export async function GET(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const installmentId = req.nextUrl.searchParams.get("installmentId")
  if (!installmentId) {
    return NextResponse.json(
      { error: "installmentId is required" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: {
      invoice: {
        include: {
          client: {
            select: {
              id: true,
            },
          },
          project: {
            select: {
              clientId: true,
            },
          },
        },
      },
    },
  })

  if (!installment) {
    return NextResponse.json(
      { error: "Installment not found" },
      { status: 404 }
    )
  }

  const canAccess =
    user.role === "ADMIN" ||
    user.role === "MEMBER" ||
    installment.invoice.client?.id === user.id ||
    installment.invoice.project?.clientId === user.id

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!installment.stripePaymentIntentId) {
    return NextResponse.json(
      { error: "No Stripe receipt available for this installment" },
      { status: 404 }
    )
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    installment.stripePaymentIntentId,
    {
      expand: ["latest_charge"],
    }
  )

  const charge = paymentIntent.latest_charge as Stripe.Charge | null
  const receiptUrl = charge?.receipt_url ?? null

  if (!receiptUrl) {
    return NextResponse.json(
      { error: "Receipt not available yet" },
      { status: 404 }
    )
  }

  return NextResponse.json({ url: receiptUrl })
}
