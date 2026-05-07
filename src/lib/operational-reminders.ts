import { revalidatePath } from "next/cache"

import {
  ApprovalStatus,
  LeadStatus,
  NotificationType,
  ProjectStatus,
  ScheduledReminderStatus,
  ScheduledReminderType,
} from "@/src/generated/client"
import { Prisma } from "@/src/generated/client/client"
import { endOfDay, startOfDay, subDays } from "date-fns"

import prisma from "@/src/lib/prisma"
import { getInternalNotificationRecipients } from "@/src/lib/project-governance"
import { buildProjectScheduleView } from "@/src/lib/project-schedule"

type ReminderCandidate = {
  type: ScheduledReminderType
  entityType: string
  entityId: string
  title: string
  message: string
  ctaPath: string
  scheduledFor: Date
  metadata?: Record<string, string | number | boolean | null>
}

const activeReminderStatuses: ScheduledReminderStatus[] = [
  ScheduledReminderStatus.PENDING,
  ScheduledReminderStatus.SENT,
]

function buildReminderKey(
  candidate: ReminderCandidate,
  recipientUserId: string
): string {
  return `${recipientUserId}:${candidate.type}:${candidate.entityId}`
}

async function getReminderCandidates(): Promise<ReminderCandidate[]> {
  const now = new Date()
  const stalledLeadThreshold = subDays(now, 3)
  const pendingApprovalThreshold = subDays(now, 2)
  const silentProjectThreshold = subDays(now, 7)
  const overdueStart = startOfDay(now)

  const [stalledLeads, pendingApprovals, activeProjects, overdueActionItems] =
    await Promise.all([
      prisma.lead.findMany({
        where: {
          status: {
            in: [LeadStatus.GARIMPAGEM, LeadStatus.CONTATO_REALIZADO],
          },
          updatedAt: {
            lte: stalledLeadThreshold,
          },
        },
        select: {
          id: true,
          companyName: true,
          status: true,
          updatedAt: true,
        },
        take: 20,
        orderBy: { updatedAt: "asc" },
      }),
      prisma.update.findMany({
        where: {
          requiresApproval: true,
          approvalStatus: ApprovalStatus.PENDING,
          createdAt: {
            lte: pendingApprovalThreshold,
          },
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20,
        orderBy: { createdAt: "asc" },
      }),
      prisma.project.findMany({
        where: {
          status: {
            not: ProjectStatus.LAUNCHED,
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          scheduleData: true,
          updatedAt: true,
          client: {
            select: {
              name: true,
              email: true,
            },
          },
          updates: {
            select: {
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        take: 50,
        orderBy: { updatedAt: "asc" },
      }),
      prisma.actionItem.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            lt: overdueStart,
          },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20,
        orderBy: { dueDate: "asc" },
      }),
    ])

  const scheduleProjects = activeProjects.map((project) => ({
    ...project,
    schedule: buildProjectScheduleView(project.scheduleData, project.status),
  }))

  const silentProjects = scheduleProjects.filter((project) => {
    const lastUpdateAt = project.updates[0]?.createdAt ?? project.updatedAt
    return (
      lastUpdateAt <= silentProjectThreshold &&
      project.schedule.executionState === "ACTIVE"
    )
  })
  const onHoldProjects = scheduleProjects.filter(
    (project) => project.schedule.executionState === "ON_HOLD_CLIENT"
  )
  const abandonedProjects = scheduleProjects.filter(
    (project) => project.schedule.executionState === "ABANDONED"
  )

  return [
    ...stalledLeads.map((lead) => ({
      type: ScheduledReminderType.LEAD_STALLED,
      entityType: "Lead",
      entityId: lead.id,
      title: `${lead.companyName} precisa de retorno`,
      message: `Lead parado desde ${lead.updatedAt.toLocaleDateString("pt-BR")} na etapa ${lead.status}.`,
      ctaPath: `/admin/crm?lead=${lead.id}`,
      scheduledFor: lead.updatedAt,
      metadata: {
        status: lead.status,
      },
    })),
    ...pendingApprovals.map((approval) => ({
      type: ScheduledReminderType.APPROVAL_PENDING,
      entityType: "Update",
      entityId: approval.id,
      title: `"${approval.title}" ainda aguarda aprovacao`,
      message: `${approval.project.name} segue pendente desde ${approval.createdAt.toLocaleDateString("pt-BR")}.`,
      ctaPath: `/admin/projects/${approval.project.id}?tab=timeline&update=${approval.id}`,
      scheduledFor: approval.createdAt,
      metadata: {
        projectId: approval.project.id,
      },
    })),
    ...silentProjects.map((project) => {
      const lastSignal = project.updates[0]?.createdAt ?? project.updatedAt
      return {
        type: ScheduledReminderType.PROJECT_SILENT,
        entityType: "Project",
        entityId: project.id,
        title: `${project.name} esta sem update recente`,
        message: `${project.client.name || project.client.email} esta sem nova atualizacao desde ${lastSignal.toLocaleDateString("pt-BR")}.`,
        ctaPath: `/admin/projects/${project.id}`,
        scheduledFor: lastSignal,
        metadata: {
          projectId: project.id,
        },
      }
    }),
    ...onHoldProjects.map((project) => {
      const waitingSince =
        project.schedule.awaitingClientSince ??
        project.schedule.suspensionStartedAt ??
        new Date()
      return {
        type: ScheduledReminderType.CLIENT_ON_HOLD,
        entityType: "Project",
        entityId: project.id,
        title: `${project.name} está suspenso por inatividade`,
        message: `${project.client.name || project.client.email} não respondeu no prazo contratual. O projeto está em espera desde ${waitingSince.toLocaleDateString("pt-BR")}.`,
        ctaPath: `/admin/projects/${project.id}`,
        scheduledFor: project.schedule.suspensionStartedAt ?? waitingSince,
        metadata: {
          projectId: project.id,
          executionState: project.schedule.executionState,
          clientDelayCalendarDays: project.schedule.clientDelayCalendarDays,
        },
      }
    }),
    ...abandonedProjects.map((project) => {
      const abandonedAt =
        project.schedule.abandonedAt ??
        project.schedule.awaitingClientSince ??
        new Date()
      return {
        type: ScheduledReminderType.PROJECT_ABANDONED,
        entityType: "Project",
        entityId: project.id,
        title: `${project.name} entrou em abandono contratual`,
        message: `${project.client.name || project.client.email} ultrapassou 30 dias corridos sem retorno. Revise a rescisão por abandono no CRM.`,
        ctaPath: `/admin/projects/${project.id}`,
        scheduledFor: abandonedAt,
        metadata: {
          projectId: project.id,
          executionState: project.schedule.executionState,
          clientDelayCalendarDays: project.schedule.clientDelayCalendarDays,
        },
      }
    }),
    ...overdueActionItems.map((item) => ({
      type: ScheduledReminderType.ACTION_ITEM_OVERDUE,
      entityType: "ActionItem",
      entityId: item.id,
      title: `${item.title} esta vencida`,
      message: `${item.project.name} tem uma tarefa vencida desde ${item.dueDate?.toLocaleDateString("pt-BR")}.`,
      ctaPath: `/admin/projects/${item.project.id}`,
      scheduledFor: item.dueDate ?? endOfDay(now),
      metadata: {
        projectId: item.project.id,
      },
    })),
  ]
}

export async function syncOperationalReminders(options?: {
  revalidate?: boolean
}): Promise<void> {
  const internalRecipients = await getInternalNotificationRecipients()

  if (internalRecipients.length === 0) {
    return
  }

  const candidates = await getReminderCandidates()
  const recipientIds = internalRecipients.map((recipient) => recipient.id)

  if (candidates.length === 0) {
    // If no candidates, resolve all active reminders for these recipients
    await prisma.scheduledReminder.updateMany({
      where: {
        recipientUserId: { in: recipientIds },
        status: { in: activeReminderStatuses },
      },
      data: {
        status: ScheduledReminderStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    })
    return
  }

  const candidateTypes = Array.from(new Set(candidates.map((c) => c.type)))
  const candidateEntityIds = Array.from(
    new Set(candidates.map((c) => c.entityId))
  )

  const existingReminders = await prisma.scheduledReminder.findMany({
    where: {
      recipientUserId: { in: recipientIds },
      type: { in: candidateTypes },
      entityId: { in: candidateEntityIds },
    },
    select: {
      id: true,
      type: true,
      entityId: true,
      recipientUserId: true,
      status: true,
    },
  })

  const activeKeys = new Set<string>()
  const existingKeys = new Map(
    existingReminders.map((reminder) => [
      `${reminder.recipientUserId}:${reminder.type}:${reminder.entityId}`,
      reminder,
    ])
  )

  const notificationsToCreate: Array<Prisma.NotificationCreateManyInput> = []
  const remindersToCreate: Array<Prisma.ScheduledReminderCreateManyInput> = []
  const remindersToUpdate: Array<{
    id: string
    data: Prisma.ScheduledReminderUpdateInput
  }> = []

  recipientIds.forEach((recipientUserId) => {
    candidates.forEach((candidate) => {
      const key = buildReminderKey(candidate, recipientUserId)
      activeKeys.add(key)

      const existingReminder = existingKeys.get(key)

      if (
        existingReminder &&
        activeReminderStatuses.includes(existingReminder.status)
      ) {
        return
      }

      const commonData = {
        title: candidate.title,
        message: candidate.message,
        ctaPath: candidate.ctaPath,
        metadata: {
          reminderType: candidate.type,
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          ...candidate.metadata,
        } as Prisma.JsonObject,
      }

      notificationsToCreate.push({
        userId: recipientUserId,
        type: NotificationType.OPERATIONAL_REMINDER,
        ...commonData,
      })

      if (existingReminder) {
        remindersToUpdate.push({
          id: existingReminder.id,
          data: {
            status: ScheduledReminderStatus.SENT,
            title: candidate.title,
            message: candidate.message,
            ctaPath: candidate.ctaPath,
            scheduledFor: candidate.scheduledFor,
            sentAt: new Date(),
            resolvedAt: null,
            metadata: (candidate.metadata || {}) as Prisma.JsonObject,
          },
        })
      } else {
        remindersToCreate.push({
          recipientUserId,
          type: candidate.type,
          status: ScheduledReminderStatus.SENT,
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          title: candidate.title,
          message: candidate.message,
          ctaPath: candidate.ctaPath,
          scheduledFor: candidate.scheduledFor,
          sentAt: new Date(),
          metadata: (candidate.metadata || {}) as Prisma.JsonObject,
        })
      }
    })
  })

  await prisma.$transaction(async (tx) => {
    if (notificationsToCreate.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await tx.notification.createMany({ data: notificationsToCreate as any })
    }

    if (remindersToCreate.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await tx.scheduledReminder.createMany({ data: remindersToCreate as any })
    }

    for (const update of remindersToUpdate) {
      await tx.scheduledReminder.update({
        where: { id: update.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: update.data as any,
      })
    }

    // Resolve reminders that are no longer candidates
    await tx.scheduledReminder.updateMany({
      where: {
        recipientUserId: { in: recipientIds },
        status: { in: activeReminderStatuses },
        NOT: Array.from(activeKeys).map((key) => {
          const [uid, type, eid] = key.split(":")
          return {
            recipientUserId: uid,
            type: type as ScheduledReminderType,
            entityId: eid,
          }
        }),
      },
      data: {
        status: ScheduledReminderStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    })
  })

  if (options?.revalidate !== false) {
    revalidatePath("/", "layout")
    revalidatePath("/admin")
  }
}

export async function getActiveScheduledReminders(recipientUserId: string) {
  return (await prisma.scheduledReminder.findMany({
    where: {
      recipientUserId,
      status: {
        in: [ScheduledReminderStatus.PENDING, ScheduledReminderStatus.SENT],
      },
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    take: 8,
  })) as Array<{
    id: string
    type: ScheduledReminderType
    scheduledFor: Date
    title: string
    message: string
  }>
}
