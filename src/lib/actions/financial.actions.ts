"use server"

import { revalidatePath } from "next/cache"

import {
  InstallmentStatus,
  InvoiceKind,
  InvoiceStatus,
} from "@/src/generated/client"
import { z } from "zod"

import { triggerProductEvent } from "@/src/lib/email/events"
import { applyInvoicePaidSideEffects } from "@/src/lib/invoice-fulfillment"
import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"
import { createCheckoutSession } from "@/src/lib/stripe-actions"
import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"
import {
  BillingProfileSchema,
  CreateInvoiceSchema,
  RegisterPaymentEventSchema,
} from "@/src/lib/validations/financial"

export async function createInvoiceAction(
  data: z.infer<typeof CreateInvoiceSchema>
) {
  try {
    await protect("admin")
    const user = await getCurrentAppUser()
    if (!user) throw new Error("Unauthorized")

    const validated = CreateInvoiceSchema.parse(data)
    let resolvedClientId = validated.clientId

    if (!resolvedClientId && validated.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validated.projectId },
        select: { clientId: true },
      })

      resolvedClientId = project?.clientId
    }

    if (!resolvedClientId) {
      throw new Error("Cliente nao encontrado para esta cobranca")
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          title: validated.title,
          description: validated.description,
          kind: validated.kind ?? InvoiceKind.PROJECT,
          projectId: validated.projectId,
          clientId: resolvedClientId,
          proposalId: validated.proposalId,
          documentId: validated.documentId,
          totalAmount: validated.totalAmount,
          currency: validated.currency,
          status: InvoiceStatus.SENT,
          dueDate: validated.dueDate,
          installments: {
            create: validated.installments.map((inst) => ({
              number: inst.number,
              amount: inst.amount,
              dueDate: inst.dueDate,
              status: InstallmentStatus.PENDING,
            })),
          },
        },
      })

      await createAuditLog(
        {
          action: "invoice.created",
          entityType: "Invoice",
          entityId: inv.id,
          summary: `Fatura "${inv.title}" de ${formatCurrencyBRLFromCents(inv.totalAmount)} criada.`,
          actorId: user.id,
          projectId: inv.projectId,
          metadata: { installments: validated.installments.length },
        },
        tx
      )

      return inv
    })

    // Create Stripe Checkout Sessions for all installments
    try {
      const installments = await prisma.installment.findMany({
        where: { invoiceId: invoice.id },
        select: { id: true },
      })

      await Promise.all(
        installments.map((inst) => createCheckoutSession(inst.id))
      )
    } catch (stripeError) {
      logger.error(
        { stripeError },
        "Failed to create Stripe sessions for installments"
      )
    }

    // Trigger email notification
    await triggerProductEvent({ type: "INVOICE_SENT", invoiceId: invoice.id })

    revalidatePath("/admin/financial")
    if (invoice.projectId)
      revalidatePath(`/admin/projects/${invoice.projectId}`)
    if (resolvedClientId) {
      revalidatePath(`/admin/clients/${resolvedClientId}`)
    }
    return { success: true, invoiceId: invoice.id }
  } catch (error) {
    logger.error({ error }, "Create Invoice Error")
    return { error: "Erro ao criar fatura" }
  }
}

export async function registerPaymentAction(
  data: z.infer<typeof RegisterPaymentEventSchema>
) {
  try {
    const user = await getCurrentAppUser()
    if (!user) return { error: "Unauthorized" }

    const validated = RegisterPaymentEventSchema.parse(data)

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentEvent.create({
        data: {
          installmentId: validated.installmentId,
          type: validated.type,
          amount: validated.amount,
          date: validated.date,
          note: validated.note,
          attachmentUrl: validated.attachmentUrl,
          attachmentKey: validated.attachmentKey,
        },
        include: {
          installment: {
            include: {
              invoice: true,
            },
          },
        },
      })

      // If full amount paid, update installment status
      await tx.installment.update({
        where: { id: validated.installmentId },
        data: {
          status: InstallmentStatus.PAID,
          paidAt: validated.date,
        },
      })

      // Update invoice status if all installments paid
      const invoice = await tx.invoice.findUnique({
        where: { id: payment.installment.invoiceId },
        include: { installments: true },
      })

      if (
        invoice &&
        invoice.installments.every((i) => i.status === InstallmentStatus.PAID)
      ) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.PAID },
        })
        await applyInvoicePaidSideEffects(tx, invoice.id)
      } else if (invoice) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.PARTIALLY_PAID },
        })
      }

      await createAuditLog(
        {
          action: "payment.registered",
          entityType: "PaymentEvent",
          entityId: payment.id,
          summary: `Pagamento de ${formatCurrencyBRLFromCents(payment.amount)} registrado para parcela #${payment.installment.number}.`,
          actorId: user.id,
          projectId: payment.installment.invoice.projectId,
        },
        tx
      )

      return payment
    })

    revalidatePath("/admin/financial")
    revalidatePath("/financial")
    if (result.installment.invoice.projectId) {
      revalidatePath(`/portal/projects/${result.installment.invoice.projectId}`)
      revalidatePath(`/admin/projects/${result.installment.invoice.projectId}`)
    }
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Register Payment Error")
    return { error: "Erro ao registrar pagamento" }
  }
}

export async function saveBillingProfileAction(
  userId: string,
  data: z.infer<typeof BillingProfileSchema>
) {
  try {
    await protect("admin")
    const validated = BillingProfileSchema.parse(data)

    await prisma.billingProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...validated,
      },
      update: {
        ...validated,
      },
    })

    revalidatePath(`/admin/clients/${userId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save Billing Profile Error")
    return { error: "Erro ao salvar perfil de faturamento" }
  }
}
