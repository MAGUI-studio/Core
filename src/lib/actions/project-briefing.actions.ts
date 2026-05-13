"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { Prisma } from "@/src/generated/client"
import {
  AuditActorType,
  NotificationType,
  ProjectStatus,
  UserRole,
} from "@/src/generated/client"
import { addDays } from "date-fns"

import { triggerProductEvent } from "@/src/lib/email/events"
import { cancelProjectBonusIfNeeded } from "@/src/lib/invoice-fulfillment"
import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotificationsMany,
  ensureProjectAccess,
  getAuditOriginLabel,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import {
  buildProjectSchedulePersistence,
  hasMinimumBrandAssets,
  hasPrimaryBriefingData,
  normalizeProjectScheduleData,
  resolveProjectStatusFromSchedule,
  syncProjectScheduleFromBriefing,
} from "@/src/lib/project-schedule"
import {
  revalidateProjectBriefing,
  revalidateProjectData,
} from "@/src/lib/revalidate"
import { briefingSchema } from "@/src/lib/validations/project"

import { cacheTags } from "../cache-tags"

async function verifyAndCreateMissingBriefingTasks(
  projectId: string,
  briefing: unknown,
  tx: Prisma.TransactionClient
) {
  const data = (briefing as Record<string, unknown>) || {}

  const logoTaskTitle = "Enviar logo principal da marca (Vetor/PNG)"
  const paletteTaskTitle = "Definir cores principais da marca (HEX)"

  // 1. Handle Logo Task - Robust Check
  const logos = data.logos as Record<string, { url?: string }> | undefined
  const primaryLogo = logos?.primary
  const hasPrimaryLogo =
    !!primaryLogo &&
    (typeof primaryLogo === "string"
      ? (primaryLogo as string).length > 10
      : !!primaryLogo.url)

  if (hasPrimaryLogo) {
    // NUCLEAR: Mark ANY task that mentions "logo" for this project as COMPLETED
    await tx.actionItem.updateMany({
      where: {
        projectId,
        title: { contains: "logo", mode: "insensitive" },
        status: "PENDING",
      },
      data: { status: "COMPLETED" },
    })
  } else {
    const exists = await tx.actionItem.findFirst({
      where: { projectId, title: logoTaskTitle, status: "PENDING" },
    })
    if (!exists) {
      await tx.actionItem.create({
        data: {
          projectId,
          title: logoTaskTitle,
          description:
            "Item obrigatório para avanço operacional identificado via briefing.",
          status: "PENDING",
          dueDate: addDays(new Date(), 2),
          targetRole: "CLIENT",
          ctaPath: `/projects/${projectId}/briefing`,
        },
      })
    }
  }

  // 2. Handle Palette Task - Robust Check
  const palette = data.palette as { primary?: string } | undefined
  const hasPrimaryPalette =
    !!palette?.primary &&
    typeof palette.primary === "string" &&
    palette.primary.startsWith("#")

  if (hasPrimaryPalette) {
    await tx.actionItem.updateMany({
      where: {
        projectId,
        title: { contains: "cores", mode: "insensitive" },
        status: "PENDING",
      },
      data: { status: "COMPLETED" },
    })
  } else {
    const exists = await tx.actionItem.findFirst({
      where: { projectId, title: paletteTaskTitle, status: "PENDING" },
    })
    if (!exists) {
      await tx.actionItem.create({
        data: {
          projectId,
          title: paletteTaskTitle,
          description:
            "Item obrigatório para avanço operacional identificado via briefing.",
          status: "PENDING",
          dueDate: addDays(new Date(), 2),
          targetRole: "CLIENT",
          ctaPath: `/projects/${projectId}/briefing`,
        },
      })
    }
  }
}

