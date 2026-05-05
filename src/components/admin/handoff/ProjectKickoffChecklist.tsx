"use client"

import * as React from "react"

import { Prisma } from "@/src/generated/client"
import { CheckCircle, Clock, Info } from "@phosphor-icons/react"

import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

import { cn } from "@/src/lib/utils/utils"

interface ProjectKickoffChecklistProps {
  kickoff: Prisma.ProjectKickoffChecklistGetPayload<Record<string, never>>
}

export function ProjectKickoffChecklist({
  kickoff,
}: ProjectKickoffChecklistProps) {
  const checklistItems = [
    {
      label: "Contrato Assinado",
      completed: kickoff.contractSigned,
      key: "contract",
    },
    {
      label: "Briefing Preenchido",
      completed: kickoff.briefingCompleted,
      key: "briefing",
    },
    {
      label: "Logos e Ativos Enviados",
      completed: kickoff.brandAssetsSent,
      key: "assets",
    },
    {
      label: "Acessos Técnicos Recebidos",
      completed: kickoff.accessReceived,
      key: "access",
    },
    {
      label: "Reunião de Kickoff",
      completed: kickoff.firstMeetingDone,
      key: "meeting",
    },
  ]

  const completedCount = checklistItems.filter((i) => i.completed).length
  const progress = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <Card className="overflow-hidden rounded-4xl border-brand-primary/10 bg-brand-primary/[0.02]">
      <CardHeader className="border-b border-brand-primary/5 bg-brand-primary/[0.03] pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <CheckCircle weight="fill" className="size-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-xl font-black uppercase tracking-tight">
                Kickoff Operacional
              </CardTitle>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Checklist de Entrada
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="rounded-full bg-brand-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20">
              {progress}% Concluído
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="grid gap-4">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-4 transition-all",
                item.completed
                  ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                  : "border-border/40 bg-background/40"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border transition-all",
                    item.completed
                      ? "border-emerald-500/40 bg-emerald-500 text-white"
                      : "border-border/60 bg-muted/10 text-muted-foreground/40"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle weight="bold" className="size-4" />
                  ) : (
                    <Clock className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-heading text-sm font-black uppercase tracking-tight",
                    item.completed
                      ? "text-emerald-900/80 dark:text-emerald-100/80"
                      : "text-foreground/60"
                  )}
                >
                  {item.label}
                </span>
              </div>

              {item.completed ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-[8px] font-black uppercase tracking-widest text-emerald-600"
                >
                  Pronto
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-[8px] font-black uppercase tracking-widest text-amber-600"
                >
                  Pendente
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-dashed border-brand-primary/20 bg-brand-primary/[0.01] p-6">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Info weight="fill" className="size-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
              Próximos Passos
            </h5>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              Garanta que todos os itens acima estejam marcados como pronto
              antes de mover o projeto para a fase de Arquitetura. O
              preenchimento do briefing e envio de logos é responsabilidade do
              cliente via portal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
