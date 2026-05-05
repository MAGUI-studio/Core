import {
  ActionStatus,
  ActionTargetRole,
  ApprovalStatus,
  AssetOrigin,
  AssetType,
  AssetVisibility,
  PaymentMethod,
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client"

export interface DashboardProject {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  budget: number | null
  customValue: boolean
  hasInternationalization: boolean
  internationalizationFee: number | null
  paymentMethod: PaymentMethod
  serviceCategoryId: string | null
  deadline: Date | null
  startDate: Date
  liveUrl: string | null
  repositoryUrl: string | null
  category: ProjectCategory
  clientId: string
  briefing: {
    brandTone: string
    visualReferences: string[]
    businessGoals: string
    primaryCta: string
    targetAudience: string
    differentiators: string
  } | null
  briefingNotes?: DashboardBriefingEntry[]
  client: {
    id: string
    name: string | null
    email: string
    companyName: string | null
    phone: string | null
    position: string | null
    taxId: string | null
  }
  updates: DashboardUpdate[]
  assets: DashboardAsset[]
  actionItems?: DashboardActionItem[]
  versions?: DashboardVersion[]
  notifications?: DashboardNotification[]
  auditLogs?: DashboardAuditLog[]
  members?: DashboardProjectMember[]
  createdAt: Date
  updatedAt: Date
}

export interface DashboardBriefingEntry {
  id: string
  title: string
  content: string
  projectId: string
  createdById: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardProjectMember {
  id: string
  role: ProjectMemberRole
  projectId: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    companyName: string | null
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardUpdate {
  id: string
  title: string
  description: string | null
  isMilestone: boolean
  imageUrl: string | null
  timezone: string
  projectId: string
  createdAt: Date | string
  project: {
    name: string
  }
  requiresApproval: boolean
  approvalStatus: ApprovalStatus
  approvedAt: Date | string | null
  feedback: string | null
  attachments?: DashboardUpdateAttachment[]
  approvalEvents?: DashboardApprovalEvent[]
}

export interface DashboardApprovalEvent {
  id: string
  decision: ApprovalStatus
  comment: string | null
  updateId: string
  actorId: string | null
  actor?: {
    id: string
    name: string | null
    role: UserRole
  } | null
  createdAt: Date | string
}

export interface DashboardUpdateAttachment {
  id: string
  name: string
  url: string
  key: string
  customId: string | null
  type: AssetType
  mimeType: string | null
  size: number | null
  createdAt: Date | string
}

export interface DashboardNotification {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
  title: string
  message: string
  ctaPath: string | null
  readAt: Date | string | null
  createdAt: Date | string
  project?: {
    id: string
    name: string
  } | null
}

export interface DashboardAuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  summary: string
  metadata?: {
    origin?: string
    before?: Record<string, unknown> | null
    after?: Record<string, unknown> | null
    relatedEntities?: Array<{
      type: string
      id: string
      label?: string
    }>
    comment?: string | null
    feedback?: string | null
    [key: string]: unknown
  } | null
  createdAt: Date | string
  actorType: "SYSTEM" | "USER"
  actor: {
    id: string
    name: string | null
    role: UserRole
  } | null
}

export interface DashboardAsset {
  id: string
  name: string
  url: string
  key: string
  type: AssetType
  order: number
  timezone: string
  origin: AssetOrigin
  visibility: AssetVisibility
  projectId: string
  createdAt: Date | string
}

export interface DashboardActionItem {
  id: string
  title: string
  description: string | null
  status: ActionStatus
  targetRole: ActionTargetRole
  ctaPath?: string | null
  dueDate: Date | string | null
  projectId: string
  project: {
    name: string
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardVersion {
  id: string
  name: string
  deployUrl: string | null
  description: string | null
  scorePerformance: number | null
  scoreAccessibility: number | null
  scoreBestPractices: number | null
  scoreSEO: number | null
  projectId: string
  createdAt: Date | string
}
