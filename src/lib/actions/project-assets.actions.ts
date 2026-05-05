"use server"

import { revalidatePath } from "next/cache"

import {
  AssetOrigin,
  AssetType,
  AssetVisibility,
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client"
import { UTApi } from "uploadthing/server"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotification,
  createNotificationsMany,
  getAuditOriginLabel,
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"

import { getDashboardPath } from "./project-action-utils"

export async function deleteProjectAssetAction(
  id: string,
  projectId: string,
  key: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const utapi = new UTApi()

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!asset) {
      return { error: "Arquivo nao encontrado" }
    }

    await utapi.deleteFiles(key)

    await prisma.$transaction(async (tx) => {
      await tx.asset.delete({
        where: { id },
      })

      await createAuditLog(
        {
          action: "asset.deleted",
          entityType: "Asset",
          entityId: asset.id,
          projectId,
          summary: `Arquivo ${asset.name} removido de ${asset.project.name}.`,
          metadata: {
            before: {
              name: asset.name,
              type: asset.type,
              visibility: asset.visibility,
              origin: asset.origin,
              key: asset.key,
            },
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath(`/admin/projects/${projectId}/assets`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Asset Error:")
    return { error: "Erro ao deletar arquivo" }
  }
}

export async function updateProjectAssetAction(input: {
  id: string
  projectId: string
  name: string
  type: AssetType
  visibility: AssetVisibility
}): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.asset.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!current || current.projectId !== input.projectId) {
        throw new Error("Arquivo nao encontrado")
      }

      const updatedAsset = await tx.asset.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          type: input.type,
          visibility: input.visibility,
        },
      })

      const visibilityChanged = current.visibility !== updatedAsset.visibility

      await createAuditLog(
        {
          action: visibilityChanged
            ? "asset.visibility_changed"
            : "asset.updated",
          entityType: "Asset",
          entityId: updatedAsset.id,
          projectId: input.projectId,
          summary: visibilityChanged
            ? `Visibilidade do arquivo ${updatedAsset.name} alterada em ${current.project.name}.`
            : `Arquivo ${updatedAsset.name} atualizado em ${current.project.name}.`,
          metadata: {
            before: {
              name: current.name,
              type: current.type,
              visibility: current.visibility,
            },
            after: {
              name: updatedAsset.name,
              type: updatedAsset.type,
              visibility: updatedAsset.visibility,
            },
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath(`/admin/projects/${input.projectId}/assets`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Asset Error:")
    return {
      error:
        error instanceof Error ? error.message : "Erro ao atualizar arquivo",
    }
  }
}

export async function createProjectAssetAction(data: {
  projectId: string
  name: string
  url: string
  key: string
  type: AssetType
  origin?: AssetOrigin
  visibility?: AssetVisibility
  timezone?: string
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const actor = await getCurrentAppUser()
    const isClient = actor?.role === UserRole.CLIENT

    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: data.projectId },
        select: {
          id: true,
          name: true,
          clientId: true,
        },
      })

      if (!project) {
        throw new Error("Projeto não encontrado")
      }

      const aggregation = await tx.asset.aggregate({
        where: { projectId: data.projectId },
        _max: { order: true },
      })

      const nextOrder = (aggregation._max.order ?? -1) + 1

      const asset = await tx.asset.create({
        data: {
          projectId: data.projectId,
          name: data.name,
          url: data.url,
          key: data.key,
          type: data.type,
          timezone: data.timezone || "America/Sao_Paulo",
          order: nextOrder,
          origin:
            data.origin || (isClient ? AssetOrigin.CLIENT : AssetOrigin.ADMIN),
          visibility: data.visibility || AssetVisibility.CLIENT,
        },
      })

      await createAuditLog(
        {
          action: "asset.created",
          entityType: "Asset",
          entityId: asset.id,
          summary: `Arquivo ${asset.name} enviado para ${project.name} por ${isClient ? "cliente" : "admin"}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: data.projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            type: asset.type,
            assetOrigin: asset.origin,
            visibility: asset.visibility,
            after: {
              type: asset.type,
              assetOrigin: asset.origin,
              visibility: asset.visibility,
              order: asset.order,
            },
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
              {
                type: "Asset",
                id: asset.id,
                label: asset.name,
              },
            ],
          },
        },
        tx
      )

      if (isClient) {
        const admins = await getInternalNotificationRecipients()
        await createNotificationsMany(
          admins.map((admin) => ({
            userId: admin.id,
            projectId: data.projectId,
            type: NotificationType.ASSET_UPLOADED,
            title: "Cliente enviou novo arquivo",
            message: `${actor?.name || "O cliente"} enviou "${asset.name}" para o projeto ${project.name}.`,
            ctaPath: `/admin/projects/${data.projectId}/assets`,
          })),
          tx
        )
      } else {
        await createNotification(
          {
            userId: project.clientId,
            projectId: data.projectId,
            type: NotificationType.ASSET_UPLOADED,
            title: "Novo arquivo disponível",
            message: `${asset.name} foi adicionado ao repositório do projeto ${project.name}.`,
            ctaPath: getDashboardPath(data.projectId),
          },
          tx
        )
      }
    })

    revalidatePath(`/admin/projects/${data.projectId}`)
    revalidatePath(`/admin/projects/${data.projectId}/assets`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Asset Error:")
    return {
      error:
        error instanceof Error ? error.message : "Erro ao registrar arquivo",
    }
  }
}

export async function updateProjectAssetsOrderAction(
  projectId: string,
  assetIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  if (assetIds.length === 0) return { success: true }

  try {
    await prisma.$transaction(async (tx) => {
      // Use CASE WHEN to update all orders in a single query
      const cases = assetIds
        .map((id, index) => `WHEN id = '${id}' THEN ${index}`)
        .join(" ")
      const ids = assetIds.map((id) => `'${id}'`).join(", ")

      await tx.$executeRawUnsafe(`
        UPDATE "Asset"
        SET "order" = CASE
          ${cases}
        END
        WHERE id IN (${ids}) AND "projectId" = '${projectId}'
      `)

      await createAuditLog(
        {
          action: "assets.reordered",
          entityType: "Project",
          entityId: projectId,
          projectId,
          summary: `Ordem dos arquivos redefinida.`,
          metadata: { assetIds },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${projectId}/assets`)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Assets Order Error:")
    return { error: "Erro ao atualizar ordem dos arquivos" }
  }
}
