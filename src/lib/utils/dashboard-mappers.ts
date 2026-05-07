import { LeadStatus, ProjectStatus } from "@/src/generated/client"
import { Prisma } from "@/src/generated/client/client"

import { ActivityKind } from "@/src/components/admin/AdminActivityFeed"

import { getLeadHealth } from "@/src/lib/utils/lead-health"
import { getProjectHealth } from "@/src/lib/utils/project-health"

type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: {
    actor: { select: { id: true; name: true; role: true } }
    project: { select: { id: true; name: true } }
  }
}>

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  select: {
    id: true
    name: true
    status: true
    progress: true
    deadline: true
    scheduleData: true
    updatedAt: true
    client: { select: { name: true; email: true } }
    updates: { select: { createdAt: true } }
    _count: {
      select: {
        updates: true
        actionItems: true
      }
    }
  }
}>

type LeadWithRelations = Prisma.LeadGetPayload<{
  select: {
    id: true
    companyName: true
    contactName: true
    email: true
    phone: true
    instagram: true
    website: true
    status: true
    source: true
    createdAt: true
    updatedAt: true
    lastContactAt: true
  }
}>

export function mapPerformanceMetrics(data: {
  approvedUpdates: Array<{ createdAt: Date; approvedAt: Date | null }>
  convertedLeads: Array<{ createdAt: Date; convertedAt: Date | null }>
  activeProjectsCount: number
  silentProjectsCount: number
  projectDistribution: Array<{ label: ProjectStatus; value: number }>
  leadDistribution: Array<{ label: LeadStatus; value: number }>
  stagnantLeadsCount?: number
}) {
  const approvedUpdates = data.approvedUpdates.map((u) => ({
    createdAt: new Date(u.createdAt),
    approvedAt: new Date(u.approvedAt!),
  }))

  const averageApprovalHours =
    approvedUpdates.length > 0
      ? Math.round(
          approvedUpdates.reduce(
            (acc, u) =>
              acc +
              (u.approvedAt.getTime() - u.createdAt.getTime()) / 3_600_000,
            0
          ) / approvedUpdates.length
        )
      : 0

  const averageLeadConversionDays =
    data.convertedLeads.length > 0
      ? Math.round(
          data.convertedLeads.reduce(
            (acc, l) =>
              acc +
              (new Date(l.convertedAt!).getTime() -
                new Date(l.createdAt).getTime()) /
                86_400_000,
            0
          ) / data.convertedLeads.length
        )
      : 0

  const operationsMetrics = [
    {
      label: "Aprovacao media",
      value: averageApprovalHours > 0 ? `${averageApprovalHours}h` : "—",
      hint: "tempo ate aprovar entrega",
    },
    {
      label: "Conversao media",
      value:
        averageLeadConversionDays > 0 ? `${averageLeadConversionDays}d` : "—",
      hint: "tempo ate virar projeto",
    },
    {
      label: "Projetos ativos",
      value: String(data.activeProjectsCount),
      hint: `${data.silentProjectsCount} sem update recente`,
    },
    {
      label: "Leads estagnados",
      value:
        typeof data.stagnantLeadsCount === "number"
          ? String(data.stagnantLeadsCount)
          : "—",
      hint: "em risco comercial",
    },
  ]

  return {
    operationsMetrics,
    projectDistribution: data.projectDistribution,
    leadDistribution: data.leadDistribution.filter(
      (item) => item.label !== LeadStatus.DESCARTADO
    ),
  }
}

export function mapActivityLogs(logs: AuditLogWithRelations[]) {
  return logs.map((log) => {
    const normalizedAction = log.action.toLowerCase()
    const normalizedEntityType = log.entityType.toLowerCase()

    const kind: ActivityKind =
      normalizedAction.includes("approved") ||
      normalizedAction.includes("rejected")
        ? "approval"
        : normalizedEntityType.includes("asset")
          ? "asset"
          : normalizedEntityType.includes("briefing")
            ? "briefing"
            : normalizedEntityType.includes("update")
              ? "timeline"
              : normalizedEntityType.includes("project")
                ? "project"
                : "system"

    return {
      id: log.id,
      action: log.action,
      summary: log.summary,
      createdAt: log.createdAt,
      actorName: log.actor?.name ?? null,
      actorRole: log.actor?.role ?? null,
      projectName: log.project?.name ?? null,
      entityType: log.entityType,
      kind,
      href: log.projectId
        ? {
            pathname: "/admin/projects/[id]" as const,
            params: { id: log.projectId },
          }
        : "/admin/projects",
    }
  })
}

export function mapProjectHealth(projects: ProjectWithRelations[]) {
  return projects
    .map((project) => {
      const health = getProjectHealth({
        status: project.status,
        progress: project.progress,
        deadline: project.deadline,
        scheduleData: project.scheduleData,
        updatedAt: project.updatedAt,
        lastUpdateAt: project.updates[0]?.createdAt ?? null,
        pendingApprovalCount: project._count.updates,
        overdueActionItemCount: project._count.actionItems,
      })

      return {
        id: project.id,
        name: project.name,
        clientName: project.client.name || project.client.email,
        progress: project.progress,
        ...health,
      }
    })
    .sort((a, b) => a.score - b.score)
}

export function mapCommercialHealth(leads: LeadWithRelations[]) {
  return leads
    .map((lead) => {
      const health = getLeadHealth({
        status: lead.status,
        source: lead.source,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        lastContactAt: lead.lastContactAt,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        instagram: lead.instagram,
        website: lead.website,
      })

      return {
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        statusLabel: lead.status,
        ...health,
      }
    })
    .sort((a, b) => a.score - b.score)
}
