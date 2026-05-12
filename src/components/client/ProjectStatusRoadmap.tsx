"use client"

import * as React from "react"

import { ProjectStatus } from "@/src/generated/client"
import {
  CodeIcon,
  MapTrifoldIcon,
  PaletteIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  StrategyIcon,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { cn } from "@/src/lib/utils/utils"

interface ProjectStatusRoadmapProps {
  currentStatus: ProjectStatus
  translations: Record<string, string>
}

const steps = [
  { id: ProjectStatus.STRATEGY, icon: StrategyIcon },
  { id: ProjectStatus.ARCHITECTURE, icon: MapTrifoldIcon },
  { id: ProjectStatus.DESIGN, icon: PaletteIcon },
  { id: ProjectStatus.ENGINEERING, icon: CodeIcon },
  { id: ProjectStatus.QA, icon: ShieldCheckIcon },
  { id: ProjectStatus.LAUNCHED, icon: RocketLaunchIcon },
]

export function ProjectStatusRoadmap({
  currentStatus,
  translations,
}: ProjectStatusRoadmapProps): React.JSX.Element {
  const currentIndex = steps.findIndex((step) => step.id === currentStatus)

  // Determine effective index for progress bar
  // If status is not in the linear flow (like ON_HOLD_CLIENT), we might want to stick to the last operational status
  // But for now, we assume currentStatus is one of the above for the roadmap.
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <div className="w-full px-4 py-12 sm:px-8">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border/40" />

        {/* Progress Line */}
        <motion.div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-brand-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${(effectiveIndex / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor:
                    isCompleted || isActive
                      ? "var(--brand-primary)"
                      : "var(--background)",
                  borderColor:
                    isCompleted || isActive
                      ? "var(--brand-primary)"
                      : "var(--border)",
                  color: isCompleted || isActive ? "white" : "var(--muted-foreground)",
                }}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors duration-500 sm:size-12",
                  isActive &&
                    "shadow-lg shadow-brand-primary/30 ring-4 ring-brand-primary/20"
                )}
              >
                <Icon
                  weight={isCompleted || isActive ? "fill" : "bold"}
                  className="size-5 sm:size-6"
                />

                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand-primary/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="absolute top-14 flex flex-col items-center text-center sm:top-16">
                <span
                  className={cn(
                    "whitespace-nowrap text-[8px] font-black uppercase tracking-widest sm:text-[10px]",
                    isActive ? "text-brand-primary" : "text-muted-foreground/60"
                  )}
                >
                  {translations[step.id] || step.id}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
