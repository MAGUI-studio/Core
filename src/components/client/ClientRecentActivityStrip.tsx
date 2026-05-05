import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  FolderOpen,
  NewspaperClipping,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr"

import { toHref } from "@/src/lib/utils/navigation"

import { ClientEmptyState } from "./ClientEmptyState"
import { ClientSectionHeader } from "./ClientSectionHeader"

interface ActivityItem {
  id: string
  title: string
  type: "update" | "approval" | "file" | "task"
  projectName: string
  createdAt: Date | string
  href: string
}

interface ClientRecentActivityStripProps {
  activities: ActivityItem[]
}

export async function ClientRecentActivityStrip({
  activities,
}: ClientRecentActivityStripProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home.activity")
  const tEmpty = await getTranslations(
    "Dashboard.project_detail.empty_states.recent_activity"
  )

  const iconMap = {
    update: NewspaperClipping,
    approval: CheckCircle,
    file: FolderOpen,
    task: NotePencil,
  }

  return (
    <section className="flex flex-col gap-6">
      <ClientSectionHeader
        eyebrow={tEmpty("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
      />
      <div className="overflow-hidden rounded-4xl border border-border/25 bg-muted/5">
        {activities.length === 0 ? (
          <ClientEmptyState
            title={tEmpty("title")}
            description={t("empty")}
            icon={NewspaperClipping}
          />
        ) : (
          activities.map((item, index) => {
            const Icon = iconMap[item.type]
            return (
              <Link
                key={item.id}
                href={toHref(item.href)}
                className={`flex items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-background/70 sm:px-8 ${
                  index !== activities.length - 1
                    ? "border-b border-border/10"
                    : ""
                }`}
              >
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/40 text-brand-primary shadow-sm ring-1 ring-border/20">
                    <Icon weight="duotone" className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <p className="truncate font-heading text-lg font-black uppercase tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {item.projectName} •{" "}
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground/30" />
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}
