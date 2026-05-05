import * as React from "react"

import { DashboardActionItem } from "@/src/types/dashboard"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ActionItemsWidget } from "@/src/components/common/ActionItemsWidget"

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

describe("ActionItemsWidget", () => {
  it("renders pending items by default", () => {
    const items = [
      { id: "1", title: "Task 1", status: "PENDING", project: { name: "P1" } },
      {
        id: "2",
        title: "Task 2",
        status: "COMPLETED",
        project: { name: "P2" },
      },
    ]
    render(
      <ActionItemsWidget items={items as unknown as DashboardActionItem[]} />
    )

    expect(screen.getByText("Task 1")).toBeInTheDocument()
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument()
  })

  it("returns empty div when no pending items", () => {
    const items = [
      {
        id: "2",
        title: "Task 2",
        status: "COMPLETED",
        project: { name: "P2" },
      },
    ]
    const { container } = render(
      <ActionItemsWidget items={items as unknown as DashboardActionItem[]} />
    )
    // O componente retorna <div /> se não houver itens pendentes
    expect(container.firstChild).not.toBeNull()
    expect(container.querySelectorAll("section")).toHaveLength(0)
  })
})
