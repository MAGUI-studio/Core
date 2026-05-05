import {
  LeadActivityType,
  LeadSource,
  LeadStatus,
} from "@/src/generated/client"

export interface Lead {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  status: LeadStatus
  source: LeadSource
  notes: string | null
  value: string | null
  lastContactAt: Date | string | null
  nextActionAt: Date | string | null
  assignedToId: string | null
  proposalCount?: number
  acceptedProposalCount?: number

  convertedProjectId: string | null
  convertedAt: Date | string | null

  activities?: LeadActivity[]
  followUpNotes?: LeadNote[]

  createdAt: Date | string
  updatedAt: Date | string
}

export interface LeadNote {
  id: string
  content: string
  leadId: string
  authorId: string | null
  author?: {
    id: string
    name: string | null
  } | null
  createdAt: Date | string
}

export interface LeadActivity {
  id: string
  type: LeadActivityType
  title: string
  content: string | null
  metadata: Record<string, unknown>
  leadId: string
  authorId: string | null
  author?: {
    id: string
    name: string | null
  } | null
  createdAt: Date | string
}

export interface MessageTemplate {
  id: string
  scope: string
  name: string
  content: string
  createdById: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SavedView {
  id: string
  userId: string
  module: string
  name: string
  filtersJson: Record<string, unknown>
  createdAt: Date | string
  updatedAt: Date | string
}
