"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import { ArrowRight, ChartLineUp } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

type CommercialHealthItem = {
  id: string
  companyName: string
  contactName: string | null
  statusLabel: string
  score: number
  tone: "healthy" | "attention" | "risk"
  summary: string
}

const toneStyles = {
  healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  attention: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  risk: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

export function AdminCommercialHealthList({
  items,
}: {
  items: CommercialHealthItem[]
}): React.JSX.Element {
  const t = useTranslations("Admin.commercial_health")

  const toneLabels = {
    healthy: t("tones.healthy"),
    attention: t("tones.attention"),
    risk: t("tones.risk"),
  }

  return (
    <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 pt-6">
        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            {t("empty")}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <ChartLineUp className="size-5" weight="duotone" />
                </div>

                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em] ${toneStyles[item.tone]}`}
                    >
                      {toneLabels[item.tone]}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                      {item.statusLabel}
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-black tracking-tight text-foreground">
                      {item.companyName}
                    </p>
                    {item.contactName ? (
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                        {item.contactName}
                      </p>
                    ) : null}
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground/75">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:flex-col md:items-end">
                <div className="rounded-full border border-border/30 bg-background/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/75">
                  Score {item.score}
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  <Link
                    href={{
                      pathname: "/admin/crm",
                      query: { lead: item.id },
                    }}
                  >
                    {t("open_lead")}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-end">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
          >
            <Link href="/admin/crm">
              {t("view_full")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
