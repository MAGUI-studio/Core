"use server"

import {
  AuditActorType,
  Prisma,
  ProjectCategory,
  ProposalStatus,
} from "@/src/generated/client"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"
import { buildProposalScheduleData } from "@/src/lib/project-schedule"
import { revalidateCrmLead } from "@/src/lib/revalidate"

function convertReaisToCents(value: number) {
  return Math.round(value * 100)
}

const CreateProposalSchema = z.object({
  leadId: z.string(),
  title: z.string(),
  currency: z.string().default("BRL"),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  projectCategory: z.nativeEnum(ProjectCategory).optional(),
  executionBusinessDays: z.number().int().positive().optional(),
  includesMaguiConnectBonus: z.boolean().optional(),
  exposeInPortfolio: z.boolean().optional(),
  keepFooterCredit: z.boolean().optional(),
  whiteLabelFeeCents: z.number().int().nonnegative().optional(),
  annualRenewalFeeCents: z.number().int().nonnegative().optional(),
  items: z.array(
    z.object({
      description: z.string(),
      longDescription: z.string().optional(),
      unitValue: z.number(),
      quantity: z.number(),
      order: z.number(),
    })
  ),
})

export async function createProposalAction(
  data: z.infer<typeof CreateProposalSchema>
) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()
    const validated = CreateProposalSchema.parse(data)
    const itemsInCents = validated.items.map((item) => ({
      ...item,
      unitValue: convertReaisToCents(item.unitValue),
    }))

    const totalValue = itemsInCents.reduce(
      (acc, item) => acc + item.unitValue * item.quantity,
      0
    )

    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          leadId: validated.leadId,
          title: validated.title,
          currency: validated.currency,
          validUntil: validated.validUntil
            ? new Date(validated.validUntil)
            : null,
          totalValue,
          notes: validated.notes,
          scheduleData: buildProposalScheduleData({
            projectCategory: validated.projectCategory ?? null,
            executionBusinessDays: validated.executionBusinessDays ?? null,
            includesMaguiConnectBonus:
              validated.includesMaguiConnectBonus ?? false,
            exposeInPortfolio: validated.exposeInPortfolio ?? true,
            keepFooterCredit: validated.keepFooterCredit ?? true,
            whiteLabelFeeCents: validated.whiteLabelFeeCents ?? 20_000,
            annualRenewalFeeCents: validated.annualRenewalFeeCents ?? 29_700,
          }),
          items: {
            create: itemsInCents.map((item) => ({
              description: item.description,
              longDescription: item.longDescription,
              unitValue: item.unitValue,
              quantity: item.quantity,
              order: item.order,
            })),
          },
        },
        include: {
          lead: { select: { companyName: true } },
        },
      })

      await createAuditLog(
        {
          action: "proposal.created",
          entityType: "Proposal",
          entityId: proposal.id,
          summary: `Nova proposta "${proposal.title}" criada para ${proposal.lead.companyName}.`,
          actorId: actor?.id,
          projectId: null,
          metadata: {
            totalValue,
            projectCategory: validated.projectCategory ?? null,
            executionBusinessDays: validated.executionBusinessDays ?? null,
            includesMaguiConnectBonus:
              validated.includesMaguiConnectBonus ?? false,
            exposeInPortfolio: validated.exposeInPortfolio ?? true,
            keepFooterCredit: validated.keepFooterCredit ?? true,
            whiteLabelFeeCents: validated.whiteLabelFeeCents ?? 20_000,
            annualRenewalFeeCents: validated.annualRenewalFeeCents ?? 29_700,
          },
        },
        tx
      )

      if (validated.includesMaguiConnectBonus) {
        await createAuditLog(
          {
            action: "magui_connect.bonus_marked_on_proposal",
            entityType: "Proposal",
            entityId: proposal.id,
            summary: `Bonus MAGUI Connect marcado na proposta "${proposal.title}".`,
            actorId: actor?.id,
            projectId: null,
            metadata: {
              leadId: validated.leadId,
              executionBusinessDays: validated.executionBusinessDays ?? null,
            },
          },
          tx
        )
      }

      return proposal
    })

    revalidateCrmLead(validated.leadId)
    return { success: true, proposal: result }
  } catch (error) {
    logger.error({ error }, "Create Proposal Action Error")
    return { success: false, error: "Falha ao criar proposta comercial" }
  }
}

