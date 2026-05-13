import * as React from "react"

import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/src/components/ui/button"

import { AdminFinancialMetrics } from "@/src/components/admin/dashboard/AdminFinancialMetrics"
import { DashboardActivityWidget } from "@/src/components/admin/dashboard/DashboardActivityWidget"
import { DashboardStatsWidget } from "@/src/components/admin/dashboard/DashboardStatsWidget"

import { isAdmin } from "@/src/lib/permissions"
import { getCurrentAppUser } from "@/src/lib/project-governance"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Painel Administrativo",
  description:
    "Painel administrativo da MAGUI.studio para gerenciar clientes, projetos, CRM, contratos, tickets e operação.",
  path: "/admin",
})

export default async function AdminPage(): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const t = await getTranslations("Admin")
  const user = await getCurrentAppUser()

  if (!user) return <div />

  return (
    <main className="flex flex-col gap-12 bg-background px-6 py-10 lg:px-12">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-primary">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading text-4xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-6xl">
          {t("title")}{" "}
          <span className="text-brand-primary">{t("subtitle")}</span>
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        <DashboardStatsWidget userId={user.id} />

        <div className="flex flex-col gap-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            Performance Financeira
          </h2>
          <AdminFinancialMetrics />
        </div>

        <div className="grid gap-10 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DashboardActivityWidget />
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-muted/10 p-8 backdrop-blur-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Acesso Rápido
            </h3>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                variant="outline"
                className="justify-start rounded-full border-border/40 py-6"
              >
                <Link href="/admin/clients">Gestão de Clientes</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start rounded-full border-border/40 py-6"
              >
                <Link href="/admin/projects">Gestão de Projetos</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start rounded-full border-border/40 py-6"
              >
                <Link href="/admin/crm">Pipeline Comercial</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start rounded-full border-border/40 py-6"
              >
                <Link href="/admin/support">Central de Atendimento</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
