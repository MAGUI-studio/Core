"use server"

import { getTranslations } from "next-intl/server"

import {
  AuditActorType,
  InstallmentStatus,
  InvoiceKind,
  NotificationType,
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
} from "@/src/generated/client"
import { addDays } from "date-fns"

import {
  cancelProjectBonusIfNeeded,
  forceCancelProjectBonus,
  forceReleaseProjectBonus,
  releaseProjectBonusIfEligible,
} from "@/src/lib/invoice-fulfillment"
import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getAuditOriginLabel,
  getCurrentAppUser,
} from "@/src/lib/project-governance"
import {
  buildInitialProjectScheduleData,
  buildProjectSchedulePersistence,
  ensureProjectRenewalSchedule,
  setProjectOperationalStatus,
} from "@/src/lib/project-schedule"
import {
  revalidateProjectData,
  revalidateProjectStatus,
} from "@/src/lib/revalidate"
import { getOrCreateStripeCustomer } from "@/src/lib/stripe-actions"
import { getInternationalizationFeeCents } from "@/src/lib/utils/project-pricing"
import { parseCurrencyBRLToCents } from "@/src/lib/utils/utils"
import {
  createProjectSchema,
  updateProjectStatusSchema,
} from "@/src/lib/validations/project"

import { createInvoiceAction } from "./financial.actions"
import { getDashboardPath } from "./project-action-utils"

