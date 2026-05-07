"use client"

import * as React from "react"

import { Question } from "@phosphor-icons/react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"

type DelayReasonTooltipItem = {
  id: string
  title: string
  description: string
  businessDaysAdded: number
  isActive: boolean
}

interface ProjectScheduleDelayTooltipProps {
  reasons: DelayReasonTooltipItem[]
}

export function ProjectScheduleDelayTooltip({
  reasons,
}: ProjectScheduleDelayTooltipProps) {
  if (reasons.length === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 transition hover:bg-amber-500/15"
            aria-label="Ver motivos do acréscimo no prazo"
          >
            <Question weight="bold" className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="max-w-sm flex-col items-start gap-2 rounded-3xl px-4 py-3 text-left"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-background/70">
            Motivos do acréscimo
          </p>
          <div className="flex flex-col gap-2">
            {reasons.map((reason) => (
              <div key={reason.id} className="space-y-1">
                <p className="text-xs font-black leading-snug text-background">
                  {reason.title}
                </p>
                <p className="text-xs font-medium leading-snug text-background/85">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
