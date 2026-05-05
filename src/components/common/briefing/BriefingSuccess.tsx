"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { CheckCircle } from "@phosphor-icons/react"

export function BriefingSuccess() {
  const t = useTranslations("Briefing")
  return (
    <div className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-8 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="flex size-24 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-2xl shadow-brand-primary/20">
        <CheckCircle size={48} weight="fill" />
      </div>
      <div className="max-w-lg space-y-4">
        <h2 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
          {t("success")}
        </h2>
        <p className="text-lg text-muted-foreground/60">
          {t("success_description")}
        </p>
      </div>
    </div>
  )
}