export async function createProjectAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.projects.form.errors")

  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const validatedFields = createProjectSchema.safeParse({
    clientId: formData.get("clientId"),
    projectName: formData.get("projectName"),
    projectDescription: formData.get("projectDescription"),
    budget: formData.get("budget"),
    executionBusinessDays: formData.get("executionBusinessDays"),
    category: formData.get("category"),
    serviceCategoryId: formData.get("serviceCategoryId"),
    customValue: formData.get("customValue"),
    hasInternationalization: formData.get("hasInternationalization"),
    internationalizationFee: formData.get("internationalizationFee"),
    paymentMethod: formData.get("paymentMethod"),
    installments: formData.get("installments")
      ? JSON.parse(formData.get("installments") as string)
      : undefined,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message || t("validation_failed"),
    }
  }

  const data = validatedFields.data
  const actor = await getCurrentAppUser()

  try {
    const budgetCents = data.budget
      ? parseCurrencyBRLToCents(data.budget)
      : null
    const requestedI18nFee = data.internationalizationFee
      ? parseCurrencyBRLToCents(data.internationalizationFee)
      : 0
    const serviceCategory = data.serviceCategoryId
      ? await prisma.serviceCategory.findUnique({
          where: { id: data.serviceCategoryId },
          select: { name: true },
        })
      : null
    const normalizedI18nFee = data.hasInternationalization
      ? getInternationalizationFeeCents(
          serviceCategory?.name,
          Math.max((budgetCents ?? 0) - requestedI18nFee, 0)
        )
      : 0

    const executionBusinessDays = data.executionBusinessDays
      ? Number.parseInt(data.executionBusinessDays, 10)
      : null
    const scheduleData = buildInitialProjectScheduleData({
      executionBusinessDays,
    })
    const schedulePersistence = buildProjectSchedulePersistence(scheduleData)

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          name: data.projectName,
          description: data.projectDescription ?? null,
          budget: budgetCents,
          customValue: data.customValue,
          hasInternationalization: data.hasInternationalization,
          internationalizationFee: normalizedI18nFee || null,
          paymentMethod: data.paymentMethod,
          serviceCategoryId: data.serviceCategoryId || null,
          scheduleData,
          ...schedulePersistence,
          category: data.category as ProjectCategory,
          clientId: data.clientId,
          status: ProjectStatus.STRATEGY,
          progress: 0,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      const initialUpdate = await tx.update.create({
        data: {
          title: "Projeto iniciado",
          description: "Fase de estratégia iniciada com sucesso.",
          projectId: p.id,
          isMilestone: true,
          timezone: (formData.get("timezone") as string) || "America/Sao_Paulo",
        },
      })

      await tx.projectMember.create({
        data: {
          projectId: p.id,
          userId: p.client.id,
          role: ProjectMemberRole.OWNER,
        },
      })

      await tx.auditLog.create({
        data: {
          action: "project.created",
          entityType: "Project",
          entityId: p.id,
          summary: `Projeto ${p.name} criado para ${p.client.name ?? "cliente"}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: p.id,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            category: p.category,
            initialUpdateId: initialUpdate.id,
            after: {
              status: p.status,
              progress: p.progress,
              category: p.category,
              budget: p.budget,
              hasInternationalization: p.hasInternationalization,
              internationalizationFee: p.internationalizationFee,
              scheduleData,
            },
            relatedEntities: [
              {
                type: "Project",
                id: p.id,
                label: p.name,
              },
              {
                type: "Client",
                id: p.client.id,
                label: p.client.name ?? "Cliente",
              },
              {
                type: "Update",
                id: initialUpdate.id,
                label: initialUpdate.title,
              },
            ],
          },
        },
      })

      await tx.notification.create({
        data: {
          userId: data.clientId,
          projectId: p.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Novo projeto liberado no painel",
          message: `O projeto ${p.name} já está disponível para acompanhamento.`,
          ctaPath: getDashboardPath(p.id),
        },
      })

      return p
    })

    // Ensure Stripe customer exists for future billing
    try {
      await getOrCreateStripeCustomer(data.clientId)
    } catch (stripeError) {
      logger.error({ stripeError }, "Failed to ensure Stripe customer")
    }

    // AUTO-BILLING: If installments exist or budget exists
    const installmentsData = data.installments
    const budgetAmountCents = parseCurrencyBRLToCents(data.budget || "")

    if (installmentsData && installmentsData.length > 0) {
      try {
        const totalAmount = installmentsData.reduce(
          (sum, inst) => sum + inst.amount,
          0
        )
        await createInvoiceAction({
          projectId: project.id,
          kind: InvoiceKind.PROJECT,
          title: `Pagamento Inicial - ${project.name}`,
          description: `Fatura automática gerada para o projeto ${project.name}.`,
          totalAmount: totalAmount,
          currency: "BRL",
          dueDate: new Date(installmentsData[0].dueDate),
          installments: installmentsData.map((inst) => ({
            number: inst.number,
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
          })),
        })
      } catch (billingError) {
        logger.error(
          { billingError },
          "Failed to create dynamic initial invoice"
        )
      }
    } else if (!isNaN(budgetAmountCents) && budgetAmountCents > 0) {
      try {
        await createInvoiceAction({
          projectId: project.id,
          kind: InvoiceKind.PROJECT,
          title: `Pagamento Inicial - ${project.name}`,
          description: `Fatura automática gerada para o projeto ${project.name}.`,
          totalAmount: budgetAmountCents,
          currency: "BRL",
          dueDate: addDays(new Date(), 7),
          installments: [
            {
              number: 1,
              amount: budgetAmountCents,
              dueDate: addDays(new Date(), 7),
            },
          ],
        })
      } catch (billingError) {
        logger.error(
          { billingError },
          "Failed to create automatic initial invoice"
        )
      }
    }

    revalidateProjectData()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Project Error:")
    const message =
      error instanceof Error ? error.message : "Erro ao criar o projeto"
    return { error: message }
  }
}

export async function updateProjectStatusAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const validatedFields = updateProjectStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    progress: Number(formData.get("progress")),
    liveUrl: formData.get("liveUrl"),
    repositoryUrl: formData.get("repositoryUrl"),
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]?.message ?? "Dados inválidos"
    return { error }
  }

  const { id, status, progress, liveUrl, repositoryUrl } = validatedFields.data
  const actor = await getCurrentAppUser()

  try {
    await prisma.$transaction(async (tx) => {
      if (status === ProjectStatus.LAUNCHED) {
        const openInstallments = await tx.installment.count({
          where: {
            invoice: {
              projectId: id,
              kind: InvoiceKind.PROJECT,
              status: { not: "CANCELLED" },
            },
            status: {
              notIn: [InstallmentStatus.PAID, InstallmentStatus.WAIVED],
            },
          },
        })

        if (openInstallments > 0) {
          throw new Error(
            "Publicação bloqueada: quite a parcela final antes de marcar o projeto como lançado."
          )
        }
      }

      const previousProject = await tx.project.findUnique({
        where: { id },
        select: {
          status: true,
          progress: true,
          liveUrl: true,
          repositoryUrl: true,
          scheduleData: true,
        },
      })

      const nextScheduleData = setProjectOperationalStatus(
        previousProject?.scheduleData,
        status as ProjectStatus
      )
      const launchAwareScheduleData =
        status === ProjectStatus.LAUNCHED
          ? ensureProjectRenewalSchedule(nextScheduleData)
          : nextScheduleData
      const schedulePersistence = buildProjectSchedulePersistence(
        launchAwareScheduleData,
        status as ProjectStatus
      )

      const project = await tx.project.update({
        where: { id },
        data: {
          status: status as ProjectStatus,
          progress,
          liveUrl: liveUrl || null,
          repositoryUrl: repositoryUrl || null,
          scheduleData: launchAwareScheduleData,
          ...schedulePersistence,
        },
        include: {
          client: {
            select: {
              id: true,
            },
          },
        },
      })

      await tx.auditLog.create({
        data: {
          action: "project.status_updated",
          entityType: "Project",
          entityId: project.id,
          summary: `Status do projeto ${project.name} atualizado para ${status}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: project.id,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            before: previousProject
              ? {
                  status: previousProject.status,
                  progress: previousProject.progress,
                }
              : null,
            after: {
              status,
              progress,
            },
            relatedEntities: [
              {
                type: "Project",
                id: project.id,
                label: project.name,
              },
            ],
          },
        },
      })

      await tx.notification.create({
        data: {
          userId: project.client.id,
          projectId: project.id,
          type: NotificationType.PROJECT_STATUS_CHANGED,
          title: "Status do projeto atualizado",
          message: `${project.name} avançou para ${status} com ${progress}% de progresso.`,
          ctaPath: getDashboardPath(project.id),
        },
      })

      if (status === ProjectStatus.LAUNCHED) {
        const renewalSchedule = ensureProjectRenewalSchedule(
          previousProject?.scheduleData
        )
        const domainRenewalDueAt = renewalSchedule.domainRenewalDueAt
          ? new Date(renewalSchedule.domainRenewalDueAt)
          : null
        const hostingRenewalDueAt = renewalSchedule.hostingRenewalDueAt
          ? new Date(renewalSchedule.hostingRenewalDueAt)
          : null

        const renewalTasks = [
          domainRenewalDueAt
            ? {
                title: "Cobrar renovacao de dominio",
                description:
                  "Confirmar pagamento e continuidade do dominio apos o primeiro ciclo anual.",
                dueDate: domainRenewalDueAt,
              }
            : null,
          hostingRenewalDueAt
            ? {
                title: "Cobrar taxa anual de permanencia",
                description:
                  "Formalizar renovacao de hospedagem/manutencao apos o primeiro ciclo anual.",
                dueDate: hostingRenewalDueAt,
              }
            : null,
        ].filter(Boolean) as Array<{
          title: string
          description: string
          dueDate: Date
        }>

        for (const task of renewalTasks) {
          const exists = await tx.actionItem.findFirst({
            where: {
              projectId: project.id,
              title: task.title,
            },
            select: { id: true },
          })

          if (!exists) {
            await tx.actionItem.create({
              data: {
                projectId: project.id,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                targetRole: "ADMIN",
                ctaPath: `/admin/projects/${project.id}/financial`,
              },
            })
          }
        }

        await releaseProjectBonusIfEligible(tx, project.id)
      }

      if (status === ProjectStatus.ABANDONED) {
        await cancelProjectBonusIfNeeded(tx, project.id)
      }
    })

    revalidateProjectStatus(id)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Project Error:")
    return { error: "Erro ao atualizar o projeto" }
  }
}

