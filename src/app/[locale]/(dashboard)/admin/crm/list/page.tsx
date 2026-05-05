import { redirect } from "next/navigation"

import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Lista CRM",
  description: "Redirecionamento para o CRM administrativo da MAGUI.studio.",
  path: "/admin/crm/list",
})

export default function CRMListPage(): never {
  redirect("/admin/crm")
}
