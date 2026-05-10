"use client"

import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { ArrowRight, CalendarDots } from "@phosphor-icons/react/dist/ssr"
import { addDays, isSameDay, startOfDay } from "date-fns"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export interface AdminAgendaItem {
  id: string
  title: string
  dateLabel: string
  dateValue?: string | Date
  context: string
  kind: "forecast" | "task" | "lead"
  href:
    | string
    | {
        pathname: "/admin/projects/[id]" | "/admin/crm"
        params?: { id: string }
      }
}

export function AdminOperationsAgenda({
  items,
}: {
  items: AdminAgendaItem[]
}): React.JSX.Element {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)

  const [activeKind, setActiveKind] = React.useState<
    "all" | AdminAgendaItem["kind"]
  >("all")
  const [sortBy, setSortBy] = React.useState<"date" | "module">("date")

  const getItemDate = React.useCallback(
    (item: AdminAgendaItem) => {
      if (item.dateValue) {
        return new Date(item.dateValue)
      }

      const match = item.dateLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/)

      if (!match) {
        return today
      }

      const [, day, month, year] = match
      return new Date(Number(year), Number(month) - 1, Number(day))
    },
    [today]
  )

  const filteredItems = React.useMemo(
    () =>
      items.filter((item) => activeKind === "all" || item.kind === activeKind),
    [items, activeKind]
  )

  const sortedItems = React.useMemo(() => {
    const sorted = [...filteredItems]
    if (sortBy === "module") {
      return sorted.sort((a, b) => a.kind.localeCompare(b.kind))
    }
    return sorted.sort(
      (a, b) => getItemDate(a).getTime() - getItemDate(b).getTime()
    )
  }, [filteredItems, sortBy, getItemDate])

  const groupedItems = React.useMemo(
    () => ({
      today: sortedItems.filter((item) => isSameDay(getItemDate(item), today)),
      tomorrow: sortedItems.filter((item) =>
        isSameDay(getItemDate(item), tomorrow)
      ),
      upcoming: sortedItems.filter((item) => {
        const itemDate = getItemDate(item)
        return !isSameDay(itemDate, today) && !isSameDay(itemDate, tomorrow)
      }),
    }),
    [getItemDate, sortedItems, today, tomorrow]
  )

  const sections = [
    { id: "today", title: "Hoje", items: groupedItems.today },
    { id: "tomorrow", title: "Amanha", items: groupedItems.tomorrow },
    { id: "upcoming", title: "Proximos dias", items: groupedItems.upcoming },
  ]

  return (
    <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                Agenda operacional
              </CardTitle>
              <CardDescription>
                Previsoes, retornos e compromissos previstos.
              </CardDescription>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-border/30 bg-background/40 p-1">
              <Button
                variant={sortBy === "date" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-full px-3 text-[9px] font-black uppercase tracking-widest"
                onClick={() => setSortBy("date")}
              >
                Data
              </Button>
              <Button
                variant={sortBy === "module" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 rounded-full px-3 text-[9px] font-black uppercase tracking-widest"
                onClick={() => setSortBy("module")}
              >
                Modulo
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
              Tudo
            </Button>
            <Button
              type="button"
              variant={activeKind === "forecast" ? "default" : "outline"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setActiveKind("forecast")}
            >
              Previsoes
            </Button>
            <Button
              type="button"
              variant={activeKind === "task" ? "default" : "outline"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setActiveKind("task")}
            >
              Tarefas
            </Button>
            <Button
              type="button"
              variant={activeKind === "lead" ? "default" : "outline"}
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
              onClick={() => setActiveKind("lead")}
            >
              Leads
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {filteredItems.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Nenhum compromisso previsto para os proximos 7 dias.
          </div>
        ) : (
          sections.map((section) =>
            section.items.length > 0 ? (
              <div key={section.id} className="grid gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                        <CalendarDots className="size-5" weight="duotone" />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-base font-black tracking-tight text-foreground">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                          {item.dateLabel}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground/75">
                          {item.context}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                    >
                      <Link href={item.href as never}>
                        Abrir
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : null
          )
        )}
      </CardContent>
    </Card>
  )
}
