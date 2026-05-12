import prisma from "@/src/lib/prisma"
import { SupportTicketRecord } from "@/src/types/support"

function mapTicket(ticket: any): SupportTicketRecord {
  return {
    ...ticket,
    messageCount: ticket._count?.messages ?? ticket.messageCount ?? 0,
    lastMessageAt:
      ticket.messages?.[0]?.createdAt ??
      ticket.lastMessageAt ??
      ticket.updatedAt,
    messages: ticket.messages?.map((message: any) => ({
      ...message,
      author: message.author
        ? {
            id: message.author.id,
            name: message.author.name,
            email: message.author.email ?? null,
            role: message.author.role ?? null,
          }
        : null,
    })),
  }
}

export async function getAdminSupportTickets() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      client: {
        select: { id: true, name: true, email: true, companyName: true },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })

  return tickets.map(mapTicket)
}

export async function getAdminSupportTicketById(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, name: true, email: true, companyName: true },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  })

  return ticket ? mapTicket(ticket) : null
}

export async function getClientSupportTickets(clientId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { clientId },
    include: {
      client: {
        select: { id: true, name: true, email: true, companyName: true },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })

  return tickets.map(mapTicket)
}

export async function getClientSupportTicketById(id: string, clientId: string) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id, clientId },
    include: {
      client: {
        select: { id: true, name: true, email: true, companyName: true },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  })

  return ticket ? mapTicket(ticket) : null
}
