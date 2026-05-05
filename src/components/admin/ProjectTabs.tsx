"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Prisma } from "@/src/generated/client"
import { DashboardProject } from "@/src/types/dashboard"
import {
  Clock,
  CurrencyCircleDollar,
  Files,
  Info,
  NoteBlank,
  Sliders,
  Terminal,
} from "@phosphor-icons/react"
import { parseAsString, useQueryState } from "nuqs"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { ProjectAssetsTab } from "@/src/components/admin/ProjectAssetsTab"
import { ProjectBriefingTab } from "@/src/components/admin/ProjectBriefingTab"
import { ProjectEngineeringTab } from "@/src/components/admin/ProjectEngineeringTab"
import { ProjectOverviewTab } from "@/src/components/admin/ProjectOverviewTab"
import { ProjectSettingsTab } from "@/src/components/admin/ProjectSettingsTab"
import { ProjectTimelineTab } from "@/src/components/admin/ProjectTimelineTab"
import { ProjectFinancialTab } from "@/src/components/admin/financial/ProjectFinancialTab"

interface ProjectTabsProps {
  project: DashboardProject
  projectId: string
  clients: Array<{
    id: string
    name: string | null
    email: string
    companyName: string | null
  }>
  invoices: Prisma.InvoiceGetPayload<{
    include: {
      project: {
        select: {
          id: true
          name: true
        }
      }
      installments: {
        include: {
          paymentEvents: true
        }
      }
    }
  }>[]
}

export function ProjectTabs({
  project,
  projectId,
  clients,
  invoices,
}: ProjectTabsProps) {
  const t = useTranslations("Admin.projects.details")
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("overview")
  )
  const normalizedActiveTab =
    activeTab === "communication" ? "overview" : activeTab

  return (
    <Tabs
      value={normalizedActiveTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="mb-10 flex items-center justify-between overflow-x-auto border-b border-border/40 pb-4 scrollbar-hide">
        <TabsList variant="line" className="flex-nowrap bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Info weight="duotone" className="mr-2 size-4" />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger
            value="engineering"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Terminal weight="duotone" className="mr-2 size-4" />
            {t("tabs.engineering")}
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Clock weight="duotone" className="mr-2 size-4" />
            {t("tabs.timeline")}
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <CurrencyCircleDollar weight="duotone" className="mr-2 size-4" />
            {t("tabs.financial")}
          </TabsTrigger>
          <TabsTrigger
            value="briefing"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <NoteBlank weight="duotone" className="mr-2 size-4" />
            {t("tabs.briefing")}
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Files weight="duotone" className="mr-2 size-4" />
            {t("tabs.assets")}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
          >
            <Sliders weight="duotone" className="mr-2 size-4" />
            {t("tabs.settings")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
        <ProjectOverviewTab project={project} />
      </TabsContent>

      <TabsContent
        value="engineering"
        className="mt-0 focus-visible:outline-none"
      >
        <ProjectEngineeringTab project={project} />
      </TabsContent>

      <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
        <ProjectTimelineTab projectId={projectId} updates={project.updates} />
      </TabsContent>

      <TabsContent
        value="financial"
        className="mt-0 focus-visible:outline-none"
      >
        <ProjectFinancialTab projectId={projectId} invoices={invoices} />
      </TabsContent>

      <TabsContent value="briefing" className="mt-0 focus-visible:outline-none">
        <ProjectBriefingTab projectId={projectId} briefing={project.briefing} />
      </TabsContent>

      <TabsContent value="assets" className="mt-0 focus-visible:outline-none">
        <ProjectAssetsTab projectId={projectId} assets={project.assets} />
      </TabsContent>

      <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
        <ProjectSettingsTab
          projectId={projectId}
          members={project.members || []}
          clients={clients}
        />
      </TabsContent>
    </Tabs>
  )
}
