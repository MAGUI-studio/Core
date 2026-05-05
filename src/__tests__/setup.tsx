import * as React from "react"

import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}))

vi.mock("framer-motion", async () => {
  const React = await import("react")
  const motion = new Proxy(
    {},
    {
      get: (_target, key) => {
        return ({
          children,
          ...props
        }: {
          children?: React.ReactNode
        } & Record<string, unknown>) =>
          React.createElement(key as string, props, children)
      },
    }
  )

  return {
    motion,
    m: motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  }
})
