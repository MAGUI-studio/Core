import { redirect } from "next/navigation"

import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "CRM",
  description: "Redirecionamento para a lista comercial da MAGUI.studio.",
  path: "/admin/crm/kanban",
})

export default function CRMKanbanPage(): never {
  redirect("/admin/crm")
}
