import type { ComponentProps } from "react"

import { Link } from "@/src/i18n/navigation"

export type AppHref = ComponentProps<typeof Link>["href"]

export function toHref(href: string): AppHref {
  return href as AppHref
}
