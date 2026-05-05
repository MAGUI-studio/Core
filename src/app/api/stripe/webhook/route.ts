import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import Stripe from "stripe"

import { applyInvoicePaidSideEffects } from "@/src/lib/invoice-fulfillment"
import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import { revalidateProjectData } from "@/src/lib/revalidate"
import { stripe } from "@/src/lib/stripe"

import { env } from "@/src/config/env"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined")
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    logger.error({ err: error }, "Webhook signature verification failed")
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  logger.info({ type: event.type }, "Webhook event received")

  // Handle successful payments
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session
    const installmentId = session.metadata?.installmentId

    if (!installmentId) {
      logger.error({ sessionId: session.id }, "No installmentId in metadata")
      return NextResponse.json({ received: true })
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Update Installment
        const installment = await tx.installment.update({
          where: { id: installmentId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string,
          },
          include: {
            invoice: {
              include: {
                installments: true,
              },
            },
          },
        })

        // 2. Add a payment event (keeping amount in cents for consistency)
        await tx.paymentEvent.create({
          data: {
            installmentId,
            type: "STRIPE",
            amount: session.amount_total ?? 0,
            date: new Date(),
            note: `Pagamento via Stripe (${event.type}): ${session.id}`,
          },
        })

        // 3. Update invoice status
        const allInstallments = installment.invoice.installments
        const allPaid = allInstallments.every((i) =>
          i.id === installmentId ? true : i.status === "PAID"
        )

        await tx.invoice.update({
          where: { id: installment.invoiceId },
          data: {
            status: allPaid ? "PAID" : "PARTIALLY_PAID",
          },
        })

        if (allPaid) {
          await applyInvoicePaidSideEffects(tx, installment.invoiceId)
        }

        logger.info(
          { installmentId, eventType: event.type },
          "Installment marked as PAID via transaction"
        )
      })

      // Revalidation outside transaction
      const updatedInst = await prisma.installment.findUnique({
        where: { id: installmentId },
        include: { invoice: true },
      })

      if (updatedInst?.invoice.projectId) {
        revalidateProjectData(updatedInst.invoice.projectId)
      }
      revalidatePath("/admin/financial")
      revalidatePath("/financial")
    } catch (dbError) {
      logger.error({ dbError, installmentId }, "Database transaction failed")
      return new NextResponse("Database Error", { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
