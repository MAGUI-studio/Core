import { ProjectCategory, ProjectStatus } from "@/src/generated/client"

const OPERATIONAL_PROJECT_STATUSES = [
  ProjectStatus.STRATEGY,
  ProjectStatus.ARCHITECTURE,
  ProjectStatus.DESIGN,
  ProjectStatus.ENGINEERING,
  ProjectStatus.QA,
] as const

type OperationalProjectStatus = (typeof OPERATIONAL_PROJECT_STATUSES)[number]

function isOperationalProjectStatus(
  value: unknown
): value is OperationalProjectStatus {
  return OPERATIONAL_PROJECT_STATUSES.includes(
    value as OperationalProjectStatus
  )
}

export type ProposalScheduleData = {
  projectCategory: ProjectCategory | null
  executionBusinessDays: number | null
  delayMultiplier: number
  suspensionAfterCalendarDays: number
  abandonmentAfterCalendarDays: number
  requiresBriefing: boolean
  requiresBrandAssets: boolean
  includesMaguiConnectBonus: boolean
  exposeInPortfolio: boolean
  keepFooterCredit: boolean
  whiteLabelFeeCents: number
  annualRenewalFeeCents: number
}

export type MaguiConnectBonusStatus =
  | "NOT_INCLUDED"
  | "PENDING_RELEASE"
  | "RELEASED"
  | "CANCELLED"

export type ProjectScheduleState =
  | "PENDING_INPUT"
  | "ACTIVE"
  | "ON_HOLD_CLIENT"
  | "ABANDONED"
  | "COMPLETED"

export type ProjectDelayReasonKind = "BRIEFING_INPUT" | "APPROVAL_PENDING"

export type ProjectDelayEvent = {
  id: string
  kind: ProjectDelayReasonKind
  title: string
  description: string
  sourceId: string | null
  startedAt: string
  resolvedAt: string
  calendarDays: number
  businessDaysAdded: number
}

export type PendingClientApproval = {
  updateId: string
  title: string
  requestedAt: string
}

export type ProjectScheduleData = ProposalScheduleData & {
  operationalStatus: OperationalProjectStatus
  sourceProposalId: string | null
  maguiConnectBonusStatus: MaguiConnectBonusStatus
  executionState: ProjectScheduleState
  briefingRequestedAt: string | null
  briefingValidatedAt: string | null
  assetsValidatedAt: string | null
  materialValidatedAt: string | null
  executionStartAt: string | null
  awaitingClientSince: string | null
  clientDelayCalendarDays: number
  clientDelayBusinessDays: number
  currentForecastDate: string | null
  suspensionStartedAt: string | null
  abandonedAt: string | null
  delayEvents: ProjectDelayEvent[]
  pendingClientApprovals: PendingClientApproval[]
  renewalCycleStartedAt: string | null
  domainRenewalDueAt: string | null
  hostingRenewalDueAt: string | null
}

export type ProjectScheduleReasonView = {
  id: string
  kind: ProjectDelayReasonKind
  title: string
  description: string
  sourceId: string | null
  startedAt: Date
  resolvedAt: Date | null
  calendarDays: number
  businessDaysAdded: number
  isActive: boolean
}

export type ProjectRenewalKind = "DOMAIN" | "HOSTING"

export type ProjectRenewalSignal = {
  kind: ProjectRenewalKind
  dueAt: Date
  daysUntilDue: number
  status: "UPCOMING" | "OVERDUE" | "SUSPENSION_RISK"
}

export type ProjectScheduleView = {
  executionBusinessDays: number | null
  delayMultiplier: number
  suspensionAfterCalendarDays: number
  abandonmentAfterCalendarDays: number
  requiresBriefing: boolean
  requiresBrandAssets: boolean
  includesMaguiConnectBonus: boolean
  sourceProposalId: string | null
  maguiConnectBonusStatus: MaguiConnectBonusStatus
  executionState: ProjectScheduleState
  executionStartAt: Date | null
  materialValidatedAt: Date | null
  awaitingClientSince: Date | null
  clientDelayCalendarDays: number
  clientDelayBusinessDays: number
  currentForecastDate: Date | null
  remainingBusinessDays: number | null
  elapsedBusinessDays: number | null
  suspensionStartedAt: Date | null
  abandonedAt: Date | null
  delayReasons: ProjectScheduleReasonView[]
}

export type ProjectSchedulePersistence = {
  executionBusinessDays: number | null
  executionStartAt: Date | null
  briefingRequestedAt: Date | null
  briefingValidatedAt: Date | null
  deliveryForecastAt: Date | null
  suspendedAt: Date | null
  abandonedAt: Date | null
  lastClientDependencyAt: Date | null
  lastClientResponseAt: Date | null
  clientDelayCalendarDays: number
  clientDelayBusinessDays: number
}

