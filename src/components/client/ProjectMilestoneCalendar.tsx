"use client"

import * as React from "react"

import {
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  RocketLaunchIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Calendar } from "@/src/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

import { cn } from "@/src/lib/utils/utils"

export interface Milestone {
  date: Date
  title: string
  type: "update" | "milestone" | "deadline" | "forecast"
}

interface ProjectMilestoneCalendarProps {
  milestones: Milestone[]
}

export function ProjectMilestoneCalendar({
  milestones,
}: ProjectMilestoneCalendarProps): React.JSX.Element {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const modifiers = {
    milestone: milestones
      .filter((m) => m.type === "milestone" || m.type === "update")
      .map((m) => m.date),
    deadline: milestones.filter((m) => m.type === "deadline").map((m) => m.date),
    forecast: milestones.filter((m) => m.type === "forecast").map((m) => m.date),
  }

  const modifiersStyles = {
    milestone: {
      color: "white",
      backgroundColor: "var(--brand-primary)",
      borderRadius: "100%",
    },
    deadline: {
      color: "white",
      backgroundColor: "var(--destructive)",
      borderRadius: "100%",
    },
    forecast: {
      color: "white",
      backgroundColor: "var(--success)",
      borderRadius: "100%",
    },
  }

  const selectedMilestones = milestones.filter(
    (m) => date && format(m.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  )

  return (
    <div className="rounded-4xl bg-muted/30 p-8 sm:p-10">
      <div className="flex flex-col gap-1 mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
          Cronograma Evolutivo
        </h4>
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-black uppercase tracking-tight">
            Calendário de Marcos
          </h3>
          <ClockCounterClockwiseIcon className="size-5 text-muted-foreground/40" />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center lg:justify-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-3xl bg-background/40 p-4"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-background/20 p-6">
            <h4 className="mb-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Legenda
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-brand-primary" />
                <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/70">
                  Atualizações / Marcos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-destructive" />
                <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/70">
                  Prazos de Tarefas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/70">
                  Previsão de Entrega
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-background/40 p-6">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-brand-primary">
              {date
                ? format(date, "dd 'de' MMMM", { locale: ptBR })
                : "Selecione um dia"}
            </h4>
            {selectedMilestones.length > 0 ? (
              <div className="flex flex-col gap-5">
                {selectedMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/50",
                        milestone.type === "forecast"
                          ? "text-success"
                          : milestone.type === "deadline"
                            ? "text-destructive"
                            : "text-brand-primary"
                      )}
                    >
                      {milestone.type === "forecast" ? (
                        <RocketLaunchIcon weight="fill" className="size-5" />
                      ) : milestone.type === "deadline" ? (
                        <WarningIcon weight="fill" className="size-5" />
                      ) : (
                        <CheckCircleIcon weight="fill" className="size-5" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">
                        {milestone.title}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground/50">
                        {milestone.type === "forecast"
                          ? "Meta final de lançamento"
                          : milestone.type === "deadline"
                            ? "Data limite para seu retorno"
                            : "Evolução registrada pelo time"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-medium italic text-muted-foreground/30">
                Nenhum marco registrado para esta data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
