"use client"

import * as React from "react"

import { DashboardVersion } from "@/src/types/dashboard"
import {
  ArrowRight,
  GitBranch,
  TrendDown,
  TrendUp,
} from "@phosphor-icons/react"

type ScoreKey =
  | "scorePerformance"
  | "scoreAccessibility"
  | "scoreBestPractices"
  | "scoreSEO"

const scoreLabels: Record<ScoreKey, string> = {
  scorePerformance: "Performance",
  scoreAccessibility: "Acessibilidade",
  scoreBestPractices: "Boas práticas",
  scoreSEO: "SEO",
}

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function getScoreDelta(
  current: number | null,
  previous: number | null
): number {
  return (current ?? 0) - (previous ?? 0)
}

export function VersionComparisonPanel({
  versions,
}: {
  versions: DashboardVersion[]
}): React.JSX.Element {
  const [selectedVersionId, setSelectedVersionId] = React.useState(
    versions[0]?.id ?? ""
  )

  if (versions.length === 0) {
    return (
      <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <GitBranch weight="duotone" className="size-4 text-brand-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Versões e changelog
          </h3>
        </div>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/55">
          Nenhuma versão registrada ainda. Quando houver deploys ou entregas,
          esta área mostra evolução e comparação entre versões.
        </p>
      </section>
    )
  }

  const selectedIndex = versions.findIndex(
    (version) => version.id === selectedVersionId
  )
  const current = versions[selectedIndex] ?? versions[0]
  const previous = versions[selectedIndex + 1] ?? null

  return (
    <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:p-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch weight="duotone" className="size-4 text-brand-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Versões e changelog
            </h3>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/55">
            Compare a versão atual com a anterior e veja rapidamente o que mudou
            na entrega.
          </p>
        </div>

        <select
          value={current.id}
          onChange={(event) => setSelectedVersionId(event.target.value)}
          className="h-11 rounded-full border border-border/40 bg-background px-4 text-xs font-bold outline-none transition-colors focus:border-brand-primary"
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name} - {formatDate(version.createdAt)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <VersionCard title="Versão anterior" version={previous} muted />

        <div className="hidden items-center justify-center text-muted-foreground/35 lg:flex">
          <ArrowRight weight="bold" className="size-5" />
        </div>

        <VersionCard title="Versão selecionada" version={current} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {(Object.keys(scoreLabels) as ScoreKey[]).map((key) => {
          const delta = getScoreDelta(current[key], previous?.[key] ?? null)

          return (
            <div
              key={key}
              className="rounded-[1.25rem] border border-border/30 bg-background/55 p-4"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                {scoreLabels[key]}
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-2xl font-black text-foreground">
                  {current[key] ?? "--"}
                </span>
                {previous ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black ${
                      delta >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {delta >= 0 ? (
                      <TrendUp weight="duotone" className="size-3.5" />
                    ) : (
                      <TrendDown weight="duotone" className="size-3.5" />
                    )}
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function VersionCard({
  title,
  version,
  muted = false,
}: {
  title: string
  version: DashboardVersion | null
  muted?: boolean
}): React.JSX.Element {
  if (!version) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/35 p-5 text-sm font-medium text-muted-foreground/55">
        Sem versão anterior para comparar.
      </div>
    )
  }

  return (
    <article
      className={`rounded-[1.5rem] border border-border/35 bg-background/60 p-5 ${
        muted ? "opacity-75" : ""
      }`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
        {title}
      </p>
      <h4 className="mt-3 text-lg font-black tracking-tight text-foreground">
        {version.name}
      </h4>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground/45">
        {formatDate(version.createdAt)}
      </p>
      {version.description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/75">
          {version.description}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground/45">
          Sem changelog descrito.
        </p>
      )}
    </article>
  )
}
