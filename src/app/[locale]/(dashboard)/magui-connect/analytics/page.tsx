import type React from "react"

import { getTranslations } from "next-intl/server"

import {
  ArrowUpRight,
  CursorClick,
  LinkSimple,
  Star,
} from "@phosphor-icons/react/dist/ssr"

import { MaguiConnectLockedState } from "@/src/components/client/maguiConnect/MaguiConnectLockedState"

import { getOwnMaguiConnectAnalytics } from "@/src/lib/maguiConnectData"
import { getCurrentAppUser } from "@/src/lib/project-governance"

export async function generateMetadata() {
  const t = await getTranslations("MaguiConnect")
  return {
    title: `${t("pageTitle")} | ${t("analyticsTitle")}`,
  }
}

export default async function MaguiConnectAnalyticsPage() {
  const user = await getCurrentAppUser()
  if (!user) return null

  if (!user.canAccessMaguiConnect) {
    return <MaguiConnectLockedState />
  }

  const t = await getTranslations("MaguiConnect")
  const analytics = await getOwnMaguiConnectAnalytics(user.id)
  const highestClicks = analytics.topLink?.clickCount ?? 0

  return (
    <main className="min-h-full bg-background px-6 py-12 lg:px-12 lg:py-16">
      <section className="space-y-12">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
            {t("analyticsEyebrow")}
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] lg:text-5xl">
            {t("analyticsTitle")}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground/75">
            {t("analyticsDescription")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<CursorClick size={22} weight="duotone" />}
            label={t("analyticsTotalClicks")}
            value={analytics.totalClicks}
          />
          <MetricCard
            icon={<LinkSimple size={22} weight="duotone" />}
            label={t("analyticsTotalLinks")}
            value={analytics.totalLinks}
          />
          <MetricCard
            icon={<Star size={22} weight="duotone" />}
            label={t("analyticsTopLink")}
            value={analytics.topLink?.label ?? t("analyticsNoTopLink")}
          />
        </div>

        <section className="rounded-[2rem] border border-border/30 bg-muted/10 p-6 backdrop-blur-md lg:p-8">
          <div className="flex flex-col gap-3 border-b border-border/20 pb-6">
            <h2 className="text-2xl font-black tracking-tight">
              {t("analyticsLinksRanking")}
            </h2>
            <p className="text-sm text-muted-foreground/70">
              {t("analyticsLinksRankingDescription")}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {analytics.links.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border/30 bg-background/40 px-6 py-16 text-center">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                  {t("analyticsNoLinks")}
                </p>
              </div>
            ) : (
              analytics.links.map((link, index) => {
                const percentage =
                  highestClicks > 0
                    ? (link.clickCount / highestClicks) * 100
                    : 0

                return (
                  <article
                    key={link.id}
                    className="rounded-[1.5rem] border border-border/25 bg-background/60 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary/70">
                            #{index + 1}
                          </span>
                          {link.isFeatured ? (
                            <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                              {t("analyticsFeatured")}
                            </span>
                          ) : null}
                          {link.section?.title ? (
                            <span className="rounded-full border border-border/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                              {link.section.title}
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1">
                          <h3 className="truncate text-lg font-black tracking-tight text-foreground">
                            {link.label}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground/60">
                            {link.url}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand-primary transition-all"
                            style={{ width: `${Math.max(percentage, 6)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex min-w-40 items-center justify-between gap-4 lg:block lg:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/55">
                          {t("analyticsClicksLabel")}
                        </p>
                        <p className="text-3xl font-black tracking-[-0.05em] text-foreground">
                          {link.clickCount}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="text-brand-primary">{icon}</div>
        <ArrowUpRight
          size={18}
          weight="bold"
          className="text-muted-foreground/30"
        />
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/55">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-foreground">
        {value}
      </p>
    </div>
  )
}