export async function updateProposalStatusAction(
  id: string,
  status: ProposalStatus
) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status },
    })

    await createAuditLog({
      action: "proposal.status_updated",
      entityType: "Proposal",
      entityId: id,
      summary: `Status da proposta "${proposal.title}" alterado para ${status}.`,
      actorId: actor?.id,
      metadata: { status },
    })

    revalidateCrmLead(proposal.leadId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Update Proposal Status Error")
    return { success: false, error: "Falha ao atualizar status da proposta" }
  }
}

export async function acceptProposalAction(id: string, ip: string) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { id: true, leadId: true, title: true },
    })

    if (!proposal) throw new Error("Proposal not found")

    await prisma.proposal.update({
      where: { id },
      data: {
        status: ProposalStatus.ACCEPTED,
        acceptedAt: new Date(),
        acceptedIp: ip,
      },
    })

    await createAuditLog({
      action: "proposal.accepted",
      entityType: "Proposal",
      entityId: id,
      summary: `Proposta "${proposal.title}" aceita digitalmente via IP ${ip}.`,
      actorType: AuditActorType.SYSTEM,
      metadata: { ip },
    })

    revalidateCrmLead(proposal.leadId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Accept Proposal Error")
    return { success: false, error: "Falha ao aceitar proposta" }
  }
}

export async function duplicateProposalAction(id: string) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const original = await prisma.proposal.findUnique({
      where: { id },
      include: {
        items: true,
        lead: { select: { companyName: true } },
      },
    })

    if (!original) throw new Error("Proposal not found")

    const result = await prisma.$transaction(async (tx) => {
      const duplicated = await tx.proposal.create({
        data: {
          leadId: original.leadId,
          title: `${original.title} (Cópia)`,
          status: ProposalStatus.DRAFT,
          validUntil: original.validUntil,
          totalValue: original.totalValue,
          currency: original.currency,
          notes: original.notes,
          scheduleData: (original.scheduleData ?? {}) as Prisma.InputJsonValue,
          items: {
            create: original.items.map((item) => ({
              description: item.description,
              longDescription: item.longDescription,
              unitValue: item.unitValue,
              quantity: item.quantity,
              order: item.order,
            })),
          },
        },
        include: {
          lead: { select: { companyName: true } },
        },
      })

      await createAuditLog(
        {
          action: "proposal.duplicated",
          entityType: "Proposal",
          entityId: duplicated.id,
          summary: `Proposta "${original.title}" duplicada para ${original.lead.companyName}.`,
          actorId: actor?.id,
          projectId: null,
          metadata: { originalId: id, totalValue: duplicated.totalValue },
        },
        tx
      )

      return duplicated
    })

    revalidateCrmLead(original.leadId)
    return { success: true, proposal: result }
  } catch (error) {
    logger.error({ error }, "Duplicate Proposal Error")
    return { success: false, error: "Falha ao duplicar proposta" }
  }
}

export async function deleteProposalAction(id: string) {
  try {
    await protect("admin")

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { leadId: true },
    })

    if (!proposal) throw new Error("Proposal not found")

    await prisma.proposal.delete({
      where: { id },
    })

    revalidateCrmLead(proposal.leadId)
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Proposal Error")
    return { success: false, error: "Falha ao excluir proposta" }
  }
}

export async function getLeadProposalsAction(leadId: string) {
  try {
    await protect("admin")
    const proposals = await prisma.proposal.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, proposals }
  } catch (error) {
    logger.error({ error }, "Get Lead Proposals Action Error")
    return {
      success: false,
      error: "Falha ao carregar propostas do lead",
      proposals: [],
    }
  }
}

export async function getProposalsAction() {
  try {
    await protect("admin")
    const proposals = await prisma.proposal.findMany({
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, proposals }
  } catch (error) {
    logger.error({ error }, "Get Proposals Action Error")
    return {
      success: false,
      error: "Falha ao carregar propostas",
      proposals: [],
    }
  }
}
