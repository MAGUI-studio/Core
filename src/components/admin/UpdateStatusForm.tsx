"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProjectStatus } from "@/src/generated/client"
import { CheckCircle, Gear } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Slider } from "@/src/components/ui/slider"

import { updateProjectStatusAction } from "@/src/lib/actions/project.actions"

interface UpdateStatusFormProps {
  projectId: string
  currentStatus: string
  currentProgress: number
}

export function UpdateStatusForm({
  projectId,
  currentStatus,
  currentProgress,
}: UpdateStatusFormProps) {
  const t = useTranslations("Admin.projects.details")
  const tStatus = useTranslations("Dashboard.status")
  const [isPending, setIsPending] = React.useState(false)
  const [progress, setProgress] = React.useState([currentProgress])
  const [status, setStatus] = React.useState(currentStatus)

  const handleUpdate = async () => {
    setIsPending(true)
    const formData = new FormData()
    formData.set("id", projectId)
    formData.set("status", status)
    formData.set("progress", progress[0].toString())

    await updateProjectStatusAction(formData)
    setIsPending(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
        Os campos marcados com <span className="text-red-500">*</span> são
        obrigatórios.
      </p>

      <FieldGroup className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Field>
          <FieldLabel className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("status_label")} <span className="text-red-500">*</span>
          </FieldLabel>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              size="lg"
              className="h-14 rounded-2xl border-border/40 bg-muted/10 font-sans font-bold uppercase tracking-widest text-foreground transition-all hover:bg-muted/20"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
              {[
                "STRATEGY",
                "ARCHITECTURE",
                "DESIGN",
                "ENGINEERING",
                "QA",
                "LAUNCHED",
              ].map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                >
                  {tStatus(s as ProjectStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <div className="mb-4 flex items-center justify-between">
            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {t("progress_label")} <span className="text-red-500">*</span>
            </FieldLabel>
            <span className="font-mono text-xs font-bold text-brand-primary">
              {progress[0]}%
            </span>
          </div>
          <div className="flex h-14 items-center px-2">
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={5}
              className="[&_[data-slot=slider-range]]:bg-brand-primary [&_[data-slot=slider-thumb]]:border-brand-primary [&_[data-slot=slider-track]]:bg-muted/20"
            />
          </div>
        </Field>
      </FieldGroup>

      <Button
        onClick={handleUpdate}
        disabled={isPending}
        className="h-14 w-full rounded-2xl font-sans font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-brand-primary/10 md:w-max md:px-12"
      >
        {isPending ? (
          <div className="flex items-center gap-3">
            <Gear weight="bold" className="size-5 animate-spin" />
            <span>{t("submitting")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CheckCircle weight="bold" className="size-5" />
            <span>{t("update_status")}</span>
          </div>
        )}
      </Button>
    </div>
  )
}
