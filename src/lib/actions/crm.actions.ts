"use server"

import { revalidatePath } from "next/cache"

import { Prisma } from "@/src/generated/client"
import {
  AuditActorType,
  LeadActivityType,
  LeadSource,
  LeadStatus,
  PaymentMethod,
  ProjectCategory,
  ProjectStatus,
  ProposalStatus,
} from "@/src/generated/client"
import { LeadActivity, LeadNote } from "@/src/types/crm"
import { addDays } from "date-fns"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  buildInitialProjectScheduleData,
  buildProjectSchedulePersistence,
  getProposalExecutionDaysFromSchedule,
  normalizeProposalScheduleData,
  proposalIncludesMaguiConnectBonus,
} from "@/src/lib/project-schedule"
import {
  createAuditLog,
  findOrCreateClientFromEmail,
  getCurrentAppUser,
} from "@/src/lib/project-governance"
import {
  revalidateCrmLead,
  revalidateCrmLeads,
  revalidateCrmPrefs,
  revalidateCrmTemplates,
  revalidateCrmViews,
  revalidateProjectData,
} from "@/src/lib/revalidate"
import { createInvoiceAction } from "@/src/lib/actions/financial.actions"

const LeadSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.OTHER),
})

const LeadNoteSchema = z.object({
  leadId: z.string().min(1),
  content: z.string().trim().min(2).max(2000),
})

const UpdateLeadSchema = LeadSchema.extend({
  id: z.string().min(1),
})

const SavedCrmViewSchema = z.object({
  name: z.string().trim().min(2).max(60),
  filters: z.record(z.string(), z.unknown()),
})

const CrmPreferencesSchema = z.object({
  density: z.enum(["comfortable", "compact"]),
})

export async function createLead(
  data: z.infer<typeof LeadSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = LeadSchema.parse(data)
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          ...validatedData,
          email: validatedData.email === "" ? null : validatedData.email,
          website: validatedData.website === "" ? null : validatedData.website,
        },
      })

      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: LeadActivityType.LEAD_EDITED,
          title: "Lead catalogado no sistema",
          content: `Lead da empresa ${lead.companyName} criado com origem ${lead.source}.`,
          authorId: actor?.id,
        },
      })
    })

    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Create Lead Error")
    return { success: false, error: "Failed to create lead" }
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      const oldLead = await tx.lead.findUnique({
        where: { id },
        select: { status: true, companyName: true },
      })

      if (!oldLead) throw new Error("Lead not found")

      await tx.lead.update({
        where: { id },
        data: {
          status,
          lastContactAt:
            status === LeadStatus.CONTATO_REALIZADO ||
            status === LeadStatus.NEGOCIACAO
              ? new Date()
              : undefined,
        },
      })

      await tx.leadActivity.create({
        data: {
          leadId: id,
          type: LeadActivityType.STATUS_CHANGED,
          title: `Status alterado para ${status}`,
          content: `Lead "${oldLead.companyName}" movido de ${oldLead.status} para ${status}.`,
          metadata: { from: oldLead.status, to: status },
          authorId: actor?.id,
        },
      })
    })

    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Lead Status Error")
    return { success: false, error: "Failed to update lead status" }
  }
}

export async function updateLead(
  data: z.infer<typeof UpdateLeadSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = UpdateLeadSchema.parse(data)
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      await tx.lead.update({
        where: { id: validatedData.id },
        data: {
          companyName: validatedData.companyName,
          contactName: validatedData.contactName || null,
          email: validatedData.email === "" ? null : validatedData.email,
          phone: validatedData.phone || null,
          website: validatedData.website === "" ? null : validatedData.website,
          instagram: validatedData.instagram || null,
          source: validatedData.source,
        },
      })

      await tx.leadActivity.create({
        data: {
          leadId: validatedData.id,
          type: LeadActivityType.LEAD_EDITED,
          title: "Informacoes do lead atualizadas",
          authorId: actor?.id,
        },
      })
    })

    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Lead Error")
    return { success: false, error: "Failed to update lead" }
  }
}

