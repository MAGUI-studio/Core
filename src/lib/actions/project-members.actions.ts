"use server"

import { revalidatePath } from "next/cache"

import {
  AuditActorType,
  ProjectMemberRole,
  UserRole,
} from "@/src/generated/client"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  getAuditOriginLabel,
  getCurrentAppUser,
} from "@/src/lib/project-governance"

export async function addProjectMemberAction(input: {
  projectId: string
  userId: string
  role?: ProjectMemberRole
}): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      const [project, user] = await Promise.all([
        tx.project.findUnique({
          where: { id: input.projectId },
          select: {
            id: true,
            name: true,
            clientId: true,
          },
        }),
        tx.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        }),
      ])

      if (!project) {
        throw new Error("Projeto não encontrado")
      }

      if (!user || user.role !== UserRole.CLIENT) {
        throw new Error("Selecione um cliente válido")
      }

      const role =
        project.clientId === user.id ? ProjectMemberRole.OWNER : input.role

      await tx.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
        update: {
          role: role ?? ProjectMemberRole.COLLABORATOR,
        },
        create: {
          projectId: input.projectId,
          userId: input.userId,
          role: role ?? ProjectMemberRole.COLLABORATOR,
        },
      })

      await createAuditLog(
        {
          action: "project.member_added",
          entityType: "ProjectMember",
          entityId: input.userId,
          summary: `${user.name ?? user.email} adicionado ao projeto ${project.name}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: input.projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            after: {
              role: role ?? ProjectMemberRole.COLLABORATOR,
              userId: user.id,
              email: user.email,
            },
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
              {
                type: "User",
                id: user.id,
                label: user.name ?? user.email,
              },
            ],
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Project Member Error")
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar colaborador",
    }
  }
}

export async function removeProjectMemberAction(input: {
  projectId: string
  userId: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      const membership = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!membership) {
        throw new Error("Colaborador não encontrado")
      }

      if (membership.project.clientId === input.userId) {
        throw new Error("O cliente principal não pode ser removido por aqui")
      }

      await tx.projectMember.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      })

      await createAuditLog(
        {
          action: "project.member_removed",
          entityType: "ProjectMember",
          entityId: input.userId,
          summary: `${membership.user.name ?? membership.user.email} removido do projeto ${membership.project.name}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: input.projectId,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            before: {
              role: membership.role,
              userId: membership.user.id,
              email: membership.user.email,
            },
            relatedEntities: [
              {
                type: "Project",
                id: membership.project.id,
                label: membership.project.name,
              },
              {
                type: "User",
                id: membership.user.id,
                label: membership.user.name ?? membership.user.email,
              },
            ],
          },
        },
        tx
      )
    })

    revalidatePath(`/admin/projects/${input.projectId}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Remove Project Member Error")
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao remover colaborador",
    }
  }
}
