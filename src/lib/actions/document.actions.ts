"use server"

import { AuditActorType, DocumentType } from "@/src/generated/client"
import { z } from "zod"

import {
  buildContractText,
  formatCurrencyBRL,
  parseProposalNotes,
  type ContractDynamicFormData,
} from "@/src/lib/contracts/contract-generation"
import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  getExecutionDaysLabel,
  normalizeProposalScheduleData,
  proposalIncludesMaguiConnectBonus,
} from "@/src/lib/project-schedule"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"
import {
  formatCurrencyBRL as formatCurrencyBRLInput,
  formatCurrencyBRLFromCents,
} from "@/src/lib/utils/utils"

type ContractClauseSeed = {
  title: string
  content: string
}

const ContractGenerationSchema = z
  .object({
    proposalId: z.string(),
    contractingPartyType: z.enum(["INDIVIDUAL", "COMPANY"]),
    contractingLegalName: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string()
    ),
    contractingDocumentNumber: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().min(1, "Informe o CPF do responsável.")
    ),
    contractingAddress: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().min(1, "Informe o endereço.")
    ),
    contractingCityState: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().min(1, "Informe cidade e estado.")
    ),
    contractingSignerName: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().min(1, "Informe o nome completo do dono.")
    ),
    renewalValue: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().min(1, "Informe o valor de renovação.")
    ),
  })
  .superRefine((data, ctx) => {
    if (
      data.contractingPartyType === "COMPANY" &&
      data.contractingLegalName.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractingLegalName"],
        message: "Informe o nome da empresa.",
      })
    }
  })

