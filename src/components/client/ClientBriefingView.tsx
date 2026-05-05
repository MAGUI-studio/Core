import * as React from "react"

import { getTranslations } from "next-intl/server"
import Image from "next/image"

import {
  ChartLineUp,
  Eye,
  Image as ImageIcon,
  Lightbulb,
  Megaphone,
  NotePencil,
  Palette,
  Target,
  Users,
} from "@phosphor-icons/react/dist/ssr"

import { Separator } from "@/src/components/ui/separator"

interface ClientBriefingViewProps {
  briefing: Record<string, unknown> | null
}

export async function ClientBriefingView({
  briefing,
}: ClientBriefingViewProps) {
  const t = await getTranslations("Briefing.steps")

  if (!briefing) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = briefing as any

  const visualReferences = Array.isArray(data.visualReferences)
    ? data.visualReferences.filter(
        (ref: unknown): ref is string => typeof ref === "string"
      )
    : []

  const fieldValue = (key: string): string =>
    typeof data[key] === "string" ? data[key] : ""

  const items = [
    {
      label: t("brandTone.label"),
      value: fieldValue("brandTone"),
      icon: Megaphone,
    },
    {
      label: t("businessGoals.label"),
      value: fieldValue("businessGoals"),
      icon: ChartLineUp,
    },
    {
      label: t("targetAudience.label"),
      value: fieldValue("targetAudience"),
      icon: Users,
    },
    {
      label: t("primaryCta.label"),
      value: fieldValue("primaryCta"),
      icon: Target,
    },
    {
      label: t("differentiators.label"),
      value: fieldValue("differentiators"),
      icon: Lightbulb,
    },
  ]

  const renderLogo = (
    label: string,
    logo: { url: string; name: string } | null
  ) => (
    <div className="space-y-3 flex-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/45">
        {label}
      </p>
      {logo?.url ? (
        <div className="relative aspect-video w-full rounded-2xl border border-border/20 bg-muted/5 overflow-hidden group">
          <Image
            src={logo.url}
            alt={logo.name || label}
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
        <div className="aspect-video w-full rounded-2xl border border-dashed border-border/20 flex flex-col items-center justify-center gap-2 opacity-30">
          <ImageIcon size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">
            Pendente
          </span>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.75rem] bg-muted/5 p-6 transition-all hover:bg-muted/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <item.icon weight="duotone" className="size-5" />
              </div>
              <h3 className="font-heading text-base font-black uppercase tracking-tight text-foreground/75">
                {item.label}
              </h3>
            </div>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground/75">
              {item.value || "Não preenchido."}
            </p>
          </div>
        ))}

        <div className="col-span-full rounded-[1.75rem] bg-muted/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <NotePencil weight="duotone" className="size-5" />
            </div>
            <h3 className="font-heading text-base font-black uppercase tracking-tight text-foreground/75">
              {t("visualReferences.label")}
            </h3>
          </div>
          {visualReferences.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visualReferences.map((ref: string, i: number) => (
                <a
                  key={i}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-muted/40 px-4 py-2 text-[11px] font-bold text-brand-primary ring-1 ring-border/20 transition-all hover:bg-brand-primary hover:text-white"
                >
                  Referência {i + 1}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium leading-relaxed text-muted-foreground/75 italic">
              Nenhuma referência visual fornecida.
            </p>
          )}
        </div>
      </div>

      <div className="xl:col-span-12 rounded-4xl bg-muted/5 overflow-hidden">
        <div className="bg-transparent border-b border-border/20 px-8 py-6">
          <div className="flex items-center gap-3">
            <Palette weight="duotone" className="size-5 text-brand-primary" />
            <h3 className="font-heading text-lg font-black uppercase tracking-tight">
              Identidade Visual
            </h3>
          </div>
        </div>
        <div className="pt-8 space-y-8 px-8 pb-10">
          <div className="flex flex-col md:flex-row gap-8">
            {renderLogo("Logo Principal", data.logos?.primary)}
            {renderLogo("Logo Secundário", data.logos?.secondary)}
          </div>

          <Separator className="bg-border/20" />

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/45">
              Paleta de Cores
            </span>
            <div className="flex items-center gap-4">
              {data.palette?.primary ? (
                <div className="flex items-center gap-3">
                  <div
                    className="size-14 rounded-2xl border border-border/20 shadow-sm"
                    style={{ backgroundColor: data.palette.primary }}
                  />
                  <span className="text-xs font-mono font-bold uppercase text-foreground/70">
                    {data.palette.primary}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20 italic">
                  Nenhuma cor definida
                </p>
              )}
              {data.palette?.secondary && (
                <div className="flex items-center gap-3 ml-4">
                  <div
                    className="size-14 rounded-2xl border border-border/20 shadow-sm"
                    style={{ backgroundColor: data.palette.secondary }}
                  />
                  <span className="text-xs font-mono font-bold uppercase text-foreground/70">
                    {data.palette.secondary}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
