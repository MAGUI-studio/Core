import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  ClockCountdown,
  NotePencil,
  Warning,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"

import type { AppHref } from "@/src/lib/utils/navigation"

interface ClientNextActionCardProps {
  action: {
    type:
      | "payment"
      | "briefing"
      | "approval"
      | "task_overdue"
      | "task"
      | "new_update"
      | "default"
    title: string
    description: string
    href: AppHref
    projectName?: string
  }
}

export async function ClientNextActionCard({
  action,
}: ClientNextActionCardProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home.cta")

  const iconMap = {
    payment: Warning,
    briefing: NotePencil,
    approval: CheckCircle,
    task_overdue: Warning,
    task: ClockCountdown,
    new_update: ArrowRight,
    default: ArrowRight,
  }

  const Icon = iconMap[action.type]

  return (
    <Card className="overflow-hidden rounded-4xl border-brand-primary/20 bg-brand-primary/5 shadow-2xl shadow-brand-primary/5">
      <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between lg:p-10">
        <div className="flex gap-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
            <Icon weight="duotone" className="size-7" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary/60">
              {action.projectName ? `${action.projectName} • ` : ""}
              {t(`type.${action.type}`)}
            </p>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
              {action.title}
            </h2>
            <p className="max-w-md text-sm font-medium leading-relaxed text-muted-foreground/75">
              {action.description}
            </p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="h-14 rounded-full bg-brand-primary px-8 font-mono text-[11px] font-black uppercase tracking-[0.24em] text-white transition-all hover:scale-105 active:scale-95"
        >
          <Link href={action.href}>
            {t(`label.${action.type}`)}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
