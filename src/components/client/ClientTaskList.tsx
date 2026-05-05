"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import { ClientPortalActionItem } from "@/src/types/client-portal"
import {
  ArrowRight,
  ChatTeardropDots,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/src/components/ui/badge"

import { ClientEmptyState } from "./ClientEmptyState"

interface ClientTaskListProps {
  tasks: ClientPortalActionItem[]
}
export function ClientTaskList({ tasks }: ClientTaskListProps) {
  const t = useTranslations("Dashboard.project_detail.empty_states.tasks")
  const tCommon = useTranslations("Dashboard.common")
  const tPage = useTranslations("Dashboard.project_detail.pages.tasks")

  if (tasks.length === 0) {
    return (
      <ClientEmptyState
        title={t("title")}
        description={t("description")}
        icon={ChatTeardropDots}
      />
    )
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
        const Content = (
          <article className="group rounded-[1.75rem] border border-border/20 bg-muted/5 p-5 transition hover:-translate-y-0.5 hover:border-brand-primary/25 hover:bg-background sm:p-6 lg:p-7">
            <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] sm:size-16 ${
                  isOverdue
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-brand-primary/10 text-brand-primary"
                }`}
              >
                {isOverdue ? (
                  <WarningCircle weight="duotone" className="size-8" />
                ) : (
                  <Clock weight="duotone" className="size-8" />
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                    {tPage("badge")}
                  </p>
                  {isOverdue && (
                    <Badge
                      variant="outline"
                      className="h-6 rounded-full border-amber-500/30 bg-amber-500/5 px-3 text-[8px] font-black uppercase tracking-widest text-amber-600"
                    >
                      {tPage("overdue")}
                    </Badge>
                  )}
                </div>
                <h2 className="font-heading text-2xl font-black uppercase leading-none tracking-tight text-foreground sm:text-3xl">
                  {task.title}
                </h2>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75">
                  {task.description || tCommon("no_description")}
                </p>

                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock
                      weight="bold"
                      className={`size-3.5 ${isOverdue ? "text-amber-500/60" : "text-brand-primary/60"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? "text-amber-600/80" : "text-brand-primary/80"}`}
                    >
                      {tPage("due_date")}:{" "}
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/40 text-muted-foreground/40 transition group-hover:border-brand-primary/30 group-hover:bg-brand-primary group-hover:text-white">
                <ArrowRight weight="bold" className="size-5" />
              </div>
            </div>
          </article>
        )

        if (task.ctaPath) {
          return (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            <Link key={task.id} href={task.ctaPath as any}>
              {Content}
            </Link>
          )
        }

        return <div key={task.id}>{Content}</div>
      })}
    </div>
  )
}