const DEFAULT_DELAY_MULTIPLIER = 2
const DEFAULT_SUSPENSION_AFTER_DAYS = 7
const DEFAULT_ABANDONMENT_AFTER_DAYS = 30

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

function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    if (value === "true") return true
    if (value === "false") return false
  }
  return fallback
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value !== "string" || value.trim().length === 0) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function buildDelayDescription(input: {
  kind: ProjectDelayReasonKind
  calendarDays: number
  businessDaysAdded: number
  contextTitle?: string | null
}) {
  const dayLabel = input.calendarDays === 1 ? "dia corrido" : "dias corridos"
  const businessLabel =
    input.businessDaysAdded === 1 ? "dia útil" : "dias úteis"

  if (input.kind === "BRIEFING_INPUT") {
    return `+${input.businessDaysAdded} ${businessLabel} por ${input.calendarDays} ${dayLabel} de atraso no preenchimento do briefing e envio dos ativos obrigatórios.`
  }

  const suffix = input.contextTitle
    ? ` na aprovação de "${input.contextTitle}".`
    : " na resposta de aprovação pendente."

  return `+${input.businessDaysAdded} ${businessLabel} por ${input.calendarDays} ${dayLabel} sem resposta do cliente${suffix}`
}

function normalizeDelayEvent(value: unknown): ProjectDelayEvent | null {
  if (!value || typeof value !== "object") return null

  const source = value as Record<string, unknown>
  const id =
    typeof source.id === "string" && source.id.trim().length > 0
      ? source.id
      : null
  const kind =
    source.kind === "BRIEFING_INPUT" || source.kind === "APPROVAL_PENDING"
      ? source.kind
      : null
  const startedAt = toIsoString(parseDate(source.startedAt))
  const resolvedAt = toIsoString(parseDate(source.resolvedAt))

  if (!id || !kind || !startedAt || !resolvedAt) return null

  return {
    id,
    kind,
    title:
      typeof source.title === "string" && source.title.trim().length > 0
        ? source.title
        : kind === "BRIEFING_INPUT"
          ? "Atraso no briefing"
          : "Atraso em aprovação pendente",
    description:
      typeof source.description === "string" && source.description.trim().length > 0
        ? source.description
        : buildDelayDescription({
            kind,
            calendarDays: parseNonNegativeInt(source.calendarDays),
            businessDaysAdded: parseNonNegativeInt(source.businessDaysAdded),
            contextTitle:
              typeof source.title === "string" ? source.title : undefined,
          }),
    sourceId:
      typeof source.sourceId === "string" && source.sourceId.trim().length > 0
        ? source.sourceId
        : null,
    startedAt,
    resolvedAt,
    calendarDays: parseNonNegativeInt(source.calendarDays),
    businessDaysAdded: parseNonNegativeInt(source.businessDaysAdded),
  }
}

function normalizePendingClientApproval(value: unknown): PendingClientApproval | null {
  if (!value || typeof value !== "object") return null

  const source = value as Record<string, unknown>
  const updateId =
    typeof source.updateId === "string" && source.updateId.trim().length > 0
      ? source.updateId
      : null
  const requestedAt = toIsoString(parseDate(source.requestedAt))

  if (!updateId || !requestedAt) return null

  return {
    updateId,
    title:
      typeof source.title === "string" && source.title.trim().length > 0
        ? source.title
        : "Aprovação pendente",
    requestedAt,
  }
}

function toIsoString(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function getEasterSunday(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day)
}

function formatHolidayKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildHolidaySet(year: number) {
  const easterSunday = getEasterSunday(year)
  const goodFriday = new Date(easterSunday)
  goodFriday.setDate(easterSunday.getDate() - 2)

  const fixedHolidays = [
    new Date(year, 0, 1),
    new Date(year, 2, 19),
    goodFriday,
    new Date(year, 3, 21),
    new Date(year, 4, 1),
    new Date(year, 6, 27),
    new Date(year, 8, 7),
    new Date(year, 9, 12),
    new Date(year, 10, 2),
    new Date(year, 10, 15),
    new Date(year, 10, 20),
    new Date(year, 11, 25),
  ]

  return new Set(fixedHolidays.map(formatHolidayKey))
}

function isHoliday(date: Date) {
  return buildHolidaySet(date.getFullYear()).has(formatHolidayKey(date))
}

function isBusinessDay(date: Date) {
  return !isWeekend(date) && !isHoliday(date)
}

export function addBusinessDays(date: Date, amount: number) {
  const result = new Date(date)
  let remaining = Math.max(0, Math.round(amount))

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (isBusinessDay(result)) {
      remaining -= 1
    }
  }

  return result
}

export function diffCalendarDays(from: Date, to: Date) {
  const fromDay = startOfDay(from)
  const toDay = startOfDay(to)
  return Math.max(
    0,
    Math.round((toDay.getTime() - fromDay.getTime()) / 86_400_000)
  )
}

