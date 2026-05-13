"use client"

import * as React from "react"

import { CalendarCheckIcon, InfoIcon, WarningIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"

import { cn } from "@/src/lib/utils/utils"

interface ProjectDelayImpactProps {
  initialForecastDate: Date | null
  currentForecastDate: Date | null
  clientDelayBusinessDays: number
  delayMultiplier: number
}

export function ProjectDelayImpact({
  initialForecastDate,
  currentForecastDate,
  clientDelayBusinessDays,
  delayMultiplier,
}: ProjectDelayImpactProps): React.JSX.Element | null {
  if (!initialForecastDate || !currentForecastDate) return null

  const hasDelay = clientDelayBusinessDays > 0

  return (
    <div className="flex flex-col gap-8 rounded-4xl bg-muted/30 p-8 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
            Rigor Técnico & Prazos
          </h4>
          <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
            Impacto no Cronograma
          </h3>
        </div>
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl",
            hasDelay
              ? "bg-amber-500/10 text-amber-600"
              : "bg-green-500/10 text-green-600"
          )}
        >
          {hasDelay ? (
            <WarningIcon weight="duotone" className="size-7" />
          ) : (
            <CalendarCheckIcon weight="duotone" className="size-7" />
          )}
        </div>
      </div>

      <div className="relative mt-6 h-24 w-full px-2">
        {/* Timeline Line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-foreground/5" />

        {/* Initial Point */}
        <div className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col items-center">
          <div className="size-3 rounded-full bg-muted-foreground/20" />
          <div className="absolute top-6 flex flex-col items-center whitespace-nowrap">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
              Início Estimado
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/60">
              {format(initialForecastDate, "dd/MM/yy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Current Point */}
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center">
          <div className="size-4 rounded-full bg-brand-primary" />
          <div className="absolute top-6 flex flex-col items-center whitespace-nowrap">
            <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">
              Previsão Atual
            </span>
            <span className="text-[10px] font-bold">
              {format(currentForecastDate, "dd/MM/yy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Delay Bridge */}
        {hasDelay && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 origin-left rounded-full bg-amber-500/10"
            style={{ width: "100%" }}
          />
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-amber-500/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <WarningIcon className="size-4 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">
              Atraso do Cliente
            </span>
          </div>
          <p className="text-3xl font-black text-amber-700">
            +{clientDelayBusinessDays} dias úteis
          </p>
          <p className="mt-2 text-[10px] font-medium leading-relaxed text-amber-700/50">
            Tempo acumulado aguardando briefing, ativos ou aprovações pendentes.
          </p>
        </div>

        <div className="rounded-3xl bg-brand-primary/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <InfoIcon className="size-4 text-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/60">
              Regra de Escalonamento
            </span>
          </div>
          <p className="text-3xl font-black text-brand-primary">
            1:{delayMultiplier}
          </p>
          <p className="mt-2 text-[10px] font-medium leading-relaxed text-brand-primary/50">
            Cada dia de atraso do cliente impacta em {delayMultiplier} dias no
            cronograma total de engenharia.
          </p>
        </div>
      </div>
    </div>
  )
}
