import { beforeEach, describe, expect, it, vi } from "vitest"

const prismaProjectFindMany = vi.fn()

vi.mock("@/src/lib/prisma", () => ({
  default: {
    project: {
      findMany: prismaProjectFindMany,
    },
  },
}))

describe("MAGUI Connect bonus flow", () => {
  beforeEach(() => {
    prismaProjectFindMany.mockReset()
  })

  it("returns requestable access immediately when the user already has access", async () => {
    const { getOwnMaguiConnectAccessState } = await import(
      "@/src/lib/maguiConnectData"
    )

    const state = await getOwnMaguiConnectAccessState("user_1", true)

    expect(state).toEqual({ mode: "REQUESTABLE" })
    expect(prismaProjectFindMany).not.toHaveBeenCalled()
  })

  it("reads the pending bonus state from structured project data", async () => {
    prismaProjectFindMany.mockResolvedValue([
      {
        id: "project_1",
        name: "Projeto Bolinhos",
        status: "DESIGN",
        scheduleData: {
          includesMaguiConnectBonus: true,
          maguiConnectBonusStatus: "PENDING_RELEASE",
        },
        invoices: [
          {
            installments: [{ status: "PAID" }, { status: "PENDING" }],
          },
        ],
      },
    ])

    const { getOwnMaguiConnectAccessState } = await import(
      "@/src/lib/maguiConnectData"
    )

    const state = await getOwnMaguiConnectAccessState("user_2", false)

    expect(state).toEqual({
      mode: "BONUS_PENDING",
      projectId: "project_1",
      projectName: "Projeto Bolinhos",
      awaitingLaunch: true,
      awaitingPayment: true,
    })
  })

  it("ignores projects whose structured bonus has already been released", async () => {
    prismaProjectFindMany.mockResolvedValue([
      {
        id: "project_1",
        name: "Projeto Bolinhos",
        status: "LAUNCHED",
        scheduleData: {
          includesMaguiConnectBonus: true,
          maguiConnectBonusStatus: "RELEASED",
        },
        invoices: [
          {
            installments: [{ status: "PAID" }],
          },
        ],
      },
    ])

    const { getOwnMaguiConnectAccessState } = await import(
      "@/src/lib/maguiConnectData"
    )

    const state = await getOwnMaguiConnectAccessState("user_3", false)

    expect(state).toEqual({ mode: "REQUESTABLE" })
  })
})
