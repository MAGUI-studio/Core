import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"
import pg from "pg"

import {
  type Prisma,
  PrismaClient,
  ProjectStatus,
} from "../src/generated/client/index.js"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run this backfill.")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new pg.Pool({
      connectionString,
    })
  ),
})

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {}
}

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    if (value === "true") return true
    if (value === "false") return false
  }

  return fallback
}

function detectBonusFromNotes(notes?: string | null) {
  if (!notes) return false

  const normalized = notes
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

  return (
    normalized.includes("magui connect") &&
    (normalized.includes("gratuit") ||
      normalized.includes("r$ 0,00") ||
      normalized.includes("sem custo") ||
      normalized.includes("bonus"))
  )
}

function resolveBonusStatus(input: {
  includesBonus: boolean
  currentStatus: unknown
  projectStatus?: ProjectStatus
  clientAlreadyHasAccess?: boolean
}) {
  if (!input.includesBonus) return "NOT_INCLUDED"

  if (input.currentStatus === "RELEASED" || input.clientAlreadyHasAccess) {
    return "RELEASED"
  }

  if (
    input.currentStatus === "CANCELLED" ||
    input.projectStatus === ProjectStatus.ABANDONED
  ) {
    return "CANCELLED"
  }

  return "PENDING_RELEASE"
}

async function run() {
  console.log("Starting MAGUI Connect bonus backfill...")

  const proposals = await prisma.proposal.findMany({
    select: {
      id: true,
      title: true,
      notes: true,
      scheduleData: true,
      projectId: true,
      project: {
        select: {
          id: true,
          status: true,
          scheduleData: true,
          client: {
            select: {
              canAccessMaguiConnect: true,
            },
          },
        },
      },
    },
  })

  let updatedProposals = 0
  let updatedProjects = 0
  let skipped = 0

  for (const proposal of proposals) {
    const bonusDetected = detectBonusFromNotes(proposal.notes)
    const proposalSchedule = asRecord(proposal.scheduleData)
    const currentProposalFlag = parseBoolean(
      proposalSchedule.includesMaguiConnectBonus,
      false
    )

    let proposalChanged = false
    let projectChanged = false

    if (bonusDetected && !currentProposalFlag) {
      proposalSchedule.includesMaguiConnectBonus = true
      proposalChanged = true
    }

    if (proposal.project && bonusDetected) {
      const projectSchedule = asRecord(proposal.project.scheduleData)
      const currentProjectFlag = parseBoolean(
        projectSchedule.includesMaguiConnectBonus,
        false
      )

      if (!currentProjectFlag) {
        projectSchedule.includesMaguiConnectBonus = true
        projectChanged = true
      }

      if (
        typeof projectSchedule.sourceProposalId !== "string" ||
        projectSchedule.sourceProposalId.trim().length === 0
      ) {
        projectSchedule.sourceProposalId = proposal.id
        projectChanged = true
      }

      const nextStatus = resolveBonusStatus({
        includesBonus: true,
        currentStatus: projectSchedule.maguiConnectBonusStatus,
        projectStatus: proposal.project.status,
        clientAlreadyHasAccess:
          proposal.project.client.canAccessMaguiConnect ?? false,
      })

      if (projectSchedule.maguiConnectBonusStatus !== nextStatus) {
        projectSchedule.maguiConnectBonusStatus = nextStatus
        projectChanged = true
      }

      if (projectChanged) {
        await prisma.project.update({
          where: { id: proposal.project.id },
          data: {
            scheduleData: projectSchedule as Prisma.InputJsonValue,
          },
        })
        updatedProjects += 1
      }
    }

    if (proposalChanged) {
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          scheduleData: proposalSchedule as Prisma.InputJsonValue,
        },
      })
      updatedProposals += 1
    }

    if (!proposalChanged && !projectChanged) {
      skipped += 1
      continue
    }

    console.log(
      `updated: ${proposal.title} (${proposal.id}) -> proposal=${proposalChanged} project=${projectChanged}`
    )
  }

  console.log(
    `Backfill finished. Updated proposals: ${updatedProposals}. Updated projects: ${updatedProjects}. Skipped: ${skipped}.`
  )
}

run()
  .catch((error) => {
    console.error("MAGUI Connect bonus backfill failed.", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