export function diffBusinessDays(from: Date, to: Date) {
  const cursor = startOfDay(from)
  const target = startOfDay(to)
  if (target.getTime() <= cursor.getTime()) return 0

  let count = 0
  while (cursor.getTime() < target.getTime()) {
    cursor.setDate(cursor.getDate() + 1)
    if (isBusinessDay(cursor)) count += 1
  }

  return count
}

export function normalizeProposalScheduleData(
  value: unknown
): ProposalScheduleData {
  const source =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {}

  return {
    projectCategory:
      source.projectCategory === ProjectCategory.LANDING_PAGE ||
      source.projectCategory === ProjectCategory.INSTITUTIONAL_SITE ||
      source.projectCategory === ProjectCategory.BOOKING_PLATFORM ||
      source.projectCategory === ProjectCategory.STABILITY_PLAN
        ? source.projectCategory
        : null,
    executionBusinessDays: parsePositiveInt(source.executionBusinessDays),
    delayMultiplier: Math.max(
      1,
      parseNonNegativeInt(source.delayMultiplier, DEFAULT_DELAY_MULTIPLIER)
    ),
    suspensionAfterCalendarDays: Math.max(
      1,
      parseNonNegativeInt(
        source.suspensionAfterCalendarDays,
        DEFAULT_SUSPENSION_AFTER_DAYS
      )
    ),
    abandonmentAfterCalendarDays: Math.max(
      1,
      parseNonNegativeInt(
        source.abandonmentAfterCalendarDays,
        DEFAULT_ABANDONMENT_AFTER_DAYS
      )
    ),
    requiresBriefing: parseBoolean(source.requiresBriefing, true),
    requiresBrandAssets: parseBoolean(source.requiresBrandAssets, true),
    includesMaguiConnectBonus: parseBoolean(
      source.includesMaguiConnectBonus,
      false
    ),
    exposeInPortfolio: parseBoolean(source.exposeInPortfolio, true),
    keepFooterCredit: parseBoolean(source.keepFooterCredit, true),
    whiteLabelFeeCents: parseNonNegativeInt(source.whiteLabelFeeCents),
    annualRenewalFeeCents: parseNonNegativeInt(
      source.annualRenewalFeeCents,
      29_700
    ),
  }
}

export function normalizeProjectScheduleData(
  value: unknown
): ProjectScheduleData {
  const source =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  const proposalDefaults = normalizeProposalScheduleData(source)

  const executionState = String(source.executionState || "").trim()

  return {
    ...proposalDefaults,
    operationalStatus: isOperationalProjectStatus(source.operationalStatus)
      ? source.operationalStatus
      : ProjectStatus.STRATEGY,
    sourceProposalId:
      typeof source.sourceProposalId === "string" &&
      source.sourceProposalId.trim().length > 0
        ? source.sourceProposalId
        : null,
    maguiConnectBonusStatus:
      source.maguiConnectBonusStatus === "PENDING_RELEASE" ||
      source.maguiConnectBonusStatus === "RELEASED" ||
      source.maguiConnectBonusStatus === "CANCELLED"
        ? source.maguiConnectBonusStatus
        : proposalDefaults.includesMaguiConnectBonus
          ? "PENDING_RELEASE"
          : "NOT_INCLUDED",
    executionState:
      executionState === "ACTIVE" ||
      executionState === "ON_HOLD_CLIENT" ||
      executionState === "ABANDONED" ||
      executionState === "COMPLETED"
        ? (executionState as ProjectScheduleState)
        : "PENDING_INPUT",
    briefingRequestedAt: toIsoString(parseDate(source.briefingRequestedAt)),
    briefingValidatedAt: toIsoString(parseDate(source.briefingValidatedAt)),
    assetsValidatedAt: toIsoString(parseDate(source.assetsValidatedAt)),
    materialValidatedAt: toIsoString(parseDate(source.materialValidatedAt)),
    executionStartAt: toIsoString(parseDate(source.executionStartAt)),
    awaitingClientSince: toIsoString(parseDate(source.awaitingClientSince)),
    clientDelayCalendarDays: parseNonNegativeInt(source.clientDelayCalendarDays),
    clientDelayBusinessDays: parseNonNegativeInt(source.clientDelayBusinessDays),
    currentForecastDate: toIsoString(parseDate(source.currentForecastDate)),
    suspensionStartedAt: toIsoString(parseDate(source.suspensionStartedAt)),
    abandonedAt: toIsoString(parseDate(source.abandonedAt)),
    renewalCycleStartedAt: toIsoString(parseDate(source.renewalCycleStartedAt)),
    domainRenewalDueAt: toIsoString(parseDate(source.domainRenewalDueAt)),
    hostingRenewalDueAt: toIsoString(parseDate(source.hostingRenewalDueAt)),
    delayEvents: Array.isArray(source.delayEvents)
      ? source.delayEvents
          .map((item) => normalizeDelayEvent(item))
          .filter((item): item is ProjectDelayEvent => item !== null)
      : [],
    pendingClientApprovals: Array.isArray(source.pendingClientApprovals)
      ? source.pendingClientApprovals
          .map((item) => normalizePendingClientApproval(item))
          .filter((item): item is PendingClientApproval => item !== null)
      : [],
  }
}

