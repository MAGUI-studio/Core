"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import { DashboardProject } from "@/src/types/dashboard"
import {
  ArrowSquareOut,
  Buildings,
  EnvelopeSimple,
  GithubLogo,
  Globe,
  Phone,
  Tag,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

interface ProjectOverviewTabProps {
  project: DashboardProject
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm lg:p-12">
          <h3 className="mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("project_info_title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Categoria de Serviço
              </span>
              <div className="flex items-center gap-3">
                <Tag weight="duotone" className="size-5 text-brand-primary" />
                <span className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                  {t(`categories.${project.category}`)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Condição de Pagamento
              </span>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-brand-primary" />
                <span className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                  {project.paymentMethod === "FIFTY_FIFTY"
                    ? "50% Entrada + 50% Entrega"
                    : "Parcelamento Mensal"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Ambiente de Produção
              </span>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-brand-primary hover:underline group"
                >
                  <Globe weight="duotone" className="size-5" />
                  <span className="font-mono text-sm font-bold truncate">
                    {project.liveUrl}
                  </span>
                </a>
              ) : (
                <span className="text-sm font-medium text-muted-foreground/30 italic">
                  Não disponível
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Repositório
              </span>
              {project.repositoryUrl ? (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-brand-primary hover:underline group"
                >
                  <GithubLogo weight="duotone" className="size-5" />
                  <span className="font-mono text-sm font-bold truncate">
                    {project.repositoryUrl}
                  </span>
                </a>
              ) : (
                <span className="text-sm font-medium text-muted-foreground/30 italic">
                  Privado ou não definido
                </span>
              )}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {t("project_description_label")}
            </span>
            <p className="font-sans text-base font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {project.description || t("no_description")}
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-8">
        <section className="rounded-3xl border border-border/40 bg-muted/5 p-8 backdrop-blur-sm">
          <h3 className="mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("client_card_title")}
          </h3>
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary font-heading text-xl font-black uppercase tracking-tight">
                {project.client.name?.substring(0, 2)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-heading text-xl font-black uppercase tracking-tight text-foreground truncate">
                  {project.client.name || t("not_available")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60">
                  {project.client.position || "Proprietário"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-4 border-t border-border/20">
              {project.client.companyName && (
                <div className="flex items-center gap-3 text-muted-foreground/80">
                  <Buildings
                    weight="duotone"
                    className="size-4 shrink-0 text-brand-primary/40"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {project.client.companyName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground/80">
                <EnvelopeSimple
                  weight="duotone"
                  className="size-4 shrink-0 text-brand-primary/40"
                />
                <span className="text-[11px] font-bold truncate">
                  {project.client.email}
                </span>
              </div>
              {project.client.phone && (
                <div className="flex items-center gap-3 text-muted-foreground/80">
                  <Phone
                    weight="duotone"
                    className="size-4 shrink-0 text-brand-primary/40"
                  />
                  <span className="text-[11px] font-bold">
                    {project.client.phone}
                  </span>
                </div>
              )}
            </div>

            <Button
              asChild
              variant="outline"
              className="rounded-full text-[10px] font-black uppercase tracking-[0.18em]"
            >
              <Link
                href={{
                  pathname: "/admin/clients/[id]",
                  params: { id: project.client.id },
                }}
              >
                <ArrowSquareOut className="mr-2 size-4" />
                {t("open_client")}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
