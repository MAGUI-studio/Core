"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { UserRole } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  FileArrowUp,
  FileText,
  FolderOpen,
  NotePencil,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export type ActivityKind =
  | "approval"
  | "project"
  | "asset"
  | "briefing"
  | "timeline"
  | "system"

export interface AdminActivityFeedItem {
  id: string
  action: string
  summary: string
  createdAt: string | Date
  actorName: string | null
  actorRole: UserRole | null
  projectName: string | null
  entityType: string
  kind: ActivityKind
  href:
    | string
    | {
        pathname: "/admin/projects/[id]"
        params: { id: string }
        query?: Record<string, string>
      }
}

function getActivityPresentation(kind: ActivityKind) {
  switch (kind) {
    case "approval":
      return {
        icon: CheckCircle,
        iconClassName: "text-foreground/80",
      }
    case "asset":
      return {
        icon: FileArrowUp,
        iconClassName: "text-foreground/80",
      }
    case "briefing":
      return {
        icon: FileText,
        iconClassName: "text-foreground/80",
      }
    case "project":
      return {
        icon: FolderOpen,
        iconClassName: "text-foreground/80",
      }
    case "timeline":
      return {
        icon: NotePencil,
        iconClassName: "text-foreground/80",
      }
    default:
      return {
        icon: WarningCircle,
        iconClassName: "text-muted-foreground/75",
      }
  }
}

function formatRelativeMoment(
  value: string | Date,
  t: (key: string) => string
): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))

  if (minutes < 60) {
    return `${minutes} ${t("time.minute")} ${t("time.ago")}`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours} ${t("time.hour")} ${t("time.ago")}`
  }

  const days = Math.round(hours / 24)
  if (days < 7) {
    return `${days} ${t("time.day")} ${t("time.ago")}`
  }

  return date.toLocaleDateString()
}

export function AdminActivityFeed({
  items,
}: {
  items: AdminActivityFeedItem[]
}): React.JSX.Element {
  const t = useTranslations("Admin.activity_feed")
  const [activeKind, setActiveKind] = React.useState<"all" | ActivityKind>(
    "all"
  )

  const kindLabels: Record<ActivityKind, string> = {
    approval: t("kinds.approval"),
    project: t("kinds.project"),
    asset: t("kinds.asset"),
    briefing: t("kinds.briefing"),
    timeline: t("kinds.timeline"),
    system: t("kinds.system"),
  }

  const visibleItems = React.useMemo(
    () =>
      items.filter((item) => activeKind === "all" || item.kind === activeKind),
    [activeKind, items]
  )

  const totalsByKind = React.useMemo(
    () =>
      items.reduce<Record<ActivityKind, number>>(
        (acc, item) => {
          acc[item.kind] += 1
          return acc
        },
        {
          approval: 0,
          project: 0,
          asset: 0,
          briefing: 0,
          timeline: 0,
          system: 0,
        }
      ),
    [items]
  )

  return (
    <section className="flex flex-col gap-8">
      <CardHeader className="px-0 pb-0">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <CardTitle className="font-heading text-[2rem] font-black uppercase tracking-tight text-foreground">
              {t("title")}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground/60">
              {t("description")}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant={activeKind === "all" ? "default" : "ghost"}
              className="h-auto rounded-full border-0 bg-transparent px-0 py-0 text-[10px] font-black uppercase tracking-[0.22em] text-foreground shadow-none hover:bg-transparent hover:text-foreground/70"
              onClick={() => setActiveKind("all")}
            >
              {t("filter_all")}
              <span className="ml-2 text-[9px] text-muted-foreground/55">
                {items.length}
              </span>
            </Button>

            {(
              [
                "approval",
                "project",
                "asset",
                "briefing",
                "timeline",
                "system",
              ] as const
            ).map((kind) => (
              <Button
                key={kind}
                type="button"
                variant={activeKind === kind ? "default" : "ghost"}
                className="h-auto rounded-full border-0 bg-transparent px-0 py-0 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/55 shadow-none hover:bg-transparent hover:text-foreground/70"
                onClick={() => setActiveKind(kind)}
              >
                {kindLabels[kind]}
                <span className="ml-2 text-[9px] text-muted-foreground/45">
                  {totalsByKind[kind]}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 px-0 pt-0">
        {visibleItems.length === 0 ? (
          <div className="py-10 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            {t("empty")}
          </div>
        ) : (
          visibleItems.map((item) => {
            const presentation = getActivityPresentation(item.kind)
            const Icon = presentation.icon

            return (
              <article
                key={item.id}
                className="flex flex-col gap-4 py-1 md:flex-row md:items-start md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center">
                    <Icon
                      className={`size-5 ${presentation.iconClassName}`}
                      weight="duotone"
                    />
                  </div>

                  <div className="grid gap-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                        {kindLabels[item.kind]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/35">
                        {item.projectName || t("kinds.system")}
                      </span>
                    </div>

                    <p className="max-w-3xl text-[1.05rem] font-black tracking-tight text-foreground">
                      {item.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/60">
                      <span>
                        {item.actorName || t("kinds.system")}
                        {item.actorRole ? ` - ${item.actorRole}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockCounterClockwise className="size-3.5" />
                        {formatRelativeMoment(item.createdAt, t)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  className="h-auto self-start rounded-full border-0 bg-transparent px-0 py-0 text-[10px] font-black uppercase tracking-[0.18em] text-foreground shadow-none hover:bg-transparent hover:text-foreground/70"
                >
                  <Link href={item.href as never}>
                    {t("open")}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </article>
            )
          })
        )}
      </CardContent>
    </section>
  )
}