export function buildProposalScheduleData(input?: {
  projectCategory?: ProjectCategory | null
  executionBusinessDays?: number | null
  delayMultiplier?: number
  suspensionAfterCalendarDays?: number
  abandonmentAfterCalendarDays?: number
  requiresBriefing?: boolean
  requiresBrandAssets?: boolean
  includesMaguiConnectBonus?: boolean
  exposeInPortfolio?: boolean
  keepFooterCredit?: boolean
  whiteLabelFeeCents?: number
  annualRenewalFeeCents?: number
}): ProposalScheduleData {
  return normalizeProposalScheduleData({
    projectCategory: input?.projectCategory ?? null,
    executionBusinessDays: input?.executionBusinessDays ?? null,
    delayMultiplier: input?.delayMultiplier ?? DEFAULT_DELAY_MULTIPLIER,
    suspensionAfterCalendarDays:
      input?.suspensionAfterCalendarDays ?? DEFAULT_SUSPENSION_AFTER_DAYS,
    abandonmentAfterCalendarDays:
      input?.abandonmentAfterCalendarDays ?? DEFAULT_ABANDONMENT_AFTER_DAYS,
    requiresBriefing: input?.requiresBriefing ?? true,
    requiresBrandAssets: input?.requiresBrandAssets ?? true,
    includesMaguiConnectBonus: input?.includesMaguiConnectBonus ?? false,
    exposeInPortfolio: input?.exposeInPortfolio ?? true,
    keepFooterCredit: input?.keepFooterCredit ?? true,
    whiteLabelFeeCents: input?.whiteLabelFeeCents ?? 20_000,
    annualRenewalFeeCents: input?.annualRenewalFeeCents ?? 29_700,
  })
}

export function buildInitialProjectScheduleData(input?: {
  executionBusinessDays?: number | null
  now?: Date
  delayMultiplier?: number
  suspensionAfterCalendarDays?: number
  abandonmentAfterCalendarDays?: number
  requiresBriefing?: boolean
  requiresBrandAssets?: boolean
  includesMaguiConnectBonus?: boolean
  sourceProposalId?: string | null
  maguiConnectBonusStatus?: MaguiConnectBonusStatus
  exposeInPortfolio?: boolean
  keepFooterCredit?: boolean
  whiteLabelFeeCents?: number
  annualRenewalFeeCents?: number
}): ProjectScheduleData {
  const now = input?.now ?? new Date()
  const base = buildProposalScheduleData(input)

  return {
    ...base,
    operationalStatus: ProjectStatus.STRATEGY,
    sourceProposalId: input?.sourceProposalId ?? null,
    maguiConnectBonusStatus:
      input?.maguiConnectBonusStatus ??
      (base.includesMaguiConnectBonus ? "PENDING_RELEASE" : "NOT_INCLUDED"),
    executionState: "PENDING_INPUT",
    briefingRequestedAt: now.toISOString(),
    briefingValidatedAt: null,
    assetsValidatedAt: null,
    materialValidatedAt: null,
    executionStartAt: null,
    awaitingClientSince: now.toISOString(),
    clientDelayCalendarDays: 0,
    clientDelayBusinessDays: 0,
    currentForecastDate: null,
    suspensionStartedAt: null,
    abandonedAt: null,
    delayEvents: [],
    pendingClientApprovals: [],
    renewalCycleStartedAt: null,
    domainRenewalDueAt: null,
    hostingRenewalDueAt: null,
  }
}

function buildForecastDate(
  executionStartAt: string | null,
  executionBusinessDays: number | null,
  totalDelayBusinessDays: number
) {
  if (!executionStartAt || !executionBusinessDays) return null

  return addBusinessDays(
    new Date(executionStartAt),
    executionBusinessDays + totalDelayBusinessDays
  )
}

function upsertDelayEvent(
  existing: ProjectDelayEvent[],
  next: ProjectDelayEvent
): ProjectDelayEvent[] {
  const filtered = existing.filter((event) => event.id !== next.id)
  return [...filtered, next].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt)
  )
}

function toReasonView(
  reason: Omit<ProjectScheduleReasonView, "startedAt" | "resolvedAt"> & {
    startedAt: string
    resolvedAt: string | null
  }
): ProjectScheduleReasonView {
  return {
    ...reason,
    startedAt: new Date(reason.startedAt),
    resolvedAt: reason.resolvedAt ? new Date(reason.resolvedAt) : null,
  }
}

