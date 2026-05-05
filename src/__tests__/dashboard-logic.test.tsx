import * as React from "react"

import { DashboardProject } from "@/src/types/dashboard"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DashboardSummary } from "@/src/components/common/DashboardSummary"
import { Header } from "@/src/components/common/Header"

import {
  approveUpdateAction,
  rejectUpdateAction,
} from "@/src/lib/actions/project.actions"

// Mocks robustos para Vitest
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (!key) return ""
    const parts = key.split(".")
    return parts[parts.length - 1]
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => "/",
}))

vi.mock("@/src/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}))

vi.mock("@/src/lib/actions/project.actions", () => ({
  approveUpdateAction: vi.fn(() => Promise.resolve({ success: true })),
  rejectUpdateAction: vi.fn(() => Promise.resolve({ success: true })),
  createBriefingNoteAction: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockPendingApprovals = [
  {
    count: 1,
    projectId: "p1",
    projectName: "Alpha Project",
    lastUpdateId: "u1",
    lastUpdateTitle: "Delivery One",
    lastUpdateDescription: "Desc 1",
    attachments: [],
  },
  {
    count: 1,
    projectId: "p2",
    projectName: "Beta Project",
    lastUpdateId: "u2",
    lastUpdateTitle: "Delivery Two",
    lastUpdateDescription: "Desc 2",
    attachments: [],
  },
]

describe("Dashboard Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Header Banner", () => {
    it("renders first pending item and navigates", () => {
      render(<Header pendingApprovals={mockPendingApprovals} />)

      expect(screen.getByText(/Alpha Project/)).toBeInTheDocument()
      expect(screen.getByText(/Delivery One/)).toBeInTheDocument()

      const buttons = screen.getAllByRole("button")
      fireEvent.click(buttons[1]) // Botão Next (seta direita)

      expect(screen.getByText(/Beta Project/)).toBeInTheDocument()
    })

    it("handles approval flow", async () => {
      render(<Header pendingApprovals={mockPendingApprovals} />)

      fireEvent.click(screen.getByText("cta"))

      const approveBtn = screen.getByRole("button", { name: /approve/i })
      fireEvent.click(approveBtn)

      await waitFor(() => {
        expect(approveUpdateAction).toHaveBeenCalledWith("u1", "p1")
      })
    })

    it("handles rejection flow with feedback", async () => {
      render(<Header pendingApprovals={mockPendingApprovals} />)

      fireEvent.click(screen.getByText("cta"))

      // Feedback required for rejection
      const textarea = screen.getByPlaceholderText(/placeholder/)
      fireEvent.change(textarea, { target: { value: "Needs more contrast." } })

      const rejectBtn = screen.getByText("send_feedback")
      fireEvent.click(rejectBtn)

      await waitFor(() => {
        expect(rejectUpdateAction).toHaveBeenCalledWith({
          updateId: "u1",
          projectId: "p1",
          feedback: "Needs more contrast.",
        })
      })
    })
  })

  describe("Dashboard Summary & Feed", () => {
    const mockProject = {
      id: "p1",
      name: "Test",
      status: "STRATEGY",
      progress: 50,
      updates: Array.from({ length: 8 }, (_, i) => ({
        id: `u${i}`,
        title: `Update ${i}`,
        createdAt: new Date().toISOString(),
        approvalStatus: "APPROVED",
        requiresApproval: false,
        attachments: [],
      })),
      assets: [],
      actionItems: [],
      briefingNotes: [],
    }

    it("handles feed expansion", () => {
      render(
        <DashboardSummary
          project={mockProject as unknown as DashboardProject}
        />
      )

      expect(screen.getByText("Update 4")).toBeInTheDocument()
      expect(screen.queryByText("Update 5")).not.toBeInTheDocument()

      fireEvent.click(screen.getByText(/see_more/))
      expect(screen.getByText("Update 7")).toBeInTheDocument()

      fireEvent.click(screen.getByText(/see_less/))
      expect(screen.queryByText("Update 5")).not.toBeInTheDocument()
    })

    it("renders assets list and empty state", () => {
      // Empty state
      const { rerender } = render(
        <DashboardSummary
          project={mockProject as unknown as DashboardProject}
        />
      )
      expect(screen.getByText("waiting_files")).toBeInTheDocument()

      // List state
      const projectWithAssets = {
        ...mockProject,
        assets: [
          {
            id: "a1",
            name: "Brand.pdf",
            url: "#",
            visibility: "CLIENT",
            order: 0,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      rerender(
        <DashboardSummary
          project={projectWithAssets as unknown as DashboardProject}
        />
      )
      expect(screen.getByText("Brand.pdf")).toBeInTheDocument()
    })
  })
})
