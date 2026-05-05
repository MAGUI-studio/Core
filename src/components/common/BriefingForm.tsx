"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Prisma } from "@/src/generated/client"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import {
  StepId,
  stepsConfig,
  useBriefingForm,
} from "@/src/hooks/use-briefing-form"

import { BriefingSidebar } from "./briefing/BriefingSidebar"
import { BriefingStepEditor } from "./briefing/BriefingStepEditor"
import { BriefingSuccess } from "./briefing/BriefingSuccess"

export function BriefingForm({
  projectId,
  initialData,
}: {
  projectId: string
  initialData?: Record<string, unknown> | null
}) {
  const t = useTranslations("Briefing")

  const [currentStepId, setCurrentStepId] = React.useState<StepId>(
    stepsConfig[0].id
  )

  const {
    formData,
    setFormData,
    currentStepIndex,
    isFinished,
    isLoading,
    showErrors,
    isFieldMissing,
    handleNext,
    handleSubmit,
  } = useBriefingForm(
    projectId,
    initialData as Prisma.JsonValue,
    currentStepId,
    setCurrentStepId
  )

  const handleNextStable = React.useCallback(async () => {
    await handleNext()
  }, [handleNext])

  const handleSubmitStable = React.useCallback(async () => {
    await handleSubmit()
  }, [handleSubmit])

  const handleStepChange = (id: StepId) => {
    setCurrentStepId(id)
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepId(stepsConfig[currentStepIndex - 1].id)
    }
  }

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (currentStepIndex < stepsConfig.length - 1) handleNextStable()
        else handleSubmitStable()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [currentStepIndex, handleNextStable, handleSubmitStable])

  if (isFinished) return <BriefingSuccess />

  const currentStep = stepsConfig[currentStepIndex]
  const val = formData[currentStepId as keyof typeof formData]

  let len = 0
  if (currentStepId === "logos") {
    const l = val as {
      primary?: { url: string } | null
      secondary?: { url: string } | null
    } | null
    len = l?.primary || l?.secondary ? 1 : 0
  } else {
    len = typeof val === "string" ? val.trim().length : 0
  }

  const missing = currentStep.min > 0 && len < currentStep.min

  return (
    <div className="flex flex-col-reverse xl:flex-row w-full gap-16 xl:gap-32 py-10">
      <BriefingSidebar
        projectId={projectId}
        currentStepId={currentStepId}
        onStepClick={handleStepChange}
        isFieldMissing={isFieldMissing}
        showErrors={showErrors}
        currentIndex={currentStepIndex}
      />

      <section className="flex-1 flex flex-col min-w-0 md:pb-32 xl:pb-0">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
              <h2 className="font-heading text-4xl font-black uppercase tracking-tight md:text-6xl xl:text-[5rem] xl:leading-[1.1] flex items-start gap-4">
                {t(`steps.${currentStepId}.label`)}
              </h2>
              <span>
                {currentStep.min > 0 ? (
                  <span className="text-red-500 text-2xl md:text-4xl">*</span>
                ) : (
                  <span className="text-xs md:text-sm font-normal mt-4 lowercase tracking-normal!">
                    {t("optional")}
                  </span>
                )}
              </span>
            </div>

            <div className="mt-6 flex items-start justify-between gap-8">
              <p className="text-base md:text-lg text-muted-foreground/60 max-w-2xl border-l-2 border-brand-primary/30 pl-4">
                {t(`steps.${currentStepId}.placeholder`)}
              </p>
              {missing && (
                <div className="shrink-0 flex flex-col items-end">
                  <span className="font-mono text-[10px] font-bold text-brand-primary tracking-widest">
                    {len}/{currentStep.min}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
                    {t("min_required")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <BriefingStepEditor
            projectId={projectId}
            currentStepId={currentStepId}
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-border/20 pt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className="group flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 hover:text-foreground transition-all"
          >
            <ArrowLeftIcon size={16} /> {t("back_button")}
          </button>
          <div className="flex items-center gap-4">
            {currentStepIndex < stepsConfig.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextStable}
                className="h-14 bg-foreground px-10 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background hover:bg-brand-primary hover:text-white transition-all"
              >
                {t("next_step")} <ArrowRightIcon size={16} className="ml-3" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitStable}
                disabled={isLoading}
                className="h-14 px-12 font-mono text-[10px] font-black uppercase tracking-[0.3em] bg-brand-primary text-white transition-all"
              >
                {isLoading && (
                  <CircleNotchIcon size={16} className="mr-3 animate-spin" />
                )}{" "}
                {t("submit")}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