export function hasPrimaryBriefingData(briefing: unknown) {
  if (!briefing || typeof briefing !== "object") return false
  const source = briefing as Record<string, unknown>

  const fields = [
    source.brandTone,
    source.visualReferences,
    source.businessGoals,
    source.primaryCta,
    source.targetAudience,
    source.differentiators,
  ]

  const completed = fields.filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "string") return value.trim().length > 0
    return Boolean(value)
  })

  return completed.length >= 4
}

export function hasMinimumBrandAssets(briefing: unknown) {
  if (!briefing || typeof briefing !== "object") return false
  const source = briefing as Record<string, unknown>
  const logos =
    source.logos && typeof source.logos === "object"
      ? (source.logos as Record<string, unknown>)
      : null
  const primaryLogo =
    logos?.primary && typeof logos.primary === "object"
      ? (logos.primary as Record<string, unknown>)
      : null
  const palette =
    source.palette && typeof source.palette === "object"
      ? (source.palette as Record<string, unknown>)
      : null

  const hasLogo =
    (typeof primaryLogo?.url === "string" && primaryLogo.url.length > 10) ||
    (typeof logos?.primary === "string" && logos.primary.length > 10)
  const hasPalette =
    typeof palette?.primary === "string" && palette.primary.startsWith("#")

  return hasLogo || hasPalette
}

export function syncProjectScheduleFromBriefing(
  rawSchedule: unknown,
  briefing: unknown,
  projectStatus?: ProjectStatus,
  now: Date = new Date()
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const hasBriefing = schedule.requiresBriefing
    ? hasPrimaryBriefingData(briefing)
    : true
  const hasAssets = schedule.requiresBrandAssets
    ? hasMinimumBrandAssets(briefing)
    : true

  const briefingValidatedAt =
    schedule.briefingValidatedAt ??
    (hasBriefing ? now.toISOString() : null)
  const assetsValidatedAt =
    schedule.assetsValidatedAt ??
    (hasAssets ? now.toISOString() : null)
  const materialValidatedAt =
    schedule.materialValidatedAt ??
    (hasBriefing && hasAssets ? now.toISOString() : null)
  const executionStartAt =
    schedule.executionStartAt ??
    (materialValidatedAt ? materialValidatedAt : null)

  const requestedAt = parseDate(schedule.briefingRequestedAt) ?? now
  const materialValidatedDate = parseDate(materialValidatedAt)
  const awaitingClientSince =
    materialValidatedAt === null
      ? schedule.awaitingClientSince ?? schedule.briefingRequestedAt ?? now.toISOString()
      : null

  const briefingDelayCalendarDays = materialValidatedDate
    ? diffCalendarDays(requestedAt, materialValidatedDate)
    : diffCalendarDays(requestedAt, now)

  let delayEvents = [...schedule.delayEvents]
  if (
    materialValidatedDate &&
    briefingDelayCalendarDays > 0 &&
    !delayEvents.some((event) => event.id === "briefing-input-delay")
  ) {
    delayEvents = upsertDelayEvent(delayEvents, {
      id: "briefing-input-delay",
      kind: "BRIEFING_INPUT",
      title: "Atraso no briefing e envio de ativos",
      description: buildDelayDescription({
        kind: "BRIEFING_INPUT",
        calendarDays: briefingDelayCalendarDays,
        businessDaysAdded: briefingDelayCalendarDays * schedule.delayMultiplier,
      }),
      sourceId: "briefing",
      startedAt: requestedAt.toISOString(),
      resolvedAt: materialValidatedDate.toISOString(),
      calendarDays: briefingDelayCalendarDays,
      businessDaysAdded: briefingDelayCalendarDays * schedule.delayMultiplier,
    })
  }

  const closedDelayCalendarDays = delayEvents.reduce(
    (acc, event) => acc + event.calendarDays,
    0
  )
  const closedDelayBusinessDays = delayEvents.reduce(
    (acc, event) => acc + event.businessDaysAdded,
    0
  )
  const openApprovalDelayCalendarDays = schedule.pendingClientApprovals.reduce(
    (acc, approval) =>
      acc + diffCalendarDays(new Date(approval.requestedAt), now),
    0
  )
  const openApprovalDelayBusinessDays =
    openApprovalDelayCalendarDays * schedule.delayMultiplier
  const totalDelayCalendarDays =
    closedDelayCalendarDays +
    (materialValidatedDate ? 0 : briefingDelayCalendarDays) +
    openApprovalDelayCalendarDays
  const totalDelayBusinessDays =
    closedDelayBusinessDays +
    (materialValidatedDate ? 0 : briefingDelayCalendarDays * schedule.delayMultiplier) +
    openApprovalDelayBusinessDays
  const forecastDate = buildForecastDate(
    executionStartAt,
    schedule.executionBusinessDays,
    totalDelayBusinessDays
  )

  const currentState = (() => {
    if (projectStatus === ProjectStatus.LAUNCHED) return "COMPLETED"
    if (schedule.abandonedAt) return "ABANDONED"
    if (!materialValidatedAt) {
      if (briefingDelayCalendarDays >= schedule.abandonmentAfterCalendarDays) {
        return "ABANDONED"
      }
      if (briefingDelayCalendarDays >= schedule.suspensionAfterCalendarDays) {
        return "ON_HOLD_CLIENT"
      }
      return "PENDING_INPUT"
    }
    return "ACTIVE"
  })()

  return normalizeProjectScheduleData({
    ...schedule,
    executionState: currentState,
    briefingValidatedAt,
    assetsValidatedAt,
    materialValidatedAt,
    executionStartAt,
    awaitingClientSince,
    clientDelayCalendarDays: totalDelayCalendarDays,
    clientDelayBusinessDays: totalDelayBusinessDays,
    currentForecastDate: toIsoString(forecastDate),
    suspensionStartedAt:
      currentState === "ON_HOLD_CLIENT"
        ? schedule.suspensionStartedAt ?? now.toISOString()
        : null,
    abandonedAt:
      currentState === "ABANDONED"
        ? schedule.abandonedAt ?? now.toISOString()
        : null,
    delayEvents,
  })
}

