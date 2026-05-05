"use server"

import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

const ProposalBlockSchema = z.object({
  category: z.string(),
  title: z.string(),
  content: z.string(),
})

export async function createProposalBlockAction(
  data: z.infer<typeof ProposalBlockSchema>
) {
  try {
    await protect("admin")
    const validated = ProposalBlockSchema.parse(data)

    const block = await prisma.proposalBlock.create({
      data: validated,
    })

    return { success: true, block }
  } catch (error) {
    logger.error({ error }, "Create Proposal Block Error")
    return { success: false, error: "Falha ao criar bloco comercial" }
  }
}

export async function getProposalBlocksAction(category?: string) {
  try {
    await protect("admin")
    const blocks = await prisma.proposalBlock.findMany({
      where: category ? { category } : undefined,
      orderBy: { title: "asc" },
    })

    return { success: true, blocks }
  } catch (error) {
    logger.error({ error }, "Get Proposals Action Error")
    return { success: false, error: "Falha ao carregar blocos comerciais" }
  }
}

export async function updateProposalBlockAction(
  id: string,
  data: Partial<z.infer<typeof ProposalBlockSchema>>
) {
  try {
    await protect("admin")
    const block = await prisma.proposalBlock.update({
      where: { id },
      data,
    })

    return { success: true, block }
  } catch (error) {
    logger.error({ error }, "Update Proposal Block Error")
    return { success: false, error: "Falha ao atualizar bloco comercial" }
  }
}

export async function deleteProposalBlockAction(id: string) {
  try {
    await protect("admin")
    await prisma.proposalBlock.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    logger.error({ error }, "Delete Proposal Block Error")
    return { success: false, error: "Falha ao excluir bloco comercial" }
  }
}
