"use client"

import * as React from "react"

import {
  ActivityIcon,
  HandEyeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { cn } from "@/src/lib/utils/utils"

interface ProjectPerformanceHealthProps {
  scores: {
    performance: number | null
    accessibility: number | null
    bestPractices: number | null
    seo: number | null
  }
}

export function ProjectPerformanceHealth({
  scores,
}: ProjectPerformanceHealthProps): React.JSX.Element {
  const items = [
    {
      label: "Performance",
      value: scores.performance,
      icon: ActivityIcon,
    },
    {
      label: "Acessibilidade",
      value: scores.accessibility,
      icon: HandEyeIcon,
    },
    {
      label: "Práticas",
      value: scores.bestPractices,
      icon: ShieldCheckIcon,
    },
    {
      label: "SEO",
      value: scores.seo,
      icon: MagnifyingGlassIcon,
    },
  ]

  return (
    <div className="flex flex-col gap-6 rounded-4xl bg-muted/30 p-8 sm:p-10">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
          Auditoria Técnica
        </h4>
        <h3 className="font-heading text-xl font-black uppercase tracking-tight">
          Qualidade e Saúde
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-4 rounded-3xl bg-background/40 p-5 transition hover:bg-background/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/5 text-brand-primary">
                <item.icon className="size-5" weight="duotone" />
              </div>
              <span
                className={cn(
                  "text-sm font-black",
                  (item.value ?? 0) >= 90
                    ? "text-green-600"
                    : (item.value ?? 0) >= 50
                      ? "text-amber-600"
                      : "text-destructive"
                )}
              >
                {item.value !== null ? `${item.value}%` : "--"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                {item.label}
              </span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value ?? 0}%` }}
                  className={cn(
                    "h-full rounded-full",
                    (item.value ?? 0) >= 90
                      ? "bg-green-500"
                      : (item.value ?? 0) >= 50
                        ? "bg-amber-500"
                        : "bg-destructive"
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
