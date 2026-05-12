import prisma from "@/src/lib/prisma"
import { SupportTicketRecord } from "@/src/types/support"

type TicketAuthorRecord = {
  id: string
  name: string | null
  email?: string | null
  role?: string | null
}

type TicketMessageRecord = {
  id: string
  content: string
  isInternal: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string | null
  author?: TicketAuthorRecord | null
}

type TicketRelationRecord = {
  id: string
  number: number
  subject: string
  description: string
  status: SupportTicketRecord["status"]
  priority: SupportTicketRecord["priority"]
  category: SupportTicketRecord["category"]
  slaDeadlineAt: Date | null
  firstResponseAt: Date | null
  resolvedAt: Date | null
  closedAt: Date | null
  clientUnreadCount: number
  adminUnreadCount: number
  createdAt: Date
  updatedAt: Date
  clientId: string
  projectId: string | null
  client: {
    id: string
    name: string | null
    email: string
    companyName: string | null
  }
  project: {
    id: string
    name: string
    status?: string
  } | null
  messages?: TicketMessageRecord[]
  _count?: {
    messages: number
  }
}

function mapTicket(ticket: TicketRelationRecord): SupportTicketRecord {
  return {
    ...ticket,
    messageCount: ticket._count?.messages ?? 0,
    lastMessageAt: ticket.messages?.[0]?.createdAt ?? ticket.updatedAt,
    messages: ticket.messages?.map((message) => ({
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

  return tickets.map((ticket) => mapTicket(ticket as TicketRelationRecord))
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

  return ticket ? mapTicket(ticket as TicketRelationRecord) : null
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

  return tickets.map((ticket) => mapTicket(ticket as TicketRelationRecord))
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

  return ticket ? mapTicket(ticket as TicketRelationRecord) : null
}
