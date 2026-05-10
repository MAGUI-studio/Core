import {
  InstallmentStatus,
  InvoiceKind,
  NotificationType,
  Prisma,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client"

import { createAuditLog, createNotificationsMany } from "./project-governance"
import { normalizeProjectScheduleData } from "./project-schedule"

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
    },
    select: { id: true },
  })
}

async function releaseProjectBonusIfEligible(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      status: true,
      clientId: true,
      client: {
        select: {
          id: true,
          name: true,
          canAccessMaguiConnect: true,
        },
      },
      scheduleData: true,
      invoices: {
        where: {
          kind: InvoiceKind.PROJECT,
          status: { not: "CANCELLED" },
        },
        select: {
          installments: {
            select: { status: true },
          },
        },
      },
    },
  })

  if (!project?.clientId) return false

  const schedule = normalizeProjectScheduleData(project.scheduleData)
  const isEligible =
    schedule.includesMaguiConnectBonus &&
    schedule.maguiConnectBonusStatus !== "RELEASED" &&
    project.status === "LAUNCHED"

  if (!isEligible) return false

  const hasOpenInstallments = project.invoices.some((invoice) =>
    invoice.installments.some(
      (installment) =>
        installment.status !== InstallmentStatus.PAID &&
        installment.status !== InstallmentStatus.WAIVED
    )
  )

  if (hasOpenInstallments) return false

  await tx.project.update({
    where: { id: project.id },
    data: {
      scheduleData: {
        ...(schedule as Prisma.InputJsonObject),
        maguiConnectBonusStatus: "RELEASED",
      },
    },
  })

  await createAuditLog(
    {
      action: "magui_connect.bonus_released",
      entityType: "Project",
      entityId: project.id,
      projectId: project.id,
      summary: `Bonus MAGUI Connect liberado para o projeto ${project.name}.`,
      metadata: {
        clientId: project.clientId,
        sourceProposalId: schedule.sourceProposalId,
        previousStatus: schedule.maguiConnectBonusStatus,
        nextStatus: "RELEASED",
      },
    },
    tx
  )

  if (!project.client.canAccessMaguiConnect) {
    await tx.user.update({
      where: { id: project.clientId },
      data: { canAccessMaguiConnect: true },
    })
  }

  await ensureMaguiConnectProfile(tx, project.clientId, project.client.name)

  const admins = await tx.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  })

  await createNotificationsMany(
    admins.map((admin) => ({
      userId: admin.id,
      type: NotificationType.OPERATIONAL_REMINDER,
      title: "Bonus MAGUI Connect liberado",
      message: `O bonus do MAGUI Connect foi liberado automaticamente para ${project.client.name || "cliente"} no projeto ${project.name}.`,
      ctaPath: `/admin/projects/${project.id}`,
    })),
    tx
  )

  return true
}

async function cancelProjectBonusIfNeeded(
  tx: Prisma.TransactionClient,
  projectId: string,
  reason: "PROJECT_ABANDONED" | "PROJECT_CANCELLED" = "PROJECT_ABANDONED"
) {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientId: true,
      status: true,
      scheduleData: true,
    },
  })

  if (!project || !project.clientId) return false

  const schedule = normalizeProjectScheduleData(project.scheduleData)
  const canCancel =
    schedule.includesMaguiConnectBonus &&
    schedule.maguiConnectBonusStatus === "PENDING_RELEASE" &&
    project.status === ProjectStatus.ABANDONED

  if (!canCancel) return false

  await tx.project.update({
    where: { id: project.id },
    data: {
      scheduleData: {
        ...(schedule as Prisma.InputJsonObject),
        maguiConnectBonusStatus: "CANCELLED",
      },
    },
  })

  await createAuditLog(
    {
      action: "magui_connect.bonus_cancelled",
      entityType: "Project",
      entityId: project.id,
      projectId: project.id,
      summary: `Bonus MAGUI Connect cancelado para o projeto ${project.name}.`,
      metadata: {
        clientId: project.clientId,
        sourceProposalId: schedule.sourceProposalId,
        previousStatus: schedule.maguiConnectBonusStatus,
        nextStatus: "CANCELLED",
        reason,
      },
    },
    tx
  )

  return true
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
      projectId: true,
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

  if (invoice.kind === InvoiceKind.PROJECT && !invoice.projectId) {
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

    return
  }

  const projectInvoices = await tx.invoice.findMany({
    where: {
      projectId: invoice.projectId!,
      kind: InvoiceKind.PROJECT,
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
    },
  })

  if (projectInvoices.some((item) => item.id === invoice.id)) {
    await releaseProjectBonusIfEligible(tx, invoice.projectId!)
  }
}

export { cancelProjectBonusIfNeeded, releaseProjectBonusIfEligible }
