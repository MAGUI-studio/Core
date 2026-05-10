import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import pg from "pg"

import { ProjectStatus } from "../src/generated/client/index.js"
import { PrismaClient } from "../src/generated/client/index.js"

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const OPERATIONAL_PROJECT_STATUSES = new Set<ProjectStatus>([
  ProjectStatus.STRATEGY,
  ProjectStatus.ARCHITECTURE,
  ProjectStatus.DESIGN,
  ProjectStatus.ENGINEERING,
  ProjectStatus.QA,
])

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value !== "string" || value.trim().length === 0) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value)
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return null
}

function parseNonNegativeInt(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value)
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }

  return fallback
}

function normalizeScheduleData(rawSchedule: unknown) {
  const source =
    rawSchedule && typeof rawSchedule === "object"
      ? (rawSchedule as Record<string, unknown>)
      : {}

  const operationalStatus = OPERATIONAL_PROJECT_STATUSES.has(
    source.operationalStatus as ProjectStatus
  )
    ? (source.operationalStatus as ProjectStatus)
    : ProjectStatus.STRATEGY

  const executionState =
    source.executionState === "PENDING_INPUT" ||
    source.executionState === "ACTIVE" ||
    source.executionState === "ON_HOLD_CLIENT" ||
    source.executionState === "ABANDONED" ||
    source.executionState === "COMPLETED"
      ? source.executionState
      : "PENDING_INPUT"

  return {
    operationalStatus,
    executionState,
    executionBusinessDays: parsePositiveInt(source.executionBusinessDays),
    executionStartAt: parseDate(source.executionStartAt),
    briefingRequestedAt: parseDate(source.briefingRequestedAt),
    briefingValidatedAt: parseDate(source.briefingValidatedAt),
    currentForecastDate: parseDate(source.currentForecastDate),
    suspensionStartedAt: parseDate(source.suspensionStartedAt),
    abandonedAt: parseDate(source.abandonedAt),
    awaitingClientSince: parseDate(source.awaitingClientSince),
    clientDelayCalendarDays: parseNonNegativeInt(
      source.clientDelayCalendarDays
    ),
    clientDelayBusinessDays: parseNonNegativeInt(
      source.clientDelayBusinessDays
    ),
    delayEvents: Array.isArray(source.delayEvents)
      ? source.delayEvents
      : ([] as unknown[]),
  }
}

function resolveProjectStatusFromSchedule(
  rawSchedule: unknown,
  currentStatus: ProjectStatus
) {
  const schedule = normalizeScheduleData(rawSchedule)

  if (currentStatus === ProjectStatus.LAUNCHED) {
    return ProjectStatus.LAUNCHED
  }

  if (schedule.executionState === "ABANDONED") {
    return ProjectStatus.ABANDONED
  }

  if (schedule.executionState === "ON_HOLD_CLIENT") {
    return ProjectStatus.ON_HOLD_CLIENT
  }

  if (
    currentStatus === ProjectStatus.ON_HOLD_CLIENT ||
    currentStatus === ProjectStatus.ABANDONED
  ) {
    return schedule.operationalStatus
  }

  return currentStatus
}

function buildProjectSchedulePersistence(
  rawSchedule: unknown,
  projectStatus: ProjectStatus
) {
  const schedule = normalizeScheduleData(rawSchedule)
  const lastResolvedDelay = [...schedule.delayEvents]
    .map((event) =>
      event && typeof event === "object"
        ? (event as Record<string, unknown>)
        : null
    )
    .filter((event): event is Record<string, unknown> => Boolean(event))
    .map((event) => parseDate(event.resolvedAt))
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return {
    executionBusinessDays: schedule.executionBusinessDays,
    executionStartAt: schedule.executionStartAt,
    briefingRequestedAt: schedule.briefingRequestedAt,
    briefingValidatedAt: schedule.briefingValidatedAt,
    deliveryForecastAt: schedule.currentForecastDate,
    suspendedAt:
      projectStatus === ProjectStatus.ON_HOLD_CLIENT
        ? schedule.suspensionStartedAt
        : null,
    abandonedAt:
      projectStatus === ProjectStatus.ABANDONED ? schedule.abandonedAt : null,
    lastClientDependencyAt: schedule.awaitingClientSince,
    lastClientResponseAt: lastResolvedDelay ?? schedule.briefingValidatedAt,
    clientDelayCalendarDays: schedule.clientDelayCalendarDays,
    clientDelayBusinessDays: schedule.clientDelayBusinessDays,
  }
}

async function main() {
  console.log("Starting project schedule backfill...")

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      scheduleData: true,
      executionBusinessDays: true,
      executionStartAt: true,
      briefingRequestedAt: true,
      briefingValidatedAt: true,
      deliveryForecastAt: true,
      suspendedAt: true,
      abandonedAt: true,
      lastClientDependencyAt: true,
      lastClientResponseAt: true,
      clientDelayCalendarDays: true,
      clientDelayBusinessDays: true,
    },
  })

  let updated = 0
  let skipped = 0

  for (const project of projects) {
    const resolvedStatus = resolveProjectStatusFromSchedule(
      project.scheduleData,
      project.status
    )
    const persistence = buildProjectSchedulePersistence(
      project.scheduleData,
      resolvedStatus
    )

    const hasChanges =
      project.status !== resolvedStatus ||
      project.executionBusinessDays !== persistence.executionBusinessDays ||
      project.executionStartAt?.toISOString() !==
        persistence.executionStartAt?.toISOString() ||
      project.briefingRequestedAt?.toISOString() !==
        persistence.briefingRequestedAt?.toISOString() ||
      project.briefingValidatedAt?.toISOString() !==
        persistence.briefingValidatedAt?.toISOString() ||
      project.deliveryForecastAt?.toISOString() !==
        persistence.deliveryForecastAt?.toISOString() ||
      project.suspendedAt?.toISOString() !==
        persistence.suspendedAt?.toISOString() ||
      project.abandonedAt?.toISOString() !==
        persistence.abandonedAt?.toISOString() ||
      project.lastClientDependencyAt?.toISOString() !==
        persistence.lastClientDependencyAt?.toISOString() ||
      project.lastClientResponseAt?.toISOString() !==
        persistence.lastClientResponseAt?.toISOString() ||
      project.clientDelayCalendarDays !== persistence.clientDelayCalendarDays ||
      project.clientDelayBusinessDays !== persistence.clientDelayBusinessDays

    if (!hasChanges) {
      skipped += 1
      continue
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: resolvedStatus,
        ...persistence,
      },
    })

    updated += 1
    console.log(`updated: ${project.name} (${project.id}) -> ${resolvedStatus}`)
  }

  console.log(`Backfill finished. Updated: ${updated}. Skipped: ${skipped}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
