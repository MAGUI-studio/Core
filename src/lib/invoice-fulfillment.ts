import {
  InvoiceKind,
  NotificationType,
  Prisma,
  UserRole,
} from "@/src/generated/client"

import { createNotificationsMany } from "./project-governance"

async function ensureMaguiConnectProfile(
  tx: Prisma.TransactionClient,
  userId: string,
  fallbackName?: string | null
) {
  const existingProfile = await tx.maguiConnectProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existingProfile) {
    return existingProfile
  }

  return tx.maguiConnectProfile.create({
    data: {
      userId,
      displayName: fallbackName?.trim() || "MAGUI Connect",
      themeBackground: "#0a0a0a",
      themeForeground: "#f5f5f5",
    },
    select: { id: true },
  })
}

export async function applyInvoicePaidSideEffects(
  tx: Prisma.TransactionClient,
  invoiceId: string
) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      kind: true,
      title: true,
      clientId: true,
      client: {
        select: {
          id: true,
          name: true,
          canAccessMaguiConnect: true,
        },
      },
    },
  })

  if (!invoice || !invoice.clientId) {
    return
  }

  // Standalone invoice side effects
  if (invoice.kind !== InvoiceKind.PROJECT) {
    // 1. Get all admins to notify
    const admins = await tx.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    })

    const isConnect = invoice.kind === InvoiceKind.MAGUI_CONNECT

    // 2. Build notifications
    const notifications = admins.map((admin) => ({
      userId: admin.id,
      type: NotificationType.OPERATIONAL_REMINDER,
      title: isConnect ? "Connect Liberado" : "Cobranca Paga",
      message: isConnect
        ? `MAGUI Connect liberado automaticamente para ${invoice.client?.name || "cliente"}.`
        : `Fatura "${invoice.title}" de ${invoice.client?.name || "cliente"} foi liquidada.`,
      ctaPath: `/admin/clients/${invoice.clientId}`,
    }))

    await createNotificationsMany(notifications, tx)

    // 3. Auto-activate Connect if it's the kind
    if (isConnect && !invoice.client?.canAccessMaguiConnect) {
      await tx.user.update({
        where: { id: invoice.clientId },
        data: { canAccessMaguiConnect: true },
      })

      await ensureMaguiConnectProfile(
        tx,
        invoice.clientId,
        invoice.client?.name
      )
    }
  }
}
