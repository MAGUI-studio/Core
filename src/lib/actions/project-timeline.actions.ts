"use server"

import { revalidatePath } from "next/cache"

import {
  AssetType,
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client"

import { triggerProductEvent } from "@/src/lib/email/events"
import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotification,
  createNotificationsMany,
  ensureProjectAccess,
  getAuditOriginLabel,
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import { revalidateProjectTimeline } from "@/src/lib/revalidate"
import {
  addProjectTimelineSchema,
  rejectProjectUpdateSchema,
} from "@/src/lib/validations/project"

import { getAdminProjectPath, getDashboardPath } from "./project-action-utils"

type TimelineAttachmentInput = {
  name: string
  url: string
  key: string
  customId?: string | null
  type: AssetType
  mimeType?: string | null
  size?: number | null
}

function parseTimelineAttachments(
  rawValue: FormDataEntryValue | null
): TimelineAttachmentInput[] {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as TimelineAttachmentInput[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    logger.error({ error }, "Invalid timeline attachments payload")
    return []
  }
}

export async function addProjectTimelineAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const isMilestoneRaw = formData.get("isMilestone")
  const requiresApprovalRaw = formData.get("requiresApproval")

  const validatedFields = addProjectTimelineSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    isMilestone: isMilestoneRaw === "true" || isMilestoneRaw === "on",
    requiresApproval:
      requiresApprovalRaw === "true" || requiresApprovalRaw === "on",
    imageUrl: formData.get("imageUrl") || undefined,
    attachments: parseTimelineAttachments(formData.get("attachments")),
    timezone: formData.get("timezone"),
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]?.message ?? "Dados inválidos"
    logger.error(
      { errors: validatedFields.error.flatten() },
      "Validation Error in addProjectTimelineAction"
    )
    return { error }
  }

  const actor = await getCurrentAppUser()
  const {
    projectId,
    title,
    description,
    isMilestone,
    requiresApproval,
    imageUrl,
    attachments,
    timezone,
  } = validatedFields.data

  try {
    const coverImage =
      imageUrl ||
      attachments.find((attachment) => attachment.type === AssetType.IMAGE)?.url

    const { update } = await prisma.$transaction(async (tx) => {
      const newUpdate = await tx.update.create({
        data: {
          projectId,
          title,
          description: description ?? null,
          isMilestone,
          requiresApproval,
          approvalStatus: "PENDING",
          approvedAt: null,
          imageUrl: coverImage || null,
          timezone,
          attachments: attachments.length
            ? {
                create: attachments.map((attachment) => ({
                  name: attachment.name,
                  url: attachment.url,
                  key: attachment.key,
                  customId: attachment.customId ?? null,
                  type: attachment.type,
                  mimeType: attachment.mimeType ?? null,
                  size: attachment.size ?? null,
                })),
              }
            : undefined,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
            },
          },
          attachments: true,
        },
      })

      await createAuditLog(
        {
          action: "update.created",
          entityType: "Update",
          entityId: newUpdate.id,
          summary: `Atualização "${newUpdate.title}" registrada no projeto ${newUpdate.project.name}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            requiresApproval,
            isMilestone,
            attachmentsCount: newUpdate.attachments.length,
            after: {
              requiresApproval,
              isMilestone,
              attachmentsCount: newUpdate.attachments.length,
            },
            relatedEntities: [
              {
                type: "Project",
                id: newUpdate.project.id,
                label: newUpdate.project.name,
              },
              {
                type: "Update",
                id: newUpdate.id,
                label: newUpdate.title,
              },
            ],
          },
        },
        tx
      )

      if (requiresApproval) {
        await createNotification(
          {
            userId: newUpdate.project.clientId,
            projectId,
            type: NotificationType.UPDATE_PENDING_APPROVAL,
            title: "Nova aprovação pendente",
            message: `A atualização "${newUpdate.title}" está pronta para sua validação.`,
            ctaPath: getDashboardPath(projectId),
            metadata: {
              updateId: newUpdate.id,
              attachmentsCount: newUpdate.attachments.length,
            },
          },
          tx
        )
      } else {
        await createNotification(
          {
            userId: newUpdate.project.clientId,
            projectId,
            type: NotificationType.UPDATE_PUBLISHED,
            title: "Nova evolução publicada",
            message: `A atualização "${newUpdate.title}" foi adicionada na timeline do projeto.`,
            ctaPath: getDashboardPath(projectId),
            metadata: {
              updateId: newUpdate.id,
              attachmentsCount: newUpdate.attachments.length,
            },
          },
          tx
        )
      }

      // Trigger email notification after transaction
      return { update: newUpdate }
    })

    // Trigger transactional email
    if (requiresApproval) {
      await triggerProductEvent({
        type: "UPDATE_PENDING_APPROVAL",
        updateId: update.id,
        projectId: update.projectId,
      })
    } else {
      await triggerProductEvent({
        type: "UPDATE_PUBLISHED",
        updateId: update.id,
        projectId: update.projectId,
      })
    }

    revalidateProjectTimeline(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Timeline Error:")
    return { error: "Erro ao adicionar atualização no banco de dados" }
  }
}

export async function approveUpdateAction(
  updateId: string,
  projectId: string,
  comment?: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { user, project } = await ensureProjectAccess(projectId, [
      UserRole.CLIENT,
      UserRole.ADMIN,
      UserRole.MEMBER,
    ])

    await prisma.$transaction(async (tx) => {
      const updatedUpdate = await tx.update.update({
        where: { id: updateId, projectId },
        data: {
          approvalStatus: "APPROVED",
          approvedAt: new Date(),
          feedback: null,
          approvalEvents: {
            create: {
              decision: "APPROVED",
              comment: comment || null,
              actorId: user.id,
            },
          },
        },
      })

      await createAuditLog(
        {
          action: "update.approved",
          entityType: "Update",
          entityId: updatedUpdate.id,
          summary: `Atualização "${updatedUpdate.title}" aprovada pelo cliente.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
            before: {
              approvalStatus: "PENDING",
            },
            after: {
              approvalStatus: "APPROVED",
            },
            comment,
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
              {
                type: "Update",
                id: updatedUpdate.id,
                label: updatedUpdate.title,
              },
            ],
          },
        },
        tx
      )

      const admins = await getInternalNotificationRecipients()

      await createNotificationsMany(
        admins.map((admin) => ({
          userId: admin.id,
          projectId,
          type: NotificationType.UPDATE_APPROVED,
          title: "Milestone aprovada",
          message: `${project.client.name ?? "O cliente"} aprovou "${updatedUpdate.title}".`,
          ctaPath: getAdminProjectPath(projectId),
          metadata: { updateId: updatedUpdate.id, comment },
        })),
        tx
      )

      return { update: updatedUpdate }
    })

    revalidateProjectTimeline(projectId)
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/projects")
    revalidatePath(`/admin/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Approve Update Error:")
    return { error: "Erro ao aprovar atualização" }
  }
}

export async function rejectUpdateAction(input: {
  updateId: string
  projectId: string
  feedback: string
}): Promise<{ error?: string; success?: boolean }> {
  const validated = rejectProjectUpdateSchema.safeParse(input)

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { user, project } = await ensureProjectAccess(
      validated.data.projectId,
      [UserRole.CLIENT, UserRole.ADMIN, UserRole.MEMBER]
    )

    await prisma.$transaction(async (tx) => {
      const updatedUpdate = await tx.update.update({
        where: {
          id: validated.data.updateId,
          projectId: validated.data.projectId,
        },
        data: {
          approvalStatus: "REJECTED",
          approvedAt: null,
          feedback: validated.data.feedback,
          approvalEvents: {
            create: {
              decision: "REJECTED",
              comment: validated.data.feedback,
              actorId: user.id,
            },
          },
        },
      })

      await createAuditLog(
        {
          action: "update.rejected",
          entityType: "Update",
          entityId: updatedUpdate.id,
          summary: `Atualização "${updatedUpdate.title}" reprovada com feedback do cliente.`,
          actorId: user.id,
          actorType: AuditActorType.USER,
          projectId: validated.data.projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: AuditActorType.USER,
              role: user.role,
            }),
            before: {
              approvalStatus: "PENDING",
            },
            after: {
              approvalStatus: "REJECTED",
            },
            feedback: validated.data.feedback,
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
              {
                type: "Update",
                id: updatedUpdate.id,
                label: updatedUpdate.title,
              },
            ],
          },
        },
        tx
      )

      const admins = await getInternalNotificationRecipients()

      await createNotificationsMany(
        admins.map((admin) => ({
          userId: admin.id,
          projectId: validated.data.projectId,
          type: NotificationType.UPDATE_REJECTED,
          title: "Milestone precisa de ajustes",
          message: `${project.client.name ?? "O cliente"} enviou feedback em "${updatedUpdate.title}".`,
          ctaPath: getAdminProjectPath(validated.data.projectId),
          metadata: {
            updateId: updatedUpdate.id,
            feedback: validated.data.feedback,
          },
        })),
        tx
      )

      return { update: updatedUpdate }
    })

    revalidateProjectTimeline(validated.data.projectId)
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/projects")
    revalidatePath(`/admin/projects/${validated.data.projectId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Reject Update Error:")
    return { error: "Erro ao registrar feedback da atualização" }
  }
}

export async function deleteProjectTimelineAction(
  updateId: string,
  projectId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const deletedUpdate = await tx.update.delete({
        where: { id: updateId, projectId },
      })

      const actor = await getCurrentAppUser()

      await createAuditLog(
        {
          action: "update.deleted",
          entityType: "Update",
          entityId: updateId,
          summary: `Atualização "${deletedUpdate.title}" removida da timeline.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            title: deletedUpdate.title,
          },
        },
        tx
      )
    })

    revalidateProjectTimeline(projectId)
    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Timeline Error:")
    return { error: "Erro ao remover atualização da timeline" }
  }
}