export async function deleteProjectAction(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    const actor = await getCurrentAppUser()
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    })

    if (!project) {
      return { error: "Projeto não encontrado" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          action: "project.deleted",
          entityType: "Project",
          entityId: id,
          summary: `Projeto ${project.name} deletado.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          metadata: {
            origin: getAuditOriginLabel({
              actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
              role: actor?.role,
            }),
            projectName: project.name,
          },
        },
      })
    })

    revalidateProjectData()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Project Error:")
    return { error: "Erro ao deletar o projeto" }
  }
}

export async function releaseProjectBonusManuallyAction(
  projectId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const actor = await getCurrentAppUser()

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        client: {
          select: {
            id: true,
            clerkId: true,
          },
        },
      },
    })

    if (!project?.client) {
      return { error: "Projeto não encontrado" }
    }

    const released = await prisma.$transaction((tx) =>
      forceReleaseProjectBonus(tx, projectId, actor?.id)
    )

    if (!released) {
      return { error: "O bônus não está em um estado liberável manualmente." }
    }

    revalidateProjectData(projectId)
    revalidateProjectStatus(projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Manual Project Bonus Release Error:")
    return { error: "Erro ao liberar o bônus manualmente" }
  }
}

export async function cancelProjectBonusManuallyAction(
  projectId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await protect("admin")
  } catch {
    return { error: "Unauthorized" }
  }

  const actor = await getCurrentAppUser()

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
      },
    })

    if (!project) {
      return { error: "Projeto não encontrado" }
    }

    const cancelled = await prisma.$transaction((tx) =>
      forceCancelProjectBonus(tx, projectId, actor?.id)
    )

    if (!cancelled) {
      return { error: "O bônus não está em um estado cancelável manualmente." }
    }

    revalidateProjectData(projectId)
    revalidateProjectStatus(projectId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Manual Project Bonus Cancel Error:")
    return { error: "Erro ao cancelar o bônus manualmente" }
  }
}
