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
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
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

const LeadSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  notes: z.string().optional(),
  value: z.string().optional(),
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
          notes: validatedData.notes || null,
          value: validatedData.value || null,
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
  userId?: string // If existing user
  newUserData?: {
    email: string
    name: string
    password?: string
  }
  projectData: {
    name: string
    category: ProjectCategory
    budget?: string
    deadline?: string
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
          select: { status: true },
        },
      },
    })

    if (!lead) return { success: false, error: "Lead not found" }

    const trimmedProjectName = input.projectData.name.trim()
    const hasAcceptedProposal = lead.proposals.some(
      (proposal) => proposal.status === ProposalStatus.ACCEPTED
    )
    const hasAnyProposal = lead.proposals.length > 0
    const budgetStr = input.projectData.budget || lead.value

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

    if (!input.projectData.category) {
      return { success: false, error: "Selecione a categoria do projeto." }
    }

    if (!budgetStr && !hasAcceptedProposal) {
      return {
        success: false,
        error:
          "Informe um valor estimado ou vincule uma proposta aceita antes de converter.",
      }
    }

    const result = await prisma.$transaction(async (tx) => {
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

      const budgetValue = budgetStr
        ? parseFloat(budgetStr.replace(/[^\d.,]/g, "").replace(",", "."))
        : null

      const project = await tx.project.create({
        data: {
          name: input.projectData.name,
          category: input.projectData.category || ProjectCategory.LANDING_PAGE,
          budget: budgetValue,
          paymentMethod:
            (input.projectData.paymentMethod as PaymentMethod) || "FIFTY_FIFTY",
          deadline: input.projectData.deadline
            ? new Date(input.projectData.deadline)
            : null,
          clientId: finalUserId,
          status: ProjectStatus.STRATEGY,
          progress: 0,
          description: lead.notes,
        },
      })

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
            convertedWithoutAcceptedProposal: !hasAcceptedProposal,
            proposalContext: hasAnyProposal ? "existing" : "missing",
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
          metadata: { projectId: project.id, clientId: finalUserId },
        },
        tx
      )

      return project
    })

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