export function registerPendingClientApproval(
  rawSchedule: unknown,
  input: {
    updateId: string
    title: string
    requestedAt?: Date
  }
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  if (schedule.pendingClientApprovals.some((item) => item.updateId === input.updateId)) {
    return schedule
  }

  const pendingClientApprovals = [
    ...schedule.pendingClientApprovals,
    {
      updateId: input.updateId,
      title: input.title,
      requestedAt: (input.requestedAt ?? new Date()).toISOString(),
    },
  ].sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))

  return normalizeProjectScheduleData({
    ...schedule,
    pendingClientApprovals,
  })
}

export function resolvePendingClientApproval(
  rawSchedule: unknown,
  input: {
    updateId: string
    resolvedAt?: Date
  }
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const pendingItem = schedule.pendingClientApprovals.find(
    (item) => item.updateId === input.updateId
  )

  if (!pendingItem) return schedule

  const resolvedAt = input.resolvedAt ?? new Date()
  const calendarDays = diffCalendarDays(new Date(pendingItem.requestedAt), resolvedAt)
  const businessDaysAdded = calendarDays * schedule.delayMultiplier
  const pendingClientApprovals = schedule.pendingClientApprovals.filter(
    (item) => item.updateId !== input.updateId
  )
  const delayEvents =
    calendarDays > 0
      ? upsertDelayEvent(schedule.delayEvents, {
          id: `approval-delay-${input.updateId}`,
          kind: "APPROVAL_PENDING",
          title: `Atraso na aprovação: ${pendingItem.title}`,
          description: buildDelayDescription({
            kind: "APPROVAL_PENDING",
            calendarDays,
            businessDaysAdded,
            contextTitle: pendingItem.title,
          }),
          sourceId: input.updateId,
          startedAt: pendingItem.requestedAt,
          resolvedAt: resolvedAt.toISOString(),
          calendarDays,
          businessDaysAdded,
        })
      : schedule.delayEvents

  const totalDelayCalendarDays = delayEvents.reduce(
    (acc, event) => acc + event.calendarDays,
    0
  )
  const totalDelayBusinessDays = delayEvents.reduce(
    (acc, event) => acc + event.businessDaysAdded,
    0
  )
  const forecastDate = buildForecastDate(
    schedule.executionStartAt,
    schedule.executionBusinessDays,
    totalDelayBusinessDays
  )

  return normalizeProjectScheduleData({
    ...schedule,
    pendingClientApprovals,
    delayEvents,
    clientDelayCalendarDays: totalDelayCalendarDays,
    clientDelayBusinessDays: totalDelayBusinessDays,
    currentForecastDate: toIsoString(forecastDate),
  })
}

export function clearPendingClientApproval(
  rawSchedule: unknown,
  updateId: string
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)

  return normalizeProjectScheduleData({
    ...schedule,
    pendingClientApprovals: schedule.pendingClientApprovals.filter(
      (item) => item.updateId !== updateId
    ),
  })
}

