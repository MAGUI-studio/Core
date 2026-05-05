"use client"
import { useTranslations } from "next-intl"

import { WarningCircleIcon } from "@phosphor-icons/react"

import { markActionItemAsCompletedAction } from "@/src/lib/actions/project-briefing.actions"
import { cn } from "@/src/lib/utils/utils"

import { StepId, stepsConfig } from "@/src/hooks/use-briefing-form"

interface BriefingSidebarProps {
  projectId: string
  currentStepId: StepId
  onStepClick: (id: StepId) => void
  isFieldMissing: (id: string) => boolean
  showErrors: boolean
  currentIndex: number
}

export function BriefingSidebar({
  projectId,
  currentStepId,
  onStepClick,
  isFieldMissing,
  showErrors,
  currentIndex,
}: BriefingSidebarProps) {
  const t = useTranslations("Briefing")

  const handleStepClick = async (id: StepId) => {
    if (
      ["businessDescription", "brandTone", "businessGoals"].includes(
        currentStepId
      )
    ) {
      if (!isFieldMissing(currentStepId)) {
        await markActionItemAsCompletedAction(projectId, "negócio")
      }
    }
    onStepClick(id)
  }

  return (
    <aside className="w-full xl:w-64 shrink-0 flex flex-col gap-12">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary">
          {t("onboarding_protocol")}
        </p>
        <p className="text-xs font-medium leading-relaxed">
          {t("description")}
        </p>
      </div>
      <nav className="relative flex flex-col gap-6">
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border/40" />
        {stepsConfig.map((item, i) => {
          const active = item.id === currentStepId
          const done = currentIndex > i
          const error = showErrors && isFieldMissing(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleStepClick(item.id)}
              className="group relative flex items-center gap-5 text-left outline-none"
            >
              <div
                className={cn(
                  "relative z-10 size-3 rounded-full transition-all",
                  active
                    ? "bg-brand-primary ring-4 ring-brand-primary/20 scale-125"
                    : done
                      ? "bg-brand-primary"
                      : "bg-muted-foreground/20 group-hover:bg-muted-foreground/40",
                  error && !active && "bg-destructive ring-destructive/20"
                )}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-[9px] font-bold uppercase tracking-[0.3em]",
                      active || done
                        ? "text-brand-primary"
                        : "text-muted-foreground/30",
                      error && !active && "text-destructive"
                    )}
                  >
                    0{i + 1}
                  </span>
                  {error && (
                    <WarningCircleIcon
                      size={14}
                      weight="fill"
                      className="text-destructive animate-pulse"
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-widest mt-1 truncate",
                    active
                      ? "text-foreground"
                      : done
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground/30",
                    error && !active && "text-destructive/70"
                  )}
                >
                  {t(`steps.${item.id}.label`)}
                </span>
              </div>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
