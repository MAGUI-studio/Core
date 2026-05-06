"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"

import { Prisma } from "@/src/generated/client"
import {
  ArrowClockwise,
  Briefcase,
  Eye,
  FileText,
  Image as ImageIcon,
  Palette,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"

import { resetProjectBriefingAction } from "@/src/lib/actions/project.actions"

interface ProjectBriefingTabProps {
  projectId: string
  briefing: Prisma.JsonValue
}

export function ProjectBriefingTab({
  projectId,
  briefing,
}: ProjectBriefingTabProps) {
  const t = useTranslations("Admin.projects.details")
  const [isResetting, setIsResetting] = React.useState(false)
  const [showResetConfirm, setShowResetConfirm] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (briefing as any) || {}

  const handleReset = async () => {
    setIsResetting(true)
    const result = await resetProjectBriefingAction(projectId)

    if (result.success) {
      toast.success(t("briefing_reset_success"))
      setShowResetConfirm(false)
    } else {
      toast.error(result.error || t("briefing_reset_error"))
    }
    setIsResetting(false)
  }

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-xl font-black uppercase tracking-tight">
          {title}
        </h3>
      </div>
    </div>
  )

  const renderField = (
    label: string,
    value: unknown,
    type: "text" | "list" = "text"
  ) => {
    const isEmpty = !value || (Array.isArray(value) && value.length === 0)

    return (
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </span>
        {isEmpty ? (
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground/20 italic">
            {t("briefing_not_provided")}
          </p>
        ) : (
          <>
            {type === "text" && (
              <p className="text-sm font-medium leading-relaxed text-foreground/80">
                {String(value)}
              </p>
            )}
            {type === "list" && Array.isArray(value) && (
              <div className="flex flex-wrap gap-2">
                {value.map((item: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-muted/10 border-border/40 text-[10px] font-bold"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  const renderLogo = (
    label: string,
    logo: { url: string; name: string } | null
  ) => (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
        {label}
      </p>
      {logo ? (
        <div className="relative aspect-video w-full rounded-2xl border border-border/40 bg-muted/10 overflow-hidden group">
          <Image
            src={logo.url}
            alt={logo.name}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
          <a
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Eye className="text-white size-6" />
          </a>
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl border border-dashed border-border/40 flex flex-col items-center justify-center gap-2 opacity-30">
          <ImageIcon size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">
            {t("briefing_pending")}
          </span>
        </div>
      )}
    </div>
  )

  if (!briefing || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <FileText className="size-16 mb-4" />
        <p className="font-heading text-xl font-black uppercase tracking-tight">
          {t("briefing_not_started")}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest mt-1">
          {t("briefing_not_started_desc")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
            {t("briefing_strategic_sheet")}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive font-mono text-[10px] font-black uppercase tracking-widest gap-2"
        >
          <ArrowClockwise className="size-3" />
          {t("briefing_request_new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-12">
          <section>
            {renderSectionHeader(
              <Briefcase weight="fill" className="size-5" />,
              t("briefing_business_context")
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
              <div className="md:col-span-2">
                {renderField(t("steps.businessDescription.label"), data.businessDescription)}
              </div>
              {renderField(t("steps.brandTone.label"), data.brandTone)}
              {renderField(t("steps.businessGoals.label"), data.businessGoals)}
              {renderField(t("steps.targetAudience.label"), data.targetAudience)}
              {renderField(t("steps.differentiators.label"), data.differentiators)}
              <div className="md:col-span-2">
                {renderField(t("steps.primaryCta.label"), data.primaryCta)}
              </div>
            </div>
          </section>

          <section>
            {renderSectionHeader(
              <Eye weight="fill" className="size-5" />,
              t("briefing_visual_direction")
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
              {renderField(
                t("steps.visualReferences.label"),
                data.visualReferences,
                "list"
              )}
              {renderField(t("steps.dislikedReferences.label"), data.dislikedReferences, "list")}
              {renderField(t("steps.competitors.label"), data.competitors, "list")}
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <Card className="rounded-4xl border-none bg-muted/5 overflow-hidden shadow-none">
            <CardHeader className="bg-transparent border-b border-border/20 px-8">
              <div className="flex items-center gap-3">
                <Palette weight="fill" className="size-5 text-brand-primary" />
                <CardTitle className="font-heading text-lg font-black uppercase tracking-tight">
                  {t("briefing_visual_identity")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8 px-8 pb-10">
              <div className="grid gap-6">
                {renderLogo(t("briefing_primary_logo"), data.logos?.primary)}
                {renderLogo(t("briefing_secondary_logo"), data.logos?.secondary)}
              </div>

              <Separator className="bg-border/40" />

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {t("briefing_color_palette")}
                </span>
                <div className="flex items-center gap-3">
                  {data.palette?.primary ? (
                    <div className="group relative">
                      <div
                        className="size-12 rounded-xl border border-border/40 shadow-sm"
                        style={{ backgroundColor: data.palette.primary }}
                      />
                      <span className="absolute -bottom-5 left-0 text-[8px] font-bold uppercase">
                        {data.palette.primary}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic">
                      {t("briefing_no_color")}
                    </p>
                  )}
                  {data.palette?.secondary && (
                    <div className="group relative">
                      <div
                        className="size-12 rounded-xl border border-border/40 shadow-sm"
                        style={{ backgroundColor: data.palette.secondary }}
                      />
                      <span className="absolute -bottom-5 left-0 text-[8px] font-bold uppercase">
                        {data.palette.secondary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
              {t("briefing_reset_dialog_title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
              {t("briefing_reset_dialog_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/10">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="rounded-full bg-destructive text-xs font-bold uppercase tracking-widest text-white hover:bg-destructive/90"
            >
              {isResetting ? t("briefing_resetting") : t("briefing_confirm_reset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
