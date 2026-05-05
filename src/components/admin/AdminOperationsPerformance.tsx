"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

type Metric = {
  label: string
  value: string
  hint: string
}

type DistributionItem = {
  label: string
  value: number
}

type SilentProject = {
  id: string
  name: string
  clientName: string
  daysWithoutUpdate: number
}

export function AdminOperationsPerformance({
  metrics,
  projectDistribution,
  leadDistribution,
  silentProjects,
}: {
  metrics: Metric[]
  projectDistribution: DistributionItem[]
  leadDistribution: DistributionItem[]
  silentProjects: SilentProject[]
}): React.JSX.Element {
  const maxProjectValue = Math.max(
    1,
    ...projectDistribution.map((item) => item.value)
  )
  const maxLeadValue = Math.max(
    1,
    ...leadDistribution.map((item) => item.value)
  )

  return (
    <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
          Performance da operação
        </CardTitle>
        <CardDescription>
          Leituras objetivas para entender ritmo de aprovação, conversão e carga
          atual.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-foreground">
                {metric.value}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                {metric.hint}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Projetos por fase
            </p>
            {projectDistribution.map((item) => (
              <div key={item.label} className="grid gap-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/40">
                  <div
                    className="h-2 rounded-full bg-brand-primary"
                    style={{
                      width: `${(item.value / maxProjectValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Leads por etapa
            </p>
            {leadDistribution.map((item) => (
              <div key={item.label} className="grid gap-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/40">
                  <div
                    className="h-2 rounded-full bg-foreground/75"
                    style={{ width: `${(item.value / maxLeadValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Projetos sem update
            </p>
            {silentProjects.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-border/35 bg-background/40 px-4 py-8 text-center text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                Tudo em dia
              </div>
            ) : (
              silentProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-[1.25rem] border border-border/25 bg-background/50 px-4 py-3"
                >
                  <p className="text-sm font-black tracking-tight text-foreground">
                    {project.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                    {project.clientName}
                  </p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                    {project.daysWithoutUpdate} dias sem update
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