function buildAddressFromBillingProfile(profile?: {
  addressStreet?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  addressDistrict?: string | null
} | null) {
  if (!profile) return ""

  const firstLine = [
    profile.addressStreet,
    profile.addressDistrict,
    profile.addressNumber ? `Nº ${profile.addressNumber}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  const secondLine = [profile.addressComplement].filter(Boolean).join(", ")

  return [firstLine, secondLine].filter(Boolean).join(", ")
}

function buildCityStateFromBillingProfile(profile?: {
  addressCity?: string | null
  addressState?: string | null
} | null) {
  if (!profile) return ""
  return [profile.addressCity, profile.addressState].filter(Boolean).join("/")
}

function buildExactContractClauses(content: string): ContractClauseSeed[] {
  return [
    {
      title: "EXACT_CONTRACT_TEXT",
      content,
    },
  ]
}

async function getProposalContractSource(proposalId: string) {
  return prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
      lead: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
        },
      },
      project: {
        select: {
          id: true,
          clientId: true,
          client: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
              taxId: true,
              billingProfile: {
                select: {
                  legalName: true,
                  tradeName: true,
                  taxId: true,
                  billingEmail: true,
                  billingPhone: true,
                  addressStreet: true,
                  addressNumber: true,
                  addressComplement: true,
                  addressDistrict: true,
                  addressCity: true,
                  addressState: true,
                  addressZipCode: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getProposalContractPrefillAction(proposalId: string) {
  try {
    await protect("admin")

    const proposal = await getProposalContractSource(proposalId)

    if (!proposal) {
      return { success: false, error: "Proposta não encontrada." }
    }

    const existing = await prisma.document.findFirst({
      where: {
        type: DocumentType.CONTRACT,
        sourceLeadId: proposal.leadId,
        title: `Contrato de Prestação de Serviços - ${proposal.title}`,
      },
      select: {
        contractingData: true,
        commercialData: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const client = proposal.project?.client
    const billingProfile = client?.billingProfile
    const existingContracting =
      existing?.contractingData && typeof existing.contractingData === "object"
        ? (existing.contractingData as Record<string, unknown>)
        : null
    const existingCommercial =
      existing?.commercialData && typeof existing.commercialData === "object"
        ? (existing.commercialData as Record<string, unknown>)
        : null

    const proposalSchedule = normalizeProposalScheduleData(proposal.scheduleData)
    const renewalValueFallback = proposalSchedule.annualRenewalFeeCents
      ? formatCurrencyBRL(
          proposalSchedule.annualRenewalFeeCents / 100,
          proposal.currency
        )
      : ""

    const prefill = {
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      companyName: proposal.lead.companyName,
      contractingPartyType:
        String(existingContracting?.partyType ?? "") === "INDIVIDUAL"
          ? "INDIVIDUAL"
          : "COMPANY",
      contractingLegalName:
        String(existingContracting?.legalName ?? "") ||
        billingProfile?.legalName ||
        client?.companyName ||
        proposal.lead.companyName,
      contractingDocumentNumber:
        String(existingContracting?.documentNumber ?? "") ||
        billingProfile?.taxId ||
        client?.taxId ||
        "",
      contractingAddress:
        String(existingContracting?.address ?? "") ||
        buildAddressFromBillingProfile(billingProfile),
      contractingCityState:
        String(existingContracting?.cityState ?? "") ||
        buildCityStateFromBillingProfile(billingProfile),
      contractingSignerName:
        String(existingContracting?.signerName ?? "") ||
        client?.name ||
        proposal.lead.contactName ||
        "",
      renewalValue: (() => {
        const value =
          String(existingCommercial?.renewalValue ?? "") || renewalValueFallback
        return value ? formatCurrencyBRLInput(value) : ""
      })(),
      totalValueLabel: formatCurrencyBRLFromCents(proposal.totalValue),
      timelinePreview: proposalSchedule.executionBusinessDays
        ? getExecutionDaysLabel(proposalSchedule.executionBusinessDays)
        : "Prazo nao definido",
    }

    return { success: true, prefill }
  } catch (error) {
    logger.error({ error }, "Get Proposal Contract Prefill Error")
    return {
      success: false,
      error: "Falha ao carregar os dados do contrato.",
    }
  }
}

export async function createContractFromProposalAction(
  rawData: z.infer<typeof ContractGenerationSchema>
) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()
    const data = ContractGenerationSchema.parse(rawData)

    const proposal = await getProposalContractSource(data.proposalId)

    if (!proposal) {
      return { success: false, error: "Proposta não encontrada." }
    }

    const existing = await prisma.document.findFirst({
      where: {
        type: DocumentType.CONTRACT,
        sourceLeadId: proposal.leadId,
        title: `Contrato de Prestação de Serviços - ${proposal.title}`,
      },
      select: {
        id: true,
        versions: {
          select: { versionNumber: true },
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formData: ContractDynamicFormData = {
      contractingPartyType: data.contractingPartyType,
      contractingLegalName: data.contractingLegalName,
      contractingDocumentNumber: data.contractingDocumentNumber,
      contractingAddress: data.contractingAddress,
      contractingCityState: data.contractingCityState,
      contractingSignerName: data.contractingSignerName,
      renewalValue: data.renewalValue,
    }

    const contractText = buildContractText({
      proposal: {
        title: proposal.title,
        totalValue: proposal.totalValue,
        currency: proposal.currency,
        notes: proposal.notes,
        scheduleData: proposal.scheduleData,
        items: proposal.items,
      },
      form: formData,
    })

    const clauses = buildExactContractClauses(contractText)
    const parsedNotes = parseProposalNotes(proposal.notes)

    const contractedData = {
      legalName: "GUILHERME BUSTAMANTE",
      tradeName: "MAGUI.studio",
      city: "São José dos Campos",
      state: "SP",
    }

    const contractingData = {
      partyType: data.contractingPartyType,
      legalName: data.contractingLegalName,
      documentType: "CPF",
      documentNumber: data.contractingDocumentNumber,
      address: data.contractingAddress,
      cityState: data.contractingCityState,
      signerName: data.contractingSignerName,
      email: proposal.project?.client?.email ?? proposal.lead.email ?? null,
      phone: proposal.project?.client?.phone ?? proposal.lead.phone ?? null,
    }

    const commercialData = {
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      totalValue: proposal.totalValue,
      currency: proposal.currency,
      paymentTerms: parsedNotes.paymentTerms,
      timeline: parsedNotes.timeline,
      executionBusinessDays:
        normalizeProposalScheduleData(proposal.scheduleData).executionBusinessDays,
      includesMaguiConnectBonus: proposalIncludesMaguiConnectBonus(
        proposal.scheduleData
      ),
      exposeInPortfolio: normalizeProposalScheduleData(proposal.scheduleData)
        .exposeInPortfolio,
      keepFooterCredit: normalizeProposalScheduleData(proposal.scheduleData)
        .keepFooterCredit,
      whiteLabelFeeCents: normalizeProposalScheduleData(proposal.scheduleData)
        .whiteLabelFeeCents,
      annualRenewalFeeCents:
        normalizeProposalScheduleData(proposal.scheduleData)
          .annualRenewalFeeCents,
      renewalValue: data.renewalValue,
      contractDate: new Date().toISOString(),
    }

    const nextVersionNumber = (existing?.versions[0]?.versionNumber ?? 0) + 1

    const result = await prisma.$transaction(async (tx) => {
      const document = existing
        ? await tx.document.update({
            where: { id: existing.id },
            data: {
              clientId: proposal.project?.clientId ?? null,
              projectId: proposal.project?.id ?? null,
              contractedData,
              contractingData,
              commercialData,
              clauses: {
                deleteMany: {},
                create: clauses.map((clause, index) => ({
                  order: index,
                  title: clause.title,
                  content: clause.content,
                })),
              },
              versions: {
                create: {
                  versionNumber: nextVersionNumber,
                  createdById: actor?.id ?? null,
                  contentSnapshot: {
                    clauses,
                    contractedData,
                    contractingData,
                    commercialData,
                  },
                },
              },
            },
          })
        : await tx.document.create({
            data: {
              type: DocumentType.CONTRACT,
              title: `Contrato de Prestação de Serviços - ${proposal.title}`,
              sourceLeadId: proposal.leadId,
              clientId: proposal.project?.clientId ?? null,
              projectId: proposal.project?.id ?? null,
              contractedData,
              contractingData,
              commercialData,
              clauses: {
                create: clauses.map((clause, index) => ({
                  order: index,
                  title: clause.title,
                  content: clause.content,
                })),
              },
              versions: {
                create: {
                  versionNumber: nextVersionNumber,
                  createdById: actor?.id ?? null,
                  contentSnapshot: {
                    clauses,
                    contractedData,
                    contractingData,
                    commercialData,
                  },
                },
              },
            },
          })

      await createAuditLog(
        {
          action: "document.contract_created",
          entityType: "Document",
          entityId: document.id,
          summary: `Contrato gerado a partir da proposta "${proposal.title}".`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: proposal.project?.id ?? null,
          metadata: {
            proposalId: proposal.id,
            leadId: proposal.leadId,
            regenerated: Boolean(existing),
          },
        },
        tx
      )

      return document
    })

    return {
      success: true,
      documentId: result.id,
      reused: Boolean(existing),
      regenerated: Boolean(existing),
    }
  } catch (error) {
    logger.error({ error }, "Create Contract From Proposal Error")
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Dados inválidos.",
      }
    }

    return { success: false, error: "Falha ao gerar contrato." }
  }
}
