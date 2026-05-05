import { InvoiceKind } from "@/src/generated/client"

import { env } from "@/src/config/env"

import { applyInvoicePaidSideEffects } from "./invoice-fulfillment"
import prisma from "./prisma"
import { stripe } from "./stripe"

export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createCheckoutSession(installmentId: string) {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: {
      invoice: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          project: {
            select: {
              id: true,
              clientId: true,
              name: true,
              category: true,
              hasInternationalization: true,
              serviceCategory: {
                select: { name: true, description: true, imageUrl: true },
              },
            },
          },
        },
      },
    },
  })

  if (!installment) {
    throw new Error("Installment not found")
  }

  if (installment.status === "PAID") {
    throw new Error("Installment is already paid")
  }

  // ENFORCE SEQUENCE: Check if there are unpaid previous installments
  const previousUnpaid = await prisma.installment.findFirst({
    where: {
      invoiceId: installment.invoiceId,
      number: { lt: installment.number },
      status: { not: "PAID" },
    },
  })

  if (previousUnpaid) {
    throw new Error(
      `A parcela ${previousUnpaid.number} precisa ser paga antes da parcela ${installment.number}.`
    )
  }

  const clientId =
    installment.invoice.clientId ?? installment.invoice.project?.clientId
  if (!clientId) {
    throw new Error("Client not found for this invoice")
  }

  const stripeCustomerId = await getOrCreateStripeCustomer(clientId)

  const successBasePath = installment.invoice.project?.id
    ? `/projects/${installment.invoice.project.id}/financial`
    : "/financial"
  const successUrl = `${env.NEXT_PUBLIC_SITE_URL}${successBasePath}?success=true&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${env.NEXT_PUBLIC_SITE_URL}${successBasePath}?canceled=true`

  const project = installment.invoice.project
  const serviceCategory = project?.serviceCategory

  // Dynamic description based on project settings instead of static boilerplate
  const categoryNames: Record<string, string> = {
    LANDING_PAGE: "Landing Page",
    INSTITUTIONAL_SITE: "Site Institucional",
    BOOKING_PLATFORM: "Sistema / Agendamento",
    STABILITY_PLAN: "Plano de Estabilidade",
  }

  const baseName =
    categoryNames[project?.category || ""] || serviceCategory?.name || "Projeto"
  const i18nSuffix = project?.hasInternationalization ? " (com i18n)" : ""

  const productDescription =
    installment.invoice.kind === InvoiceKind.MAGUI_CONNECT
      ? "Pagina de links profissional com visual estrategico, organizacao dos canais e painel para acompanhar acessos."
      : installment.invoice.description || `${baseName}${i18nSuffix}`

  const productImages = serviceCategory?.imageUrl
    ? [serviceCategory.imageUrl]
    : ["https://magui.studio/og-image.png"]

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name:
              installment.invoice.kind === InvoiceKind.MAGUI_CONNECT
                ? `MAGUI Connect - Parcela ${installment.number}`
                : `${installment.invoice.title} - Parcela ${installment.number}`,
            description: productDescription,
            images: productImages,
          },
          // Amount is stored in cents already
          unit_amount: installment.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
    // Remove payment_method_types to allow Stripe to manage available methods automatically
    // based on dashboard settings (Pix, Boleto, etc)
    metadata: {
      installmentId: installment.id,
      invoiceId: installment.invoiceId,
    },
    payment_intent_data: {
      metadata: {
        installmentId: installment.id,
      },
    },
    payment_method_options: {
      card: {
        installments: {
          enabled: true,
        },
      },
    },
  })

  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: session.url,
    },
  })

  return session
}

export async function verifyAndSyncStripePayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return { success: false, message: "Payment not completed in Stripe" }
    }

    const installmentId = session.metadata?.installmentId
    if (!installmentId) {
      return { success: false, message: "No installmentId in session metadata" }
    }

    // Check if already paid to avoid redundant transactions
    const existing = await prisma.installment.findUnique({
      where: { id: installmentId },
      select: { status: true, invoiceId: true },
    })

    if (existing?.status === "PAID") {
      return {
        success: true,
        message: "Already marked as paid",
        installmentId,
      }
    }

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

      // 2. Add a payment event
      await tx.paymentEvent.create({
        data: {
          installmentId,
          type: "STRIPE",
          amount: session.amount_total ?? 0,
          date: new Date(),
          note: `Pagamento via Sincronizacao Direta (Checkout Session: ${session.id})`,
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
    })

    return {
      success: true,
      message: "Payment synchronized successfully",
      installmentId,
    }
  } catch (error) {
    console.error("Error verifying Stripe payment:", error)
    return { success: false, message: "Verification failed" }
  }
}
