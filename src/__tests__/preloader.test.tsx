import * as React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Preloader } from "@/src/components/common/Preloader"

describe("Preloader", () => {
  it("renders with studio name", () => {
    render(<Preloader siteName="MAGUI.studio" />)

    expect(screen.getByText("M")).toBeInTheDocument()
    expect(screen.getByText(".")).toBeInTheDocument()
    expect(screen.getByText("s")).toBeInTheDocument()
  })

  it("calls onComplete after the timeout", async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()

    render(<Preloader onComplete={onComplete} />)

    // Initially not called
    expect(onComplete).not.toHaveBeenCalled()

    // Fast-forward 1100ms
    vi.advanceTimersByTime(1100)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
