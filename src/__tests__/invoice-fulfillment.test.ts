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
    const { releaseProjectBonusIfEligible } = await import(
      "@/src/lib/invoice-fulfillment"
    )

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
    } as any

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
    const { releaseProjectBonusIfEligible } = await import(
      "@/src/lib/invoice-fulfillment"
    )

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
    } as any

    const released = await releaseProjectBonusIfEligible(tx, "project_1")

    expect(released).toBe(false)
    expect(tx.project.update).not.toHaveBeenCalled()
    expect(createAuditLog).not.toHaveBeenCalled()
    expect(createNotificationsMany).not.toHaveBeenCalled()
  })

  it("cancels the pending bonus when the project is abandoned", async () => {
    const { cancelProjectBonusIfNeeded } = await import(
      "@/src/lib/invoice-fulfillment"
    )

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
    } as any

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
})
