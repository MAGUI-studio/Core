"use client"

import { useTranslations } from "next-intl"

import { DashboardActionItem } from "@/src/types/dashboard"
import { ArrowRight, Clock, WarningCircle } from "@phosphor-icons/react"

interface ActionItemsWidgetProps {
  items: DashboardActionItem[]
}

export function ActionItemsWidget({
  items,
}: ActionItemsWidgetProps): React.JSX.Element {
  const t = useTranslations("ActionItems")

  if (items.length === 0) return <div />

  const pendingItems = items.filter((i) => i.status === "PENDING")

  if (pendingItems.length === 0) return <div />

  return (
    <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-8 bg-brand-primary/30" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
          {t("title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex items-center justify-between p-6 rounded-3xl border border-brand-primary/20 bg-brand-primary/5 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/8"
          >
            <div className="flex items-start gap-5">
              <div className="mt-1 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <WarningCircle
                  weight="fill"
                  size={20}
                  className="animate-pulse"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight text-foreground/90">
                  {item.title}
                </span>
                {item.description && (
                  <p className="mt-1 text-xs font-medium text-muted-foreground/60 leading-relaxed max-w-md">
                    {item.description}
                  </p>
                )}
                {item.dueDate && (
                  <div className="mt-3 flex items-center gap-2">
                    <Clock
                      size={12}
                      weight="bold"
                      className="text-brand-primary/40"
                    />
                    <span className="font-mono text-[9px] font-bold text-brand-primary/60 uppercase tracking-widest">
                      {t("due_date", {
                        date: new Date(item.dueDate).toLocaleDateString(),
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-4 flex size-10 items-center justify-center rounded-full border border-border/40 text-muted-foreground/30 transition-all group-hover:border-brand-primary/30 group-hover:text-brand-primary group-hover:translate-x-1">
              <ArrowRight size={18} weight="bold" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
