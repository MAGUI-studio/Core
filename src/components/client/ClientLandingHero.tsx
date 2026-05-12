"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  CheckCircle,
  ClockCountdown,
  FolderOpen,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import type { AppHref } from "@/src/lib/utils/navigation"

interface ClientLandingHeroAction {
  label: string
  href: AppHref
}

interface ClientLandingHeroMetric {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
}

interface ClientLandingHeroProps {
  eyebrow: string
  title: string
  description: string
  statusLabel?: string
  primaryAction?: ClientLandingHeroAction
  secondaryAction?: ClientLandingHeroAction
  metrics?: ClientLandingHeroMetric[]
  variant?: "home" | "project" | "section"
}

export function ClientLandingHero({
  eyebrow,
  title,
  description,
  statusLabel,
  primaryAction,
  secondaryAction,
  metrics = [],
  variant = "home",
}: ClientLandingHeroProps): React.JSX.Element {
  const isProject = variant === "project"
  const t = useTranslations("Dashboard.project_detail.hero")

  return (
    <section className="relative overflow-hidden border-b border-border/20">
      <div className="mx-auto grid w-full max-w-440 gap-10 2xl:grid-cols-2 2xl:items-end">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
              <span className="size-1.5 rounded-full bg-brand-primary" />
              {eyebrow}
            </span>
            {statusLabel && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-muted/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <CheckCircle weight="fill" className="size-3.5" />
                {statusLabel}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="max-w-5xl font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {primaryAction && (
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-xl shadow-brand-primary/15 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.label}
                    <ArrowRight weight="bold" className="ml-2 size-4" />
                  </Link>
                </Button>
              )}
              {secondaryAction && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-border/35  px-8 text-[11px] font-black uppercase tracking-[0.22em]"
                >
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                    <FolderOpen weight="duotone" className="ml-2 size-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl p-5">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                {isProject
                  ? t("status_label_project")
                  : t("status_label_portal")}
              </span>
              <strong className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                {statusLabel ?? t("status_default")}
              </strong>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-primary text-white">
              <ClockCountdown weight="duotone" className="size-6" />
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl  p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                    {metric.label}
                  </p>
                  <p className="mt-2 font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                    {metric.value}
                  </p>
                  {metric.detail && (
                    <p className="mt-1 text-xs font-medium text-muted-foreground/70">
                      {metric.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
