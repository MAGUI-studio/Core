import * as React from "react"

import { getTranslations } from "next-intl/server"

import {
  ChartLineUp,
  ClockCountdown,
  FolderOpen,
  Users,
} from "@phosphor-icons/react/dist/ssr"

import { Card, CardContent } from "@/src/components/ui/card"

import { getAdminDashboardSummary } from "@/src/lib/admin-data"

interface DashboardStatsWidgetProps {
  userId: string
}

export async function DashboardStatsWidget({
  userId,
}: DashboardStatsWidgetProps) {
  const t = await getTranslations("Dashboard")
  const stats = await getAdminDashboardSummary(userId)

  const items = [
    {
      label: t("clients.stats.active_clients"),
      value: stats.totalClients,
      hint: t("clients.stats.base_registered"),
      icon: Users,
    },
    {
      label: t("clients.stats.active_projects"),
      value: stats.activeProjectsCount,
      hint: "vários concluídos",
      icon: FolderOpen,
    },
    {
      label: t("clients.stats.pending_approvals"),
      value: stats.pendingApprovalsCount,
      hint: t("clients.stats.review_today"),
      icon: ClockCountdown,
    },
    {
      label: t("clients.stats.open_leads"),
      value: stats.activeLeadsCount,
      hint: t("clients.stats.unread_notifications", {
        count: stats.unreadNotificationsCount,
      }),
      icon: ChartLineUp,
    },
  ]

  return (
    <section className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="group flex flex-col gap-5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-brand-primary/5 text-brand-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-brand-primary/20">
              <item.icon className="size-7" weight="duotone" />
            </div>
            <div className="h-px w-full max-w-[40px] bg-border/20 group-hover:bg-brand-primary/40 group-hover:scale-x-125 transition-all duration-500" />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 transition-colors group-hover:text-brand-primary/60">
              {item.label}
            </p>
            <p className="font-heading text-6xl font-black tracking-tighter text-foreground leading-none">
              {item.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/25 group-hover:text-muted-foreground/40 transition-colors">
              {item.hint}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