export function buildProjectScheduleView(
  rawSchedule: unknown,
  projectStatus?: ProjectStatus
): ProjectScheduleView {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const now = new Date()
  const executionStartAt = parseDate(schedule.executionStartAt)
  const awaitingClientSince = parseDate(schedule.awaitingClientSince)
  const suspensionStartedAt = parseDate(schedule.suspensionStartedAt)
  const abandonedAt = parseDate(schedule.abandonedAt)
  const materialValidatedAt = parseDate(schedule.materialValidatedAt)
  const briefingDelayCalendarDays =
    !materialValidatedAt && awaitingClientSince
      ? diffCalendarDays(awaitingClientSince, now)
      : 0
  const briefingDelayBusinessDays =
    briefingDelayCalendarDays * schedule.delayMultiplier
  const pendingApprovalReasons = schedule.pendingClientApprovals.map((approval) => {
    const calendarDays = diffCalendarDays(new Date(approval.requestedAt), now)
    const businessDaysAdded = calendarDays * schedule.delayMultiplier

    return toReasonView({
      id: `approval-live-${approval.updateId}`,
      kind: "APPROVAL_PENDING",
      title: `Aguardando aprovação: ${approval.title}`,
      description: buildDelayDescription({
        kind: "APPROVAL_PENDING",
        calendarDays,
        businessDaysAdded,
        contextTitle: approval.title,
      }),
      sourceId: approval.updateId,
      startedAt: approval.requestedAt,
      resolvedAt: null,
      calendarDays,
      businessDaysAdded,
      isActive: true,
    })
  })
  const closedDelayReasons = schedule.delayEvents.map((event) =>
    toReasonView({
      ...event,
      isActive: false,
    })
  )
  const briefingReason =
    briefingDelayCalendarDays > 0 && awaitingClientSince
      ? [
          toReasonView({
            id: "briefing-live-delay",
            kind: "BRIEFING_INPUT",
            title: "Aguardando briefing e ativos obrigatórios",
            description: buildDelayDescription({
              kind: "BRIEFING_INPUT",
              calendarDays: briefingDelayCalendarDays,
              businessDaysAdded: briefingDelayBusinessDays,
            }),
            sourceId: "briefing",
            startedAt: awaitingClientSince.toISOString(),
            resolvedAt: null,
            calendarDays: briefingDelayCalendarDays,
            businessDaysAdded: briefingDelayBusinessDays,
            isActive: true,
          }),
        ]
      : []
  const delayReasons = [...closedDelayReasons, ...briefingReason, ...pendingApprovalReasons]
  const totalDelayCalendarDays = delayReasons.reduce(
    (acc, reason) => acc + reason.calendarDays,
    0
  )
  const totalDelayBusinessDays = delayReasons.reduce(
    (acc, reason) => acc + reason.businessDaysAdded,
    0
  )
  const forecastDate = buildForecastDate(
    schedule.executionStartAt,
    schedule.executionBusinessDays,
    totalDelayBusinessDays
  )

  const effectiveState = (() => {
    if (projectStatus === ProjectStatus.LAUNCHED) return "COMPLETED"
    if (abandonedAt) return "ABANDONED"
    if (!materialValidatedAt && awaitingClientSince) {
      const waitingDays = diffCalendarDays(awaitingClientSince, now)
      if (waitingDays >= schedule.abandonmentAfterCalendarDays) {
        return "ABANDONED"
      }
      if (waitingDays >= schedule.suspensionAfterCalendarDays) {
        return "ON_HOLD_CLIENT"
      }
    }
    return schedule.executionState
  })()

  const elapsedBusinessDays =
    executionStartAt && effectiveState !== "PENDING_INPUT"
      ? diffBusinessDays(executionStartAt, now)
      : null
  const remainingBusinessDays =
    schedule.executionBusinessDays && elapsedBusinessDays !== null
      ? Math.max(
          0,
          schedule.executionBusinessDays +
            totalDelayBusinessDays -
            elapsedBusinessDays
        )
      : null

  return {
    executionBusinessDays: schedule.executionBusinessDays,
    delayMultiplier: schedule.delayMultiplier,
    suspensionAfterCalendarDays: schedule.suspensionAfterCalendarDays,
    abandonmentAfterCalendarDays: schedule.abandonmentAfterCalendarDays,
    requiresBriefing: schedule.requiresBriefing,
    requiresBrandAssets: schedule.requiresBrandAssets,
    includesMaguiConnectBonus: schedule.includesMaguiConnectBonus,
    sourceProposalId: schedule.sourceProposalId,
    maguiConnectBonusStatus: schedule.maguiConnectBonusStatus,
    executionState: effectiveState,
    executionStartAt,
    materialValidatedAt,
    awaitingClientSince,
    clientDelayCalendarDays: totalDelayCalendarDays,
    clientDelayBusinessDays: totalDelayBusinessDays,
    currentForecastDate: forecastDate,
    remainingBusinessDays,
    elapsedBusinessDays,
    suspensionStartedAt,
    abandonedAt,
    delayReasons,
  }
}

export function getProposalExecutionDaysFromSchedule(rawSchedule: unknown) {
  return normalizeProposalScheduleData(rawSchedule).executionBusinessDays
}

export function proposalIncludesMaguiConnectBonus(rawSchedule: unknown) {
  return normalizeProposalScheduleData(rawSchedule).includesMaguiConnectBonus
}

export function getProjectMaguiConnectBonusStatus(rawSchedule: unknown) {
  return normalizeProjectScheduleData(rawSchedule).maguiConnectBonusStatus
}