export async function updateProjectBriefingAction(
  projectId: string,
  briefing: Prisma.InputJsonValue
): Promise<{ error?: string; success?: boolean }> {
  const validatedBriefing = briefingSchema.safeParse(briefing)

  if (!validatedBriefing.success) {
    const errorMessages = validatedBriefing.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    return {
      error: `Briefing inválido: ${errorMessages}`,
    }
  }

  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      const previousProject = await tx.project.findUnique({
        where: { id: projectId },
        select: { briefing: true, scheduleData: true, status: true },
      })

      const syncedSchedule = syncProjectScheduleFromBriefing(
        previousProject?.scheduleData,
        validatedBriefing.data,
        previousProject?.status
      )
      const schedulePersistence = buildProjectSchedulePersistence(
        syncedSchedule,
        previousProject?.status
      )
      const resolvedStatus = previousProject?.status
        ? resolveProjectStatusFromSchedule(
            syncedSchedule,
            previousProject.status
          )
        : undefined

      await tx.project.update({
        where: { id: projectId },
        data: {
          briefing: validatedBriefing.data as Prisma.InputJsonValue,
          scheduleData: syncedSchedule as Prisma.InputJsonValue,
          ...schedulePersistence,
          ...(resolvedStatus ? { status: resolvedStatus } : {}),
          kickoff: {
            upsert: {
              create: {
                briefingCompleted: hasPrimaryBriefingData(
                  validatedBriefing.data
                ),
                brandAssetsSent: hasMinimumBrandAssets(validatedBriefing.data),
              },
              update: {
                briefingCompleted: hasPrimaryBriefingData(
                  validatedBriefing.data
                ),
                brandAssetsSent: hasMinimumBrandAssets(validatedBriefing.data),
              },
            },
          },
        },
      })

      if (resolvedStatus === ProjectStatus.ABANDONED) {
        await cancelProjectBonusIfNeeded(tx, projectId)
      }

      // Verify missing critical data and create tasks
      await verifyAndCreateMissingBriefingTasks(
        projectId,
        validatedBriefing.data,
        tx
      )

      await createAuditLog(
        {
          action: "project.briefing_updated",
          entityType: "Project",
          entityId: projectId,
          summary: `Briefing do projeto ${project.name} atualizado.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
            before: {
              briefing: previousProject?.briefing ?? null,
            },
            after: {
              briefing: validatedBriefing.data,
            },
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
            ],
          } as Prisma.InputJsonValue,
        },
        tx
      )

      if (user.role === UserRole.CLIENT) {
        const admins = await getInternalNotificationRecipients()
        await createNotificationsMany(
          admins.map((admin) => ({
            userId: admin.id,
            projectId,
            type: NotificationType.BRIEFING_SUBMITTED,
            title: "Briefing enviado",
            message: `${project.client.name ?? "O cliente"} atualizou o briefing de ${project.name}.`,
            ctaPath: `/admin/projects/${projectId}`,
          })),
          tx
        )
      }
    })

    revalidateProjectData(projectId)
    revalidatePath("/")
    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Briefing Error:")
    return {
      error: `Erro ao atualizar briefing: ${error instanceof Error ? error.message : "Desconhecido"}`,
    }
  }
}

export async function savePartialBriefingAction(
  projectId: string,
  partialBriefing: Record<string, unknown>
): Promise<{ error?: string; success?: boolean }> {
  const validated = briefingSchema.partial().safeParse(partialBriefing)

  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message ?? "Dados parciais inválidos",
    }
  }

  try {
    await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { briefing: true, scheduleData: true, status: true },
      })

      if (!project) throw new Error("Project not found")

      const currentBriefing =
        (project.briefing as Record<string, unknown>) || {}
      const updatedBriefing = { ...currentBriefing, ...validated.data }
      const syncedSchedule = syncProjectScheduleFromBriefing(
        project.scheduleData,
        updatedBriefing,
        project.status
      )
      const schedulePersistence = buildProjectSchedulePersistence(
        syncedSchedule,
        project.status
      )
      const resolvedStatus = resolveProjectStatusFromSchedule(
        syncedSchedule,
        project.status
      )

      await tx.project.update({
        where: { id: projectId },
        data: {
          briefing: updatedBriefing as Prisma.InputJsonValue,
          scheduleData: syncedSchedule as Prisma.InputJsonValue,
          ...schedulePersistence,
          status: resolvedStatus,
        },
      })

      if (resolvedStatus === ProjectStatus.ABANDONED) {
        await cancelProjectBonusIfNeeded(tx, projectId)
      }
    })

    revalidateProjectBriefing(projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save Partial Briefing Error:")
    return { error: "Erro ao salvar progresso do briefing" }
  }
}

export async function createBriefingNoteAction(input: {
  projectId: string
  title: string
  content: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(input.projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      const note = await tx.briefingEntry.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          content: input.content,
          createdById: user.id,
        },
      })

      await createAuditLog(
        {
          action: "project.briefing_note_added",
          entityType: "BriefingEntry",
          entityId: note.id,
          summary: `Nova nota de briefing "${note.title}" adicionada ao projeto ${project.name}.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId: input.projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
            after: {
              title: note.title,
              content: note.content,
            },
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
              {
                type: "BriefingEntry",
                id: note.id,
                label: note.title,
              },
            ],
          },
        },
        tx
      )

      if (user.role === UserRole.CLIENT) {
        const admins = await getInternalNotificationRecipients()
        await createNotificationsMany(
          admins.map((admin) => ({
            userId: admin.id,
            projectId: input.projectId,
            type: NotificationType.BRIEFING_SUBMITTED,
            title: "Nova especificação de briefing",
            message: `${user.name || "O cliente"} adicionou uma nova nota ao briefing de ${project.name}.`,
            ctaPath: `/admin/projects/${input.projectId}`,
          })),
          tx
        )
      }
    })

    revalidatePath("/")
    revalidatePath(`/admin/projects/${input.projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Briefing Note Error:")
    return { error: "Erro ao adicionar nota de briefing" }
  }
}

export async function addBriefingNoteAction(input: {
  projectId: string
  title: string
  content: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user } = await ensureProjectAccess(input.projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      await tx.briefingEntry.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          content: input.content,
          createdById: user.id,
        },
      })

      await createAuditLog(
        {
          action: "project.briefing_note.created",
          entityType: "BriefingNote",
          entityId: input.projectId,
          summary: `Nova nota de briefing adicionada: "${input.title}".`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId: input.projectId,
          metadata: {
            title: input.title,
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath(`/projects/${input.projectId}/briefing`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Briefing Note Error:")
    return { error: "Erro ao adicionar nota de briefing" }
  }
}

export async function resetProjectBriefingAction(
  projectId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.ADMIN,
    ])

    await prisma.$transaction(async (tx) => {
      const currentProject = await tx.project.findUnique({
        where: { id: projectId },
        select: { scheduleData: true, status: true },
      })
      const baseSchedule = normalizeProjectScheduleData(
        currentProject?.scheduleData
      )
      const resetSchedule = {
        ...baseSchedule,
        executionState: "PENDING_INPUT",
        materialValidatedAt: null,
        executionStartAt: null,
        awaitingClientSince: new Date().toISOString(),
        currentForecastDate: null,
        clientDelayCalendarDays: 0,
        clientDelayBusinessDays: 0,
        briefingValidatedAt: null,
        assetsValidatedAt: null,
        suspensionStartedAt: null,
        abandonedAt: null,
        delayEvents: [],
        pendingClientApprovals: [],
      }
      const schedulePersistence = buildProjectSchedulePersistence(resetSchedule)
      const resolvedStatus = resolveProjectStatusFromSchedule(
        resetSchedule,
        currentProject?.status ?? ProjectStatus.STRATEGY
      )

      // Clear briefing data - Use empty object to ensure it's "not filled" but valid JSON
      await tx.project.update({
        where: { id: projectId },
        data: {
          briefing: {},
          scheduleData: resetSchedule,
          ...schedulePersistence,
          status: resolvedStatus,
        },
      })

      if (resolvedStatus === ProjectStatus.ABANDONED) {
        await cancelProjectBonusIfNeeded(tx, projectId)
      }

      // Reset kickoff checklist (using upsert to avoid failure if not exists)
      await tx.projectKickoffChecklist.upsert({
        where: { projectId },
        create: {
          projectId,
          briefingCompleted: false,
        },
        update: {
          briefingCompleted: false,
        },
      })

      await createAuditLog(
        {
          action: "project.briefing_reset",
          entityType: "Project",
          entityId: projectId,
          summary: `Briefing do projeto ${project.name} resetado para novo preenchimento.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
          },
        },
        tx
      )

      // Notify client via notification
      await tx.notification.create({
        data: {
          userId: project.clientId,
          projectId,
          type: NotificationType.OPERATIONAL_REMINDER,
          title: "Novo preenchimento de briefing solicitado",
          message: `A equipe solicitou que você preencha novamente o briefing do projeto ${project.name}.`,
          ctaPath: `/projects/${projectId}/briefing`,
        },
      })
    })

    // Trigger transactional email via Resend
    await triggerProductEvent({
      type: "BRIEFING_REQUESTED",
      projectId: projectId,
    })

    revalidateProjectData(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/briefing`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Reset Briefing Error:")
    return { error: "Erro ao resetar briefing" }
  }
}

export async function markActionItemAsCompletedAction(
  projectId: string,
  title: string
): Promise<{ success: boolean }> {
  try {
    // Determine a search term to be flexible (e.g. "logo", "cores" or "identidade")
    const searchTerm = title.toLowerCase().includes("logo")
      ? "logo"
      : title.toLowerCase().includes("cores")
        ? "cores"
        : title.toLowerCase().includes("identidade")
          ? "identidade"
          : title

    await prisma.actionItem.updateMany({
      where: {
        projectId,
        title: { contains: searchTerm, mode: "insensitive" },
        status: "PENDING",
      },
      data: {
        status: "COMPLETED",
      },
    })
    revalidateProjectData(projectId)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Mark Task Error:", error)
    return { success: false }
  }
}
