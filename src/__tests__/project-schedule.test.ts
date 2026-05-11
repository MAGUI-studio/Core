import { describe, expect, it } from "vitest"

import { ProjectStatus } from "@/src/generated/client"

import {
  addBusinessDays,
  buildInitialProjectScheduleData,
  buildProjectSchedulePersistence,
  buildProjectScheduleView,
  diffBusinessDays,
  getProjectRenewalSignals,
  proposalIncludesMaguiConnectBonus,
  resolveProjectStatusFromSchedule,
  setProjectOperationalStatus,
  syncProjectScheduleFromBriefing,
} from "@/src/lib/project-schedule"

describe("Project Schedule", () => {
  it("persists structured MAGUI Connect bonus metadata", () => {
    const schedule = buildInitialProjectScheduleData({
      executionBusinessDays: 20,
      includesMaguiConnectBonus: true,
      sourceProposalId: "proposal_123",
    })

    expect(proposalIncludesMaguiConnectBonus(schedule)).toBe(true)
    expect(schedule.sourceProposalId).toBe("proposal_123")
    expect(schedule.maguiConnectBonusStatus).toBe("PENDING_RELEASE")
  })

  it("derives ON_HOLD_CLIENT when briefing stays pending after suspension window", () => {
    const requestedAt = new Date("2026-05-01T12:00:00.000Z")
    const now = new Date("2026-05-10T12:00:00.000Z")
    const schedule = {
      ...buildInitialProjectScheduleData({
        executionBusinessDays: 20,
        now: requestedAt,
      }),
      briefingRequestedAt: requestedAt.toISOString(),
      awaitingClientSince: requestedAt.toISOString(),
    }

    const synced = syncProjectScheduleFromBriefing(
      schedule,
      {},
      ProjectStatus.DESIGN,
      now
    )
    const view = buildProjectScheduleView(synced, ProjectStatus.DESIGN)

    expect(view.executionState).toBe("ON_HOLD_CLIENT")
    expect(resolveProjectStatusFromSchedule(synced, ProjectStatus.DESIGN)).toBe(
      ProjectStatus.ON_HOLD_CLIENT
    )
  })

  it("restores the prior operational status after leaving hold", () => {
    const base = buildInitialProjectScheduleData({
      executionBusinessDays: 20,
    })
    const withOperationalStatus = setProjectOperationalStatus(
      base,
      ProjectStatus.ENGINEERING
    )
    const resumed = {
      ...withOperationalStatus,
      executionState: "ACTIVE" as const,
      briefingValidatedAt: "2026-05-02T12:00:00.000Z",
      assetsValidatedAt: "2026-05-02T12:00:00.000Z",
      materialValidatedAt: "2026-05-02T12:00:00.000Z",
      executionStartAt: "2026-05-02T12:00:00.000Z",
      awaitingClientSince: null,
      suspensionStartedAt: null,
      abandonedAt: null,
    }

    expect(
      resolveProjectStatusFromSchedule(resumed, ProjectStatus.ON_HOLD_CLIENT)
    ).toBe(ProjectStatus.ENGINEERING)
  })

  it("builds persistence fields from derived schedule state", () => {
    const base = buildInitialProjectScheduleData({
      executionBusinessDays: 15,
      now: new Date("2026-05-01T12:00:00.000Z"),
    })
    const activeSchedule = syncProjectScheduleFromBriefing(
      base,
      {
        brandTone: "premium",
        visualReferences: ["clean"],
        businessGoals: "generate leads",
        primaryCta: "Solicitar proposta",
        targetAudience: "clinics",
        differentiators: "speed",
        logos: {
          primary: {
            url: "https://example.com/logo.png",
          },
        },
      },
      ProjectStatus.ARCHITECTURE,
      new Date("2026-05-03T12:00:00.000Z")
    )

    const persistence = buildProjectSchedulePersistence(
      activeSchedule,
      ProjectStatus.ARCHITECTURE
    )

    expect(persistence.executionBusinessDays).toBe(15)
    expect(persistence.executionStartAt).toBeInstanceOf(Date)
    expect(persistence.briefingValidatedAt).toBeInstanceOf(Date)
    expect(persistence.deliveryForecastAt).toBeInstanceOf(Date)
    expect(persistence.clientDelayCalendarDays).toBeGreaterThanOrEqual(0)
    expect(persistence.clientDelayBusinessDays).toBeGreaterThanOrEqual(0)
  })

  it("flags upcoming and suspension-risk renewal dates", () => {
    const schedule = {
      ...buildInitialProjectScheduleData({
        executionBusinessDays: 20,
      }),
      renewalCycleStartedAt: "2025-06-01T12:00:00.000Z",
      domainRenewalDueAt: "2026-05-20T12:00:00.000Z",
      hostingRenewalDueAt: "2026-05-01T12:00:00.000Z",
    }

    const signals = getProjectRenewalSignals(
      schedule,
      new Date("2026-05-10T12:00:00.000Z")
    )

    expect(signals).toHaveLength(2)
    expect(signals[0]).toMatchObject({
      kind: "HOSTING",
      status: "SUSPENSION_RISK",
    })
    expect(signals[1]).toMatchObject({
      kind: "DOMAIN",
      status: "UPCOMING",
    })
  })

  it("skips national and São José dos Campos holidays in business day calculations", () => {
    const beforeCityHoliday = new Date("2026-03-18T12:00:00.000-03:00")
    const afterOneBusinessDay = addBusinessDays(beforeCityHoliday, 1)
    const businessDays = diffBusinessDays(
      new Date("2026-03-18T12:00:00.000-03:00"),
      new Date("2026-03-23T12:00:00.000-03:00")
    )

    expect(afterOneBusinessDay.toISOString()).toBe(
      new Date("2026-03-20T12:00:00.000-03:00").toISOString()
    )
    expect(businessDays).toBe(2)
  })
})
