"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  ClockCountdown,
  FolderOpen,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export interface AdminAttentionItem {
  id: string
  title: string
  description: string
  href:
    | string
    | {
        pathname: "/admin/projects/[id]" | "/admin/crm"
        params?: { id: string }
      }
  kind: "approval" | "deadline" | "lead" | "project" | "task"
  priority: "high" | "medium"
}

const kindIcon = {
  approval: CheckCircle,
  deadline: ClockCountdown,
  lead: ChartLineUp,
  project: FolderOpen,
  task: NotePencil,
}

const priorityStyles = {
  high: "border-amber-500/20 bg-amber-500/[0.04]",
  medium: "border-border/30 bg-background/60",
}

export function AdminAttentionPanel({
  items,
}: {
  items: AdminAttentionItem[]
}): React.JSX.Element {
  const t = useTranslations("Admin.attention_panel")
  const [activeKind, setActiveKind] = React.useState<
    "all" | AdminAttentionItem["kind"]
  >("all")
  const [priorityFilter, setPriorityFilter] = React.useState<
    "all" | "high" | "medium"
  >("all")
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest">("newest")

  const kindLabels: Record<AdminAttentionItem["kind"], string> = {
    approval: t("kinds.approval"),
    deadline: t("kinds.deadline"),
    lead: t("kinds.lead"),
    project: t("kinds.project"),
    task: t("kinds.task"),
  }

  const visibleItems = React.useMemo(() => {
    const filtered = items.filter((item) => {
      const kindMatches = activeKind === "all" || item.kind === activeKind
      const priorityMatches =
        priorityFilter === "all" || item.priority === priorityFilter

      return kindMatches && priorityMatches
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") return 0 // Default order from server is newest
      return filtered.indexOf(b) - filtered.indexOf(a) // Simple reverse for oldest
    })
  }, [activeKind, items, priorityFilter, sortBy])

  const totalsByKind = React.useMemo(
    () =>
      items.reduce<Record<AdminAttentionItem["kind"], number>>(
        (acc, item) => {
          acc[item.kind] += 1
          return acc
        },
        {
          approval: 0,
          deadline: 0,
          lead: 0,
          project: 0,
          task: 0,
        }
      ),
    [items]
  )

  return (
    <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                {t("title")}
              </CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-border/30 bg-background/40 p-1">
              <Button
                variant={sortBy === "newest" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-full px-3 text-[9px] font-black uppercase tracking-widest"
                onClick={() => setSortBy("newest")}
              >
                {t("sort_newest")}
              </Button>
              <Button
                variant={sortBy === "oldest" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-full px-3 text-[9px] font-black uppercase tracking-widest"
                onClick={() => setSortBy("oldest")}
              >
                {t("sort_oldest")}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={activeKind === "all" ? "default" : "outline"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setActiveKind("all")}
            >
              {t("kinds.approval") === "Aprovações" ? "Tudo" : "All"}
              <span className="ml-2 text-[9px] opacity-70">{items.length}</span>
            </Button>

            {Object.entries(kindLabels).map(([kind, label]) => (
              <Button
                key={kind}
                type="button"
                variant={activeKind === kind ? "default" : "outline"}
                className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
                onClick={() =>
                  setActiveKind(kind as AdminAttentionItem["kind"])
                }
              >
                {label}
                <span className="ml-2 text-[9px] opacity-70">
                  {totalsByKind[kind as AdminAttentionItem["kind"]]}
                </span>
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={priorityFilter === "all" ? "secondary" : "ghost"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setPriorityFilter("all")}
            >
              {t("filter_all_urgencies")}
            </Button>
            <Button
              type="button"
              variant={priorityFilter === "high" ? "secondary" : "ghost"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setPriorityFilter("high")}
            >
              {t("filter_high_urgency")}
            </Button>
            <Button
              type="button"
              variant={priorityFilter === "medium" ? "secondary" : "ghost"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setPriorityFilter("medium")}
            >
              {t("filter_follow_up")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {visibleItems.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            {t("empty")}
          </div>
        ) : (
          visibleItems.map((item) => {
            const Icon = kindIcon[item.kind]

            return (
              <div
                key={item.id}
                className={`flex flex-col gap-4 rounded-[1.5rem] border p-5 md:flex-row md:items-center md:justify-between ${priorityStyles[item.priority]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-5" weight="duotone" />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {kindLabels[item.kind]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/35">
                        •
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {t(`priorities.${item.priority}`)}
                      </span>
                    </div>
                    <p className="text-base font-black tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground/75">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link href={item.href as never}>
                    {t("kinds.approval") === "Aprovações" ? "Abrir" : "Open"}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
