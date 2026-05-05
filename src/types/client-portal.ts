import { ProjectCategory, ProjectStatus } from "@/src/generated/client"

import {
  DashboardActionItem,
  DashboardAsset,
  DashboardBriefingEntry,
  DashboardProject,
  DashboardUpdate,
  DashboardUpdateAttachment,
} from "./dashboard"

export type ClientPortalUpdate = Omit<DashboardUpdate, "project"> & {
  project?: DashboardUpdate["project"]
  attachments?: DashboardUpdateAttachment[]
}

export type ClientPortalActionItem = Omit<DashboardActionItem, "project"> & {
  project?: DashboardActionItem["project"]
}

export type ClientPortalProject = Omit<
  DashboardProject,
  "client" | "updates" | "actionItems" | "briefingNotes"
> & {
  updates: ClientPortalUpdate[]
  actionItems?: ClientPortalActionItem[]
  briefingNotes?: DashboardBriefingEntry[]
}

export interface ClientHomeProject {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  budget: number | null
  deadline: Date | null
  startDate: Date
  liveUrl: string | null
  repositoryUrl: string | null
  category: ProjectCategory
  clientId: string
  briefing: unknown
  createdAt: Date
  updatedAt: Date
  updates: ClientPortalUpdate[]
  invoices: Array<{
    id: string
    status: string
    installments: Array<{
      id: string
      status: string
      dueDate: Date | string
      paidAt: Date | string | null
    }>
  }>
  _count: {
    updates: number
    actionItems: number
    invoices: number
  }
}

export interface ClientHomeData {
  projects: ClientHomeProject[]
  pendingApprovals: Array<
    ClientPortalUpdate & { project: { id: string; name: string } }
  >
  pendingTasks: Array<
    ClientPortalActionItem & { project: { id: string; name: string } }
  >
  recentActivity: Array<{
    id: string
    title: string
    type: "update" | "approval" | "file" | "task"
    projectName: string
    createdAt: Date | string
    href: string
  }>
}

export type ClientProjectSummary = Pick<
  DashboardProject,
  "id" | "name" | "status" | "progress" | "deadline" | "updatedAt"
> & {
  lastUpdate?: ClientPortalUpdate
  _count: {
    updates: number
    actionItems: number
    invoices: number
  }
}

export type ClientPortalAsset = DashboardAsset
