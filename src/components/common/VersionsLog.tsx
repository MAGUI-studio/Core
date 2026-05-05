"use client"

import { useTranslations } from "next-intl"

import { DashboardVersion } from "@/src/types/dashboard"
import {
  ArrowSquareOut,
  ChartBar,
  Eye,
  Lightning,
  Rocket,
  ShieldCheck,
} from "@phosphor-icons/react"

import { cn } from "@/src/lib/utils/utils"

interface VersionsLogProps {
  versions: DashboardVersion[]
}

export function VersionsLog({ versions }: VersionsLogProps): React.JSX.Element {
  const t = useTranslations("Versions")

  if (versions.length === 0) return <div />

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-brand-primary"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <section className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-12 bg-border/40" />
        <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground/90">
          {t("title")}
        </h3>
      </div>

      <div className="space-y-12">
        {versions.map((version) => (
          <div key={version.id} className="group relative">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/5 text-brand-primary">
                    <Rocket weight="duotone" size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                      {version.name}
                    </h4>
                    <span className="font-mono text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                      Lançamento:{" "}
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {version.description && (
                  <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/60 border-l border-border/40 pl-5">
                    {version.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-6 md:items-end">
                {version.deployUrl && (
                  <a
                    href={version.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary hover:opacity-70 transition-all"
                  >
                    Abrir Preview
                    <ArrowSquareOut size={14} weight="bold" />
                  </a>
                )}

                <div className="flex gap-4">
                  {[
                    {
                      key: "performance",
                      score: version.scorePerformance,
                      icon: Lightning,
                    },
                    {
                      key: "accessibility",
                      score: version.scoreAccessibility,
                      icon: ShieldCheck,
                    },
                    {
                      key: "best_practices",
                      score: version.scoreBestPractices,
                      icon: ChartBar,
                    },
                    { key: "seo", score: version.scoreSEO, icon: Eye },
                  ].map(
                    (item) =>
                      item.score !== null && (
                        <div
                          key={item.key}
                          className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                          title={t(`scores.${item.key}`)}
                        >
                          <item.icon
                            size={16}
                            weight="duotone"
                            className={getScoreColor(item.score || 0)}
                          />
                          <span
                            className={cn(
                              "font-mono text-[10px] font-black",
                              getScoreColor(item.score || 0)
                            )}
                          >
                            {item.score}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12 h-[1px] w-full bg-border/20 group-last:hidden" />
          </div>
        ))}
      </div>
    </section>
  )
}
