import * as React from "react"

import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Acesso",
  description: "Entrada segura no dashboard MAGUI.studio.",
  path: "/sign-in",
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return children
}
