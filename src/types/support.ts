import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/src/generated/client"

export interface SupportTicketMessageRecord {
  id: string
  content: string
  isInternal: boolean
  createdAt: Date | string
  updatedAt: Date | string
  authorId: string | null
  author?: {
    id: string
    name: string | null
    email?: string | null
    role?: string | null
  } | null
}

export interface SupportTicketRecord {
  id: string
  number: number
  subject: string
  description: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  category: SupportTicketCategory
  slaDeadlineAt: Date | string | null
  firstResponseAt: Date | string | null
  resolvedAt: Date | string | null
  closedAt: Date | string | null
  clientUnreadCount: number
  adminUnreadCount: number
  createdAt: Date | string
  updatedAt: Date | string
  clientId: string
  client: {
    id: string
    name: string | null
    email: string
    companyName: string | null
  }
  projectId: string | null
  project?: {
    id: string
    name: string
    status?: string
  } | null
  messages?: SupportTicketMessageRecord[]
  messageCount?: number
  lastMessageAt?: Date | string | null
}
