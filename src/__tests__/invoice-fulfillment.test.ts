import { beforeEach, describe, expect, it, vi } from "vitest"

const createAuditLog = vi.fn()
const createNotificationsMany = vi.fn()

vi.mock("@/src/lib/project-governance", () => ({
  createAuditLog,
  createNotificationsMany,
}))

describe("invoice fulfillment", () => {
  beforeEach(() => {
    createAuditLog.mockReset()
    createNotificationsMany.mockReset()
  })

  it("releases the bonus when the launched project is fully paid", async () => {
    const { releaseProjectBonusIfEligible } =
      await import("@/src/lib/invoice-fulfillment")
    type ReleaseProjectBonusTx = Parameters<
      typeof releaseProjectBonusIfEligible
    >[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          status: "LAUNCHED",
          clientId: "client_1",
          client: {
            id: "client_1",
            name: "Cliente Teste",
            canAccessMaguiConnect: false,
          },
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
            sourceProposalId: "proposal_1",
          },
          invoices: [
            {
              installments: [{ status: "PAID" }, { status: "WAIVED" }],
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: {
        update: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([{ id: "admin_1" }]),
      },
      maguiConnectProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "profile_1" }),
      },
    } as unknown as ReleaseProjectBonusTx

    const released = await releaseProjectBonusIfEligible(tx, "project_1")

    expect(released).toBe(true)
    expect(tx.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project_1" },
        data: expect.objectContaining({
          scheduleData: expect.objectContaining({
            maguiConnectBonusStatus: "RELEASED",
          }),
        }),
      })
    )
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "client_1" },
      data: { canAccessMaguiConnect: true },
    })
    expect(tx.maguiConnectProfile.create).toHaveBeenCalled()
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "magui_connect.bonus_released",
        entityId: "project_1",
      }),
      tx
    )
    expect(createNotificationsMany).toHaveBeenCalled()
  })

  it("does not release the bonus while there are open installments", async () => {
    const { releaseProjectBonusIfEligible } =
      await import("@/src/lib/invoice-fulfillment")
    type ReleaseProjectBonusTx = Parameters<
      typeof releaseProjectBonusIfEligible
    >[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          status: "LAUNCHED",
          clientId: "client_1",
          client: {
            id: "client_1",
            name: "Cliente Teste",
            canAccessMaguiConnect: false,
          },
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
          },
          invoices: [
            {
              installments: [{ status: "PAID" }, { status: "PENDING" }],
            },
          ],
        }),
        update: vi.fn(),
      },
      user: {
        update: vi.fn(),
        findMany: vi.fn(),
      },
      maguiConnectProfile: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    } as unknown as ReleaseProjectBonusTx

    const released = await releaseProjectBonusIfEligible(tx, "project_1")

    expect(released).toBe(false)
    expect(tx.project.update).not.toHaveBeenCalled()
    expect(createAuditLog).not.toHaveBeenCalled()
    expect(createNotificationsMany).not.toHaveBeenCalled()
  })

  it("preserves direct-purchase access while releasing the project bonus", async () => {
    const { releaseProjectBonusIfEligible } =
      await import("@/src/lib/invoice-fulfillment")
    type ReleaseProjectBonusTx = Parameters<
      typeof releaseProjectBonusIfEligible
    >[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          status: "LAUNCHED",
          clientId: "client_1",
          client: {
            id: "client_1",
            name: "Cliente Teste",
            canAccessMaguiConnect: true,
          },
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
            sourceProposalId: "proposal_1",
          },
          invoices: [
            {
              installments: [{ status: "PAID" }],
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: {
        update: vi.fn(),
        findMany: vi.fn().mockResolvedValue([{ id: "admin_1" }]),
      },
      maguiConnectProfile: {
        findUnique: vi.fn().mockResolvedValue({ id: "profile_1" }),
        create: vi.fn(),
      },
    } as unknown as ReleaseProjectBonusTx

    const released = await releaseProjectBonusIfEligible(tx, "project_1")

    expect(released).toBe(true)
    expect(tx.user.update).not.toHaveBeenCalled()
    expect(tx.maguiConnectProfile.create).not.toHaveBeenCalled()
  })

  it("cancels the pending bonus when the project is abandoned", async () => {
    const { cancelProjectBonusIfNeeded } =
      await import("@/src/lib/invoice-fulfillment")
    type CancelProjectBonusTx = Parameters<typeof cancelProjectBonusIfNeeded>[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          clientId: "client_1",
          status: "ABANDONED",
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
            sourceProposalId: "proposal_1",
          },
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as CancelProjectBonusTx

    const cancelled = await cancelProjectBonusIfNeeded(tx, "project_1")

    expect(cancelled).toBe(true)
    expect(tx.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project_1" },
        data: expect.objectContaining({
          scheduleData: expect.objectContaining({
            maguiConnectBonusStatus: "CANCELLED",
          }),
        }),
      })
    )
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "magui_connect.bonus_cancelled",
        entityId: "project_1",
      }),
      tx
    )
  })

  it("allows admin to release a pending bonus manually before launch", async () => {
    const { forceReleaseProjectBonus } =
      await import("@/src/lib/invoice-fulfillment")
    type ForceReleaseProjectBonusTx = Parameters<
      typeof forceReleaseProjectBonus
    >[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          status: "DESIGN",
          clientId: "client_1",
          client: {
            id: "client_1",
            name: "Cliente Teste",
            canAccessMaguiConnect: false,
          },
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
            sourceProposalId: "proposal_1",
          },
          invoices: [
            {
              installments: [{ status: "PENDING" }],
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: {
        update: vi.fn().mockResolvedValue({}),
      },
      maguiConnectProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "profile_1" }),
      },
    } as unknown as ForceReleaseProjectBonusTx

    const released = await forceReleaseProjectBonus(tx, "project_1", "admin_1")

    expect(released).toBe(true)
    expect(tx.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scheduleData: expect.objectContaining({
            maguiConnectBonusStatus: "RELEASED",
          }),
        }),
      })
    )
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "magui_connect.bonus_released_manual",
        actorId: "admin_1",
      }),
      tx
    )
  })

  it("allows admin to cancel a pending bonus manually without abandoning the project", async () => {
    const { forceCancelProjectBonus } =
      await import("@/src/lib/invoice-fulfillment")
    type ForceCancelProjectBonusTx = Parameters<
      typeof forceCancelProjectBonus
    >[0]

    const tx = {
      project: {
        findUnique: vi.fn().mockResolvedValue({
          id: "project_1",
          name: "Projeto Bolinhos",
          clientId: "client_1",
          status: "ENGINEERING",
          scheduleData: {
            includesMaguiConnectBonus: true,
            maguiConnectBonusStatus: "PENDING_RELEASE",
            sourceProposalId: "proposal_1",
          },
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as ForceCancelProjectBonusTx

    const cancelled = await forceCancelProjectBonus(tx, "project_1", "admin_1")

    expect(cancelled).toBe(true)
    expect(tx.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scheduleData: expect.objectContaining({
            maguiConnectBonusStatus: "CANCELLED",
          }),
        }),
      })
    )
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "magui_connect.bonus_cancelled_manual",
        actorId: "admin_1",
      }),
      tx
    )
  })
})