export async function deleteLead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { companyName: true },
    })

    if (!lead) return { success: false, error: "Lead not found" }

    await prisma.$transaction(async (tx) => {
      await tx.lead.delete({
        where: { id },
      })

      await createAuditLog(
        {
          action: "lead.deleted",
          entityType: "Lead",
          entityId: id,
          summary: `Lead da empresa ${lead.companyName} deletado.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          metadata: { companyName: lead.companyName },
        },
        tx
      )
    })

    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Lead Error")
    return { success: false, error: "Failed to delete lead" }
  }
}

export async function addLeadNote(
  data: z.infer<typeof LeadNoteSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")

    const validatedData = LeadNoteSchema.parse(data)
    const actor = await getCurrentAppUser()

    await prisma.$transaction(async (tx) => {
      await tx.leadNote.create({
        data: {
          leadId: validatedData.leadId,
          content: validatedData.content,
          authorId: actor?.id ?? null,
        },
      })

      await tx.lead.update({
        where: { id: validatedData.leadId },
        data: {
          lastContactAt: new Date(),
        },
      })

      await tx.leadActivity.create({
        data: {
          leadId: validatedData.leadId,
          type: LeadActivityType.NOTE_CREATED,
          title: "Nova nota de follow-up",
          content: validatedData.content,
          authorId: actor?.id,
        },
      })
    })

    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Add Lead Note Error")
    return { success: false, error: "Failed to add lead note" }
  }
}

export async function convertLeadToProjectAction(input: {
  leadId: string
  acceptedProposalId?: string
  userId?: string // If existing user
  newUserData?: {
    email: string
    name: string
    username?: string
    password?: string
  }
  projectData: {
    name: string
    category?: ProjectCategory
    budget?: string
    executionBusinessDays?: number
    paymentMethod?: "FIFTY_FIFTY" | "MONTHLY_INSTALLMENTS"
  }
}): Promise<{ success: boolean; error?: string; projectId?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      include: {
        proposals: {
          select: {
            id: true,
            title: true,
            status: true,
            scheduleData: true,
            totalValue: true,
          },
        },
      },
    })

    if (!lead) return { success: false, error: "Lead not found" }

    const trimmedProjectName = input.projectData.name.trim()
    const acceptedProposals = lead.proposals.filter(
      (proposal) => proposal.status === ProposalStatus.ACCEPTED
    )
    const hasAcceptedProposal = acceptedProposals.length > 0
    const hasAnyProposal = lead.proposals.length > 0

    if (!trimmedProjectName) {
      return { success: false, error: "Defina o nome do projeto." }
    }

    if (!lead.contactName?.trim()) {
      return {
        success: false,
        error: "Defina o contato principal do lead antes de converter.",
      }
    }

    if (!lead.email?.trim()) {
      return {
        success: false,
        error: "Defina um e-mail principal antes de converter o lead.",
      }
    }

    if (!hasAcceptedProposal) {
      return {
        success: false,
        error:
          "Converta o lead apenas a partir de uma proposta aceita vinculada.",
      }
    }

    const selectedAcceptedProposal =
      acceptedProposals.length === 1
        ? acceptedProposals[0]
        : acceptedProposals.find(
            (proposal) => proposal.id === input.acceptedProposalId
          )

    if (!selectedAcceptedProposal) {
      return {
        success: false,
        error:
          acceptedProposals.length > 1
            ? "Selecione explicitamente qual proposta aceita originara o projeto."
            : "Nao foi possivel localizar a proposta aceita vinculada.",
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentLead = await tx.lead.findUnique({
        where: { id: input.leadId },
        select: { convertedProjectId: true },
      })

      if (currentLead?.convertedProjectId) {
        return { id: currentLead.convertedProjectId }
      }

      let finalUserId = input.userId

      if (!finalUserId && input.newUserData) {
        const email = input.newUserData.email || lead.email

        if (!email) {
          throw new Error("Client email must be provided.")
        }

        const clientUser = await findOrCreateClientFromEmail(
          {
            email,
            name:
              input.newUserData.name || lead.contactName || lead.companyName,
            companyName: lead.companyName,
            username: input.newUserData.username,
            password: input.newUserData.password,
          },
          tx
        )

        finalUserId = clientUser.id

        await createAuditLog(
          {
            action: "client.created_from_lead",
            entityType: "User",
            entityId: clientUser.id,
            summary: `Cliente ${clientUser.email} sincronizado a partir do lead ${lead.companyName}.`,
            metadata: { leadId: lead.id, email: clientUser.email },
          },
          tx
        )
      }

      if (!finalUserId) throw new Error("Client must be selected.")

      const targetClient = await tx.user.findUnique({
        where: { id: finalUserId },
        select: {
          id: true,
          canAccessMaguiConnect: true,
        },
      })

      if (!targetClient) {
        throw new Error("Client not found.")
      }

      const budgetValue = selectedAcceptedProposal.totalValue
      const proposalSchedule = normalizeProposalScheduleData(
        selectedAcceptedProposal.scheduleData
      )
      const resolvedProjectCategory =
        proposalSchedule.projectCategory ?? ProjectCategory.LANDING_PAGE
      const scheduleSeed =
        input.projectData.executionBusinessDays ??
        getProposalExecutionDaysFromSchedule(selectedAcceptedProposal.scheduleData) ??
        20
      const includesMaguiConnectBonus = proposalIncludesMaguiConnectBonus(
        selectedAcceptedProposal.scheduleData
      )
      const maguiConnectBonusStatus = includesMaguiConnectBonus
        ? targetClient.canAccessMaguiConnect
          ? "RELEASED"
          : "PENDING_RELEASE"
        : "NOT_INCLUDED"
      const initialScheduleData = buildInitialProjectScheduleData({
        executionBusinessDays: scheduleSeed,
        includesMaguiConnectBonus,
        sourceProposalId: selectedAcceptedProposal.id,
        maguiConnectBonusStatus,
        exposeInPortfolio: proposalSchedule.exposeInPortfolio,
        keepFooterCredit: proposalSchedule.keepFooterCredit,
        whiteLabelFeeCents: proposalSchedule.whiteLabelFeeCents,
        annualRenewalFeeCents: proposalSchedule.annualRenewalFeeCents,
      })
      const schedulePersistence =
        buildProjectSchedulePersistence(initialScheduleData)

      const project = await tx.project.create({
        data: {
          name: input.projectData.name,
          category: resolvedProjectCategory,
          budget: budgetValue,
          paymentMethod:
            (input.projectData.paymentMethod as PaymentMethod) || "FIFTY_FIFTY",
          scheduleData: initialScheduleData,
          ...schedulePersistence,
          clientId: finalUserId,
          status: ProjectStatus.STRATEGY,
          progress: 0,
        },
      })

      await tx.proposal.update({
        where: { id: selectedAcceptedProposal.id },
        data: {
          projectId: project.id,
        },
      })

      await createAuditLog(
        {
          action: "proposal.linked_to_project",
          entityType: "Proposal",
          entityId: selectedAcceptedProposal.id,
          projectId: project.id,
          summary: `Proposta ${selectedAcceptedProposal.title} vinculada ao projeto ${project.name}.`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          metadata: {
            leadId: input.leadId,
            projectId: project.id,
            projectCategory: resolvedProjectCategory,
            executionBusinessDays: scheduleSeed,
            includesMaguiConnectBonus,
          },
        },
        tx
      )

      await tx.lead.update({
        where: { id: input.leadId },
        data: {
          status: LeadStatus.CONVERTIDO,
          convertedAt: new Date(),
          convertedProjectId: project.id,
        },
      })

      await tx.leadActivity.create({
        data: {
          leadId: input.leadId,
          type: LeadActivityType.CONVERTED_TO_PROJECT,
          title: "Lead convertido em projeto",
          content: `Projeto "${project.name}" criado com sucesso.`,
          metadata: {
            projectId: project.id,
            proposalId: selectedAcceptedProposal.id,
            proposalContext: hasAnyProposal ? "accepted" : "missing",
          },
          authorId: actor?.id,
        },
      })

      await createAuditLog(
        {
          action: "lead.converted_to_project",
          entityType: "Lead",
          entityId: input.leadId,
          projectId: project.id,
          summary: `Lead ${lead.companyName} convertido no projeto ${project.name}.`,
          metadata: {
            projectId: project.id,
            clientId: finalUserId,
            proposalId: selectedAcceptedProposal.id,
            includesMaguiConnectBonus,
          },
        },
        tx
      )

      if (includesMaguiConnectBonus) {
        await createAuditLog(
          {
            action: "magui_connect.bonus_attached_to_project",
            entityType: "Project",
            entityId: project.id,
            projectId: project.id,
            summary: `Bonus MAGUI Connect estruturado no projeto ${project.name}.`,
            actorId: actor?.id,
            actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
            metadata: {
              proposalId: selectedAcceptedProposal.id,
              clientId: finalUserId,
              status: maguiConnectBonusStatus,
              alreadyPurchased: targetClient.canAccessMaguiConnect,
            },
          },
          tx
        )
      }

      return project
    })

    const paymentMethod =
      (input.projectData.paymentMethod as PaymentMethod) || "FIFTY_FIFTY"
    const projectBudgetCents = selectedAcceptedProposal.totalValue

    if (projectBudgetCents > 0) {
      try {
        const now = new Date()
        const firstInstallmentDueDate = addDays(now, 7)
        const installments =
          paymentMethod === PaymentMethod.FIFTY_FIFTY
            ? (() => {
                const firstAmount = Math.floor(projectBudgetCents / 2)
                const secondAmount = projectBudgetCents - firstAmount

                return [
                  {
                    number: 1,
                    amount: firstAmount,
                    dueDate: firstInstallmentDueDate,
                  },
                  {
                    number: 2,
                    amount: secondAmount,
                    dueDate: addDays(firstInstallmentDueDate, 30),
                  },
                ]
              })()
            : [
                {
                  number: 1,
                  amount: projectBudgetCents,
                  dueDate: firstInstallmentDueDate,
                },
              ]

        await createInvoiceAction({
          projectId: result.id,
          kind: "PROJECT",
          title: `Pagamento Inicial - ${input.projectData.name}`,
          description: `Fatura automatica gerada a partir da conversao do lead ${lead.companyName}.`,
          totalAmount: projectBudgetCents,
          currency: "BRL",
          dueDate: installments[0].dueDate,
          installments,
          proposalId: selectedAcceptedProposal.id,
        })
      } catch (billingError) {
        logger.error(
          { billingError, leadId: input.leadId, projectId: result.id },
          "Failed to create automatic invoice during lead conversion"
        )
      }
    }

    revalidateCrmLeads()
    revalidateProjectData()

    return { success: true, projectId: result.id }
  } catch (error) {
    logger.error({ error }, "Convert Lead Error")
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert lead",
    }
  }
}

export async function saveMessageTemplateAction(data: {
  id?: string
  name: string
  content: string
  scope?: string
}): Promise<{
  success: boolean
  error?: string
  template?: {
    id: string
    scope: string
    name: string
    content: string
    createdById: string | null
    createdAt: Date
    updatedAt: Date
  }
}> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    if (data.id) {
      const template = await prisma.messageTemplate.update({
        where: { id: data.id },
        data: {
          name: data.name,
          content: data.content,
        },
      })
      revalidateCrmTemplates()
      return { success: true, template }
    } else {
      const template = await prisma.messageTemplate.create({
        data: {
          name: data.name,
          content: data.content,
          scope: data.scope || "LEAD",
          createdById: actor?.id,
        },
      })
      revalidateCrmTemplates()
      return { success: true, template }
    }
  } catch (error) {
    logger.error({ error }, "Save Template Error")
    return { success: false, error: "Failed to save template" }
  }
}

export async function deleteMessageTemplateAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    await prisma.messageTemplate.delete({ where: { id } })
    revalidateCrmLeads()
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Template Error")
    return { success: false, error: "Failed to delete template" }
  }
}

export async function getLeadActivitiesAction(leadId: string): Promise<{
  success: boolean
  error?: string
  activities?: LeadActivity[]
  notes?: LeadNote[]
}> {
  try {
    await protect("admin")

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
        followUpNotes: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!lead) return { success: false, error: "Lead not found" }

    return {
      success: true,
      activities: lead.activities.map((a) => ({
        ...a,
        metadata: (a.metadata as Record<string, unknown>) || {},
      })) as LeadActivity[],
      notes: lead.followUpNotes as LeadNote[],
    }
  } catch (error) {
    logger.error({ error }, "Get Lead Activities Error")
    return { success: false, error: "Failed to fetch activities" }
  }
}

export async function getLeadSnapshotAction(leadId: string): Promise<{
  success: boolean
  error?: string
  lead?: {
    id: string
    status: LeadStatus
    updatedAt: string
    proposalCount: number
    acceptedProposalCount: number
    acceptedProposals: Array<{
      id: string
      title: string
      totalValue: number
        executionBusinessDays: number | null
        projectCategory: ProjectCategory | null
        includesMaguiConnectBonus: boolean
    }>
    proposals: Array<{
      id: string
      title: string
      status: ProposalStatus
      totalValue: number
      createdAt: string
      validUntil: string | null
    }>
    client: {
      id: string
      name: string | null
      email: string
      companyName: string | null
      phone: string | null
      position: string | null
    } | null
  }
}> {
  try {
    await protect("admin")

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        proposals: {
          select: {
            id: true,
            title: true,
            status: true,
            totalValue: true,
            validUntil: true,
            createdAt: true,
            scheduleData: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!lead) {
      return { success: false, error: "Lead not found" }
    }

    const acceptedProposals = lead.proposals
      .filter((proposal) => proposal.status === ProposalStatus.ACCEPTED)
      .map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        totalValue: proposal.totalValue,
        projectCategory: normalizeProposalScheduleData(proposal.scheduleData)
          .projectCategory,
        executionBusinessDays: getProposalExecutionDaysFromSchedule(
          proposal.scheduleData
        ),
        includesMaguiConnectBonus: proposalIncludesMaguiConnectBonus(
          proposal.scheduleData
        ),
      }))

    const convertedProjectClient = lead.convertedProjectId
      ? await prisma.project.findUnique({
          where: { id: lead.convertedProjectId },
          select: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                phone: true,
                position: true,
              },
            },
          },
        })
      : null

    return {
      success: true,
      lead: {
        id: lead.id,
        status: lead.status,
        updatedAt: lead.updatedAt.toISOString(),
        proposalCount: lead.proposals.length,
        acceptedProposalCount: acceptedProposals.length,
        acceptedProposals,
        proposals: lead.proposals.map((proposal) => ({
          id: proposal.id,
          title: proposal.title,
          status: proposal.status,
          totalValue: proposal.totalValue,
          createdAt: proposal.createdAt.toISOString(),
          validUntil: proposal.validUntil?.toISOString() ?? null,
        })),
        client: convertedProjectClient?.client ?? null,
      },
    }
  } catch (error) {
    logger.error({ error }, "Get Lead Snapshot Error")
    return { success: false, error: "Failed to fetch lead snapshot" }
  }
}

export async function saveCrmViewAction(
  data: z.infer<typeof SavedCrmViewSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    if (!actor) return { success: false, error: "Unauthorized" }

    const validated = SavedCrmViewSchema.parse(data)

    await prisma.$transaction([
      prisma.savedView.deleteMany({
        where: {
          userId: actor.id,
          module: "CRM",
          name: validated.name,
        },
      }),
      prisma.savedView.create({
        data: {
          userId: actor.id,
          module: "CRM",
          name: validated.name,
          filtersJson: validated.filters as Prisma.InputJsonValue,
        },
      }),
    ])

    revalidateCrmViews(actor.id)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save CRM View Error")
    return { success: false, error: "Failed to save CRM view" }
  }
}

export async function deleteCrmViewAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    if (!actor) return { success: false, error: "Unauthorized" }

    await prisma.savedView.deleteMany({
      where: {
        id,
        userId: actor.id,
        module: "CRM",
      },
    })

    revalidateCrmViews(actor.id)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete CRM View Error")
    return { success: false, error: "Failed to delete CRM view" }
  }
}

export async function saveCrmPreferencesAction(
  data: z.infer<typeof CrmPreferencesSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    if (!actor) return { success: false, error: "Unauthorized" }

    const validated = CrmPreferencesSchema.parse(data)

    await prisma.$transaction([
      prisma.savedView.deleteMany({
        where: {
          userId: actor.id,
          module: "CRM_PREFERENCES",
          name: "default",
        },
      }),
      prisma.savedView.create({
        data: {
          userId: actor.id,
          module: "CRM_PREFERENCES",
          name: "default",
          filtersJson: validated as Prisma.InputJsonValue,
        },
      }),
    ])

    revalidateCrmPrefs(actor.id)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Save CRM Preferences Error")
    return { success: false, error: "Failed to save CRM preferences" }
  }
}
