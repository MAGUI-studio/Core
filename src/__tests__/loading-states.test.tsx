import * as React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import CrmLoading from "@/src/app/[locale]/(dashboard)/admin/crm/loading"
import ProjectDetailLoading from "@/src/app/[locale]/(dashboard)/admin/projects/[id]/loading"
import DashboardLoading from "@/src/app/[locale]/(dashboard)/loading"

describe("route loading states", () => {
  it("renders dashboard skeleton blocks", () => {
    render(<DashboardLoading />)
    expect(
      screen.getAllByRole("generic", { hidden: true }).length
    ).toBeGreaterThan(0)
  })

  it("renders CRM skeleton board", () => {
    render(<CrmLoading />)
    expect(
      screen.getAllByRole("generic", { hidden: true }).length
    ).toBeGreaterThan(0)
  })

  it("renders project detail skeleton", () => {
    render(<ProjectDetailLoading />)
    expect(
      screen.getAllByRole("generic", { hidden: true }).length
    ).toBeGreaterThan(0)
  })
})
