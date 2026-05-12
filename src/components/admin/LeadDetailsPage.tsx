"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { parseAsString, useQueryState } from "nuqs"

import { LeadStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  ArrowLeft,
  ArrowSquareOut,
  Briefcase,
  Calendar,
  ChatCircleText,
  CircleNotch,
  Files,
  InstagramLogo,
  Lightning,
  NotePencil,
  PencilSimple,
  RocketLaunch,
  Sliders,
  Target,
  UserCircle,
} from "@phosphor-icons/react"

import { ConvertLeadDialog } from "@/src/components/admin/ConvertLeadDialog"
import { LeadActivityFeed } from "@/src/components/admin/LeadActivityFeed"
import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"
import { LeadEditForm } from "@/src/components/admin/lead-drawer/LeadEditForm"
import { LeadInfoDisplay } from "@/src/components/admin/lead-drawer/LeadInfoDisplay"
import { LeadProposalsTab } from "@/src/components/admin/lead-drawer/LeadProposalsTab"
import { LeadQuickActions } from "@/src/components/admin/lead-drawer/LeadQuickActions"
import { Button } from "@/src/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import {
  getLeadActivitiesAction,
  getLeadSnapshotAction,
} from "@/src/lib/actions/crm.actions"
import { useLeadMutations } from "@/src/hooks/use-lead-mutations"

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function DetailKpi({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ElementType
  label: string
  value: string
  helper?: string | null
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.6rem] border border-border/15 bg-background/55 px-4 py-4 backdrop-blur-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        <Icon size={18} weight="duotone" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground/40">
          {label}
        </p>
        <p className="mt-1 text-sm font-black text-foreground">{value}</p>
        {helper ? (
          <p className="mt-1 text-[10px] font-bold text-muted-foreground/55">
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2 px-1">
      <Icon size={14} weight="bold" className="text-brand-primary/60" />
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
        {title}
      </h4>
    </div>
  )
}

type LeadDetailsPageProps = {
  lead: Lead
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  initialMode?: "overview" | "edit"
}

export function LeadDetailsPage({
  lead,
  clients,
  templates,
  initialMode = "overview",
}: LeadDetailsPageProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("overview")
  )
  const [isEditing, setIsEditing] = React.useState(initialMode === "edit")
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = React.useState(false)

  const {
    localLead,
    setLocalLead,
    isUpdatingStatus,
    isSavingLead,
    handleStatusChange,
    handleSaveLead,
  } = useLeadMutations(lead)

  const loadExtraData = React.useEffectEvent(async (leadId: string) => {
    setIsLoadingData(true)

    const [activitiesResult, snapshotResult] = await Promise.all([
      getLeadActivitiesAction(leadId),
      getLeadSnapshotAction(leadId),
    ])

    if (activitiesResult.success && activitiesResult.activities) {
      setLocalLead((current) => ({
        ...current,
        activities: activitiesResult.activities,
        followUpNotes: activitiesResult.notes,
      }))
    }

    if (snapshotResult.success && snapshotResult.lead) {
      setLocalLead((current) => ({
        ...current,
        status: snapshotResult.lead?.status ?? current.status,
        updatedAt: snapshotResult.lead?.updatedAt ?? current.updatedAt,
        proposalCount:
          snapshotResult.lead?.proposalCount ?? current.proposalCount,
        acceptedProposalCount:
          snapshotResult.lead?.acceptedProposalCount ??
          current.acceptedProposalCount,
        acceptedProposals:
          snapshotResult.lead?.acceptedProposals ??
          current.acceptedProposals,
        proposals: snapshotResult.lead?.proposals ?? current.proposals,
        client: snapshotResult.lead?.client ?? current.client,
      }))
    }

    setIsLoadingData(false)
  })

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExtraData(localLead.id)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [localLead.id])

  const statuses = [
    LeadStatus.GARIMPAGEM,
    LeadStatus.CONTATO_REALIZADO,
    LeadStatus.NEGOCIACAO,
    LeadStatus.CONVERTIDO,
  ]

  const canConvertLead = (localLead.acceptedProposalCount ?? 0) > 0
  const matchedClient = React.useMemo(() => {
    if (localLead.client) return localLead.client
    if (!localLead.email) return null

    const normalizedLeadEmail = localLead.email.trim().toLowerCase()
    const fallbackClient = clients.find(
      (client) => client.email.trim().toLowerCase() === normalizedLeadEmail
    )

    if (!fallbackClient) return null

    return {
      id: fallbackClient.id,
      name: fallbackClient.name,
      email: fallbackClient.email,
      companyName: null,
      phone: null,
      position: null,
    }
  }, [clients, localLead.client, localLead.email])

  const clientDisplayName =
    matchedClient?.name || localLead.contactName || "Cliente nao identificado"
  const leadSourceLabel = t(`source.${localLead.source}`)
  const proposalCountLabel = String(localLead.proposalCount ?? 0)
  const acceptedProposalCountLabel = String(localLead.acceptedProposalCount ?? 0)
  const updatedAtLabel = formatDateTime(localLead.updatedAt)

  return (
    <main className="relative flex flex-col gap-12 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute right-0 top-0 -z-10 size-[520px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-primary/5 opacity-50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 size-[420px] -translate-x-1/3 translate-y-1/3 rounded-full bg-brand-primary/8 opacity-35 blur-3xl" />

      <div className="flex flex-col gap-8">
        <Button
          variant="ghost"
          className="-ml-4 w-max gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 transition-all hover:bg-transparent hover:text-foreground"
          size="sm"
          asChild
        >
          <Link href="/admin/crm">
            <ArrowLeft weight="bold" className="size-3" />
            Voltar para leads
          </Link>
        </Button>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Briefcase weight="duotone" className="size-6" />
              </div>
              <div className="grid gap-2">
                <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                  {localLead.companyName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
                  <span className="inline-flex items-center gap-2">
                    <UserCircle className="size-4 text-brand-primary/70" />
                    {clientDisplayName}
                  </span>
                  <LeadStatusBadge status={localLead.status} />
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                    <Target className="size-3.5" />
                    {leadSourceLabel}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing((current) => !current)}
                    className="h-10 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.16em]"
                  >
                    <PencilSimple size={15} weight="bold" className="mr-2" />
                    {isEditing ? "Fechar edição" : "Editar lead"}
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70 hover:bg-muted/8 hover:text-foreground"
                  >
                    <Link
                      href={{
                        pathname: "/admin/crm/leads/[id]/proposals",
                        params: { id: localLead.id },
                      }}
                    >
                      <ArrowSquareOut
                        size={15}
                        weight="bold"
                        className="mr-2"
                      />
                      Propostas
                    </Link>
                  </Button>

                  {localLead.status === LeadStatus.CONVERTIDO ? (
                    <Button
                      asChild
                      variant="ghost"
                      className="h-10 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.16em] text-green-600 hover:bg-green-500/8 hover:text-green-700"
                    >
                      <Link
                        href={{
                          pathname: "/admin/projects/[id]",
                          params: { id: localLead.convertedProjectId || "" },
                        }}
                      >
                        <RocketLaunch
                          size={15}
                          weight="fill"
                          className="mr-2"
                        />
                        Acessar projeto
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailKpi
                icon={Files}
                label="Propostas"
                value={proposalCountLabel}
                helper="Total vinculadas ao lead"
              />
              <DetailKpi
                icon={RocketLaunch}
                label="Aceitas"
                value={acceptedProposalCountLabel}
                helper="Prontas para conversão"
              />
              <DetailKpi
                icon={Calendar}
                label="Atualização"
                value={updatedAtLabel}
                helper="Última movimentação registrada"
              />
              <DetailKpi
                icon={ChatCircleText}
                label="Contato"
                value={localLead.email || localLead.phone || "Nao informado"}
                helper={localLead.contactName || "Sem nome principal"}
              />
            </div>
          </div>
        </div>
      </div>

      {localLead.status !== LeadStatus.CONVERTIDO ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => setIsConvertDialogOpen(true)}
            disabled={!canConvertLead}
            className="h-14 rounded-2xl px-8 text-[11px] font-black uppercase tracking-widest text-white"
          >
            <RocketLaunch size={20} weight="bold" className="mr-3" />
            Converter lead
          </Button>

          {!canConvertLead ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-700/75">
              Aprove uma proposta antes de converter este lead em projeto.
            </p>
          ) : null}
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-10 flex items-center justify-between overflow-x-auto border-b border-border/40 pb-4 scrollbar-hide">
          <TabsList variant="line" className="flex-nowrap bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Briefcase weight="duotone" className="mr-2 size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="pipeline"
              className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Sliders weight="duotone" className="mr-2 size-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger
              value="proposals"
              className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Files weight="duotone" className="mr-2 size-4" />
              Propostas
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <InstagramLogo weight="duotone" className="mr-2 size-4" />
              Direct
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted/5 data-[state=active]:bg-transparent"
            >
              <Lightning weight="duotone" className="mr-2 size-4" />
              Atividades
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-8">
              {isEditing ? (
                <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <PencilSimple
                      size={14}
                      weight="bold"
                      className="text-brand-primary/60"
                    />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Editar lead
                    </h3>
                  </div>
                  <LeadEditForm
                    lead={localLead}
                    isSaving={isSavingLead}
                    onSave={async (data) => {
                      const ok = await handleSaveLead(data)
                      if (ok) setIsEditing(false)
                      return ok
                    }}
                  />
                </div>
              ) : null}

              <LeadInfoDisplay lead={localLead} client={matchedClient} />
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6">
                <SectionHeader title="Resumo operacional" icon={Target} />
                <div className="mt-5 grid gap-3">
                  <DetailKpi
                    icon={Files}
                    label="Propostas"
                    value={proposalCountLabel}
                  />
                  <DetailKpi
                    icon={RocketLaunch}
                    label="Elegível para conversão"
                    value={canConvertLead ? "Sim" : "Não"}
                  />
                  <DetailKpi
                    icon={Calendar}
                    label="Última atualização"
                    value={updatedAtLabel}
                    helper={
                      isLoadingData ? "Sincronizando dados..." : "Base atualizada"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-0 focus-visible:outline-none">
          <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
            <SectionHeader title="Estágio do funil" icon={Sliders} />
            <div className="mt-6 flex flex-wrap gap-3">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => void handleStatusChange(status)}
                  disabled={Boolean(isUpdatingStatus)}
                  className={`flex items-center rounded-2xl border px-5 py-3 transition-all active:scale-95 ${
                    localLead.status === status
                      ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                      : "border-border/40 bg-background text-muted-foreground/60 hover:border-border/80"
                  }`}
                >
                  {isUpdatingStatus === status ? (
                    <CircleNotch size={12} className="mr-2 animate-spin" />
                  ) : null}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t(`status.${status}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="mt-0 focus-visible:outline-none">
          <div className="space-y-4">
            <Button
              asChild
              variant="outline"
              className="h-14 w-full justify-start rounded-2xl border-brand-primary/15 bg-brand-primary/[0.04] px-5 text-[11px] font-black uppercase tracking-widest text-brand-primary"
            >
              <Link
                href={{
                  pathname: "/admin/crm/proposals/new",
                  query: { leadId: localLead.id },
                }}
              >
                <NotePencil size={20} weight="bold" className="mr-3" />
                Criar proposta
              </Link>
            </Button>

            <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
              <LeadProposalsTab
                lead={localLead}
                showHeader={false}
                onProposalChanged={() => void loadExtraData(localLead.id)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
          <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
            <LeadQuickActions
              lead={localLead}
              templates={templates}
              proposals={localLead.proposals || []}
            />
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
          <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
            <LeadActivityFeed activities={localLead.activities || []} />
          </div>
        </TabsContent>
      </Tabs>

      <ConvertLeadDialog
        lead={localLead}
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        clients={clients}
        onConverted={() => void handleStatusChange(LeadStatus.CONVERTIDO)}
      />
    </main>
  )
}
