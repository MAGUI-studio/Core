"use server"

import { revalidatePath } from "next/cache"

import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  UserRole,
  NotificationType,
} from "@/src/generated/client"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createNotification,
  createNotificationsMany,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import { addBusinessHours } from "@/src/lib/utils/support"

const SUPPORT_TICKET_CREATED = "SUPPORT_TICKET_CREATED" as NotificationType
const SUPPORT_TICKET_CLIENT_REPLY =
  "SUPPORT_TICKET_CLIENT_REPLY" as NotificationType
const SUPPORT_TICKET_ADMIN_REPLY =
  "SUPPORT_TICKET_ADMIN_REPLY" as NotificationType

const CreateTicketSchema = z.object({
  subject: z.string().trim().min(4).max(140),
  description: z.string().trim().min(10).max(5000),
  priority: z.nativeEnum(SupportTicketPriority).default(
    SupportTicketPriority.NORMAL
  ),
  category: z.nativeEnum(SupportTicketCategory).default(
    SupportTicketCategory.GENERAL
  ),
  projectId: z.string().trim().optional().or(z.literal("")),
})

const ReplySchema = z.object({
  ticketId: z.string().min(1),
  content: z.string().trim().min(2).max(5000),
  isInternal: z.boolean().optional().default(false),
})

const StatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.nativeEnum(SupportTicketStatus),
  priority: z.nativeEnum(SupportTicketPriority).optional(),
})

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
    },
  })
}

function revalidateSupportSurfaces(ticketId: string, projectId?: string | null) {
  revalidatePath("/admin/support")
  revalidatePath(`/admin/support/${ticketId}`)
  revalidatePath("/support")
  revalidatePath(`/support/${ticketId}`)
  if (projectId) {
    revalidatePath(`/projects/${projectId}`)
  }
}

function buildTicketCtaPath(ticketId: string, isInternal: boolean) {
  return isInternal ? `/admin/support/${ticketId}` : `/support/${ticketId}`
}

export async function createSupportTicketAction(input: z.infer<typeof CreateTicketSchema>) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== UserRole.CLIENT) {
      throw new Error("Unauthorized")
    }

    const data = CreateTicketSchema.parse(input)

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
        projectId: data.projectId || null,
        clientId: user.id,
        slaDeadlineAt: addBusinessHours(new Date(), 24),
        adminUnreadCount: 1,
        messages: {
          create: {
            content: data.description,
            authorId: user.id,
            isInternal: false,
          },
        },
      },
      include: {
        project: { select: { id: true } },
      },
    })

    const internalRecipients = await getInternalNotificationRecipients()
    await createNotificationsMany(
      internalRecipients.map((recipient) => ({
        userId: recipient.id,
        type: SUPPORT_TICKET_CREATED,
        title: `Novo ticket #${ticket.number}`,
        message: `${user.companyName ?? user.name ?? "Cliente"} abriu um novo chamado: ${ticket.subject}.`,
        ctaPath: buildTicketCtaPath(ticket.id, true),
        projectId: ticket.project?.id ?? null,
        metadata: {
          ticketId: ticket.id,
          ticketNumber: ticket.number,
          category: data.category,
          source: "client_create",
        },
      }))
    )

    revalidateSupportSurfaces(ticket.id, ticket.project?.id)
    return { success: true, ticketId: ticket.id }
  } catch (error) {
    logger.error({ error }, "Create Support Ticket Error")
    return { success: false, error: "Falha ao criar ticket." }
  }
}

export async function replySupportTicketAction(input: z.infer<typeof ReplySchema>) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const data = ReplySchema.parse(input)
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: data.ticketId },
      select: {
        id: true,
        number: true,
        subject: true,
        clientId: true,
        projectId: true,
        firstResponseAt: true,
      },
    })

    if (!ticket) throw new Error("Ticket not found")
    if (user.role === UserRole.CLIENT && ticket.clientId !== user.id) {
      throw new Error("Unauthorized")
    }

    const isInternal = user.role === UserRole.CLIENT ? false : data.isInternal
    const nextStatus =
      user.role === UserRole.CLIENT
        ? SupportTicketStatus.OPEN
        : isInternal
          ? undefined
          : SupportTicketStatus.ANSWERED

    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({
        data: {
          ticketId: data.ticketId,
          content: data.content,
          isInternal,
          authorId: user.id,
        },
      })

      await tx.supportTicket.update({
        where: { id: data.ticketId },
        data: {
          status: nextStatus,
          slaDeadlineAt:
            user.role === UserRole.CLIENT
              ? addBusinessHours(new Date(), 24)
              : undefined,
          firstResponseAt:
            user.role !== UserRole.CLIENT &&
            !isInternal &&
            !ticket.firstResponseAt
              ? new Date()
              : undefined,
          clientUnreadCount:
            user.role === UserRole.CLIENT
              ? 0
              : isInternal
                ? undefined
                : { increment: 1 },
          adminUnreadCount:
            user.role === UserRole.CLIENT ? { increment: 1 } : 0,
        },
      })
    })

    if (user.role === UserRole.CLIENT) {
      const internalRecipients = await getInternalNotificationRecipients()
      await createNotificationsMany(
        internalRecipients.map((recipient) => ({
          userId: recipient.id,
          type: SUPPORT_TICKET_CLIENT_REPLY,
          title: `Nova resposta no ticket #${ticket.number}`,
          message: `${user.companyName ?? user.name ?? "Cliente"} respondeu o chamado "${ticket.subject}".`,
          ctaPath: buildTicketCtaPath(ticket.id, true),
          projectId: ticket.projectId ?? null,
          metadata: {
            ticketId: ticket.id,
            ticketNumber: ticket.number,
            source: "client_reply",
          },
        }))
      )
    } else if (!isInternal) {
      await createNotification({
        userId: ticket.clientId,
        type: SUPPORT_TICKET_ADMIN_REPLY,
        title: `Seu ticket #${ticket.number} recebeu resposta`,
        message: `A equipe MAGUI respondeu o chamado "${ticket.subject}".`,
        ctaPath: buildTicketCtaPath(ticket.id, false),
        projectId: ticket.projectId ?? null,
        metadata: {
          ticketId: ticket.id,
          ticketNumber: ticket.number,
          source: "admin_reply",
        },
      })
    }

    revalidateSupportSurfaces(ticket.id, ticket.projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Reply Support Ticket Error")
    return { success: false, error: "Falha ao responder ticket." }
  }
}

export async function updateSupportTicketStatusAction(
  input: z.infer<typeof StatusSchema>
) {
  try {
    await protect(["admin", "member"])
    const data = StatusSchema.parse(input)
    const ticket = await prisma.supportTicket.update({
      where: { id: data.ticketId },
      data: {
        status: data.status,
        priority: data.priority,
        resolvedAt:
          data.status === SupportTicketStatus.RESOLVED ? new Date() : null,
        closedAt: data.status === SupportTicketStatus.CLOSED ? new Date() : null,
      },
      select: { id: true, projectId: true },
    })

    revalidateSupportSurfaces(ticket.id, ticket.projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Support Ticket Status Error")
    return { success: false, error: "Falha ao atualizar ticket." }
  }
}

export async function markSupportTicketAsReadAction(ticketId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, clientId: true, projectId: true },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (user.role === UserRole.CLIENT && ticket.clientId !== user.id) {
      throw new Error("Unauthorized")
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data:
        user.role === UserRole.CLIENT
          ? { clientUnreadCount: 0 }
          : { adminUnreadCount: 0 },
    })
    revalidateSupportSurfaces(ticket.id, ticket.projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Mark Support Ticket Read Error")
    return { success: false }
  }
}
