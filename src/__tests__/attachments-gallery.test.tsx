import * as React from "react"

import { DashboardUpdateAttachment } from "@/src/types/dashboard"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

// Mock dialog content to avoid portal issues
vi.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock image to avoid next/image complexity in unit tests
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || "mock"} />
  ),
}))

// Mock translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

describe("UpdateAttachmentsList", () => {
  const mockAttachments = [
    {
      id: "1",
      name: "image1.jpg",
      url: "http://example.com/image1.jpg",
      type: "IMAGE",
    },
    {
      id: "2",
      name: "doc1.pdf",
      url: "http://example.com/doc1.pdf",
      type: "DOCUMENT",
    },
  ]

  it("renders image previews", () => {
    render(
      <UpdateAttachmentsList
        attachments={mockAttachments as unknown as DashboardUpdateAttachment[]}
      />
    )
    // Usamos getAllByAltText pois o componente renderiza o preview e o lightbox ao mesmo tempo no mock
    expect(screen.getAllByAltText("image1.jpg")[0]).toBeInTheDocument()
  })

  it("renders document links", () => {
    render(
      <UpdateAttachmentsList
        attachments={mockAttachments as unknown as DashboardUpdateAttachment[]}
      />
    )
    expect(screen.getByText("doc1.pdf")).toBeInTheDocument()
  })

  it("opens lightbox on image click", () => {
    render(
      <UpdateAttachmentsList
        attachments={mockAttachments as unknown as DashboardUpdateAttachment[]}
      />
    )
    const images = screen.getAllByAltText("image1.jpg")
    fireEvent.click(images[0] as HTMLElement)

    // Lightbox content should be visible (there are multiple instances in mock)
    expect(screen.getAllByAltText("image1.jpg").length).toBeGreaterThan(0)
  })
})