export function ensureProjectRenewalSchedule(
  rawSchedule: unknown,
  launchedAt: Date = new Date()
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const cycleStartedAt = schedule.renewalCycleStartedAt ?? launchedAt.toISOString()
  const nextRenewalDate = new Date(cycleStartedAt)
  nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1)

  return normalizeProjectScheduleData({
    ...schedule,
    renewalCycleStartedAt: cycleStartedAt,
    domainRenewalDueAt:
      schedule.domainRenewalDueAt ?? nextRenewalDate.toISOString(),
    hostingRenewalDueAt:
      schedule.hostingRenewalDueAt ?? nextRenewalDate.toISOString(),
  })
}

export function getProjectRenewalSignals(
  rawSchedule: unknown,
  now: Date = new Date()
): ProjectRenewalSignal[] {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const candidates: Array<{
    kind: ProjectRenewalKind
    dueAt: Date | null
  }> = [
    {
      kind: "DOMAIN",
      dueAt: parseDate(schedule.domainRenewalDueAt),
    },
    {
      kind: "HOSTING",
      dueAt: parseDate(schedule.hostingRenewalDueAt),
    },
  ]

  return candidates
    .flatMap((candidate) => {
      if (!candidate.dueAt) return []

      const daysUntilDue = Math.round(
        (startOfDay(candidate.dueAt).getTime() - startOfDay(now).getTime()) /
          86_400_000
      )

      if (daysUntilDue > 30) return []

      const status =
        daysUntilDue < -5
          ? "SUSPENSION_RISK"
          : daysUntilDue < 0
            ? "OVERDUE"
            : "UPCOMING"

      return [
        {
          kind: candidate.kind,
          dueAt: candidate.dueAt,
          daysUntilDue,
          status,
        } satisfies ProjectRenewalSignal,
      ]
    })
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
}

export function setProjectOperationalStatus(
  rawSchedule: unknown,
  status: ProjectStatus
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)

  if (!isOperationalProjectStatus(status)) {
    return schedule
  }

  return normalizeProjectScheduleData({
    ...schedule,
    operationalStatus: status,
  })
}

export function resolveProjectStatusFromSchedule(
  rawSchedule: unknown,
  currentStatus: ProjectStatus
) {
  const schedule = normalizeProjectScheduleData(rawSchedule)

  if (currentStatus === ProjectStatus.LAUNCHED) {
    return ProjectStatus.LAUNCHED
  }

  if (schedule.executionState === "ABANDONED") {
    return ProjectStatus.ABANDONED
  }

  if (schedule.executionState === "ON_HOLD_CLIENT") {
    return ProjectStatus.ON_HOLD_CLIENT
  }

  if (currentStatus === ProjectStatus.ON_HOLD_CLIENT) {
    return schedule.operationalStatus
  }

  if (currentStatus === ProjectStatus.ABANDONED) {
    return schedule.operationalStatus
  }

  return currentStatus
}

export function buildProjectSchedulePersistence(
  rawSchedule: unknown,
  projectStatus?: ProjectStatus
): ProjectSchedulePersistence {
  const schedule = normalizeProjectScheduleData(rawSchedule)
  const view = buildProjectScheduleView(schedule, projectStatus)

  const briefingRequestedAt = parseDate(schedule.briefingRequestedAt)
  const briefingValidatedAt = parseDate(schedule.briefingValidatedAt)
  const awaitingClientSince = parseDate(schedule.awaitingClientSince)
  const lastResolvedDelay = [...schedule.delayEvents]
    .sort((a, b) => b.resolvedAt.localeCompare(a.resolvedAt))[0]

  return {
    executionBusinessDays: schedule.executionBusinessDays,
    executionStartAt: view.executionStartAt,
    briefingRequestedAt,
    briefingValidatedAt,
    deliveryForecastAt: view.currentForecastDate,
    suspendedAt: view.suspensionStartedAt,
    abandonedAt: view.abandonedAt,
    lastClientDependencyAt: awaitingClientSince,
    lastClientResponseAt: lastResolvedDelay
      ? new Date(lastResolvedDelay.resolvedAt)
      : briefingValidatedAt,
    clientDelayCalendarDays: view.clientDelayCalendarDays,
    clientDelayBusinessDays: view.clientDelayBusinessDays,
  }
}

export function getExecutionDaysLabel(days: number | null) {
  if (!days || days <= 0) return "Prazo não definido"
  return `${days} ${days === 1 ? "dia útil" : "dias úteis"}`
}

export function buildTimelineNarrative(days: number | null) {
  if (!days || days <= 0) {
    return "Prazo contratual a definir, com contagem iniciada somente após a validação do briefing e envio dos ativos obrigatórios."
  }

  return `Estimativa de ${days} dias úteis para conclusão total, com início da contagem apenas após a validação do briefing e do envio dos ativos obrigatórios pelo cliente. O cronograma é monitorado em tempo real pela plataforma e pode ser recalculado automaticamente conforme a regra contratual de atraso do cliente.`
}
