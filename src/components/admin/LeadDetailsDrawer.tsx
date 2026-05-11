"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadStatus } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  ArrowSquareOut,
  Briefcase,
  Calendar,
  CircleNotch,
  DotsThreeVertical,
  Layout,
  Lightning,
  NotePencil,
  PencilSimple,
  RocketLaunch,
  InstagramLogo,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import { ConvertLeadDialog } from "@/src/components/admin/ConvertLeadDialog"
import { LeadActivityFeed } from "@/src/components/admin/LeadActivityFeed"
import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"

import {
  getLeadActivitiesAction,
  getLeadSnapshotAction,
} from "@/src/lib/actions/crm.actions"

import { useLeadMutations } from "@/src/hooks/use-lead-mutations"

import { LeadDeleteDialog } from "./lead-drawer/LeadDeleteDialog"
import { LeadEditForm } from "./lead-drawer/LeadEditForm"
import { LeadInfoDisplay } from "./lead-drawer/LeadInfoDisplay"
import { LeadNotesList } from "./lead-drawer/LeadNotesList"
import { LeadProposalsTab } from "./lead-drawer/LeadProposalsTab"
import { LeadQuickActions } from "./lead-drawer/LeadQuickActions"

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

type LeadDetailsDrawerProps = {
  lead: Lead
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
  onLeadUpdated?: (lead: Lead) => void
  onLeadDeleted?: (leadId: string) => void
}

export function LeadDetailsDrawer({
  lead,
  children,
  onOpenChange,
  open: controlledOpen,
  clients,
  templates,
  onLeadUpdated,
  onLeadDeleted,
}: LeadDetailsDrawerProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const {
    localLead,
    setLocalLead,
    isUpdatingStatus,
    isSavingLead,
    handleStatusChange,
    handleSaveLead,
  } = useLeadMutations(lead, onLeadUpdated)

  const loadExtraData = React.useCallback(
    async (leadId: string) => {
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
    },
    [setLocalLead]
  )

  React.useEffect(() => {
    if (open && localLead.id) {
      const timer = setTimeout(() => {
        void loadExtraData(localLead.id)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, localLead.id, loadExtraData])

  React.useEffect(() => {
    if (!open || !localLead.id) return

    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") {
        void loadExtraData(localLead.id)
      }
    }

    window.addEventListener("focus", refreshOnReturn)
    document.addEventListener("visibilitychange", refreshOnReturn)

    return () => {
      window.removeEventListener("focus", refreshOnReturn)
      document.removeEventListener("visibilitychange", refreshOnReturn)
    }
  }, [open, localLead.id, loadExtraData])

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (!nextOpen) {
      setIsEditing(false)
    }
  }

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

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[96vw] overflow-y-auto border-l-0 bg-background p-0 sm:min-w-[40rem] sm:max-w-[42rem]"
      >
        <div className="flex min-h-screen flex-col">
          <SheetHeader className="px-8 py-8 text-left sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase
                      size={16}
                      className="text-brand-primary"
                      weight="bold"
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                      Gestao de oportunidade
                    </span>
                  </div>
                  <SheetTitle className="font-heading text-4xl font-black tracking-tighter text-foreground">
                    {localLead.companyName}
                  </SheetTitle>
                  <p className="text-sm font-bold text-muted-foreground/70">
                    Cliente: {clientDisplayName}
                  </p>
                  <div className="flex items-center gap-3">
                    <LeadStatusBadge status={localLead.status} />
                    <span className="text-xs font-medium text-muted-foreground/40">
                      •
                    </span>
                    <span className="text-xs font-bold text-muted-foreground/60">
                      {t(`source.${localLead.source}`)}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-full border-border/10 bg-muted/[0.04] transition-transform active:scale-90"
                    >
                      <DotsThreeVertical size={20} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-50 w-52 rounded-4xl border border-border/10 bg-background p-2"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors hover:bg-muted"
                    >
                      <PencilSimple size={16} className="mr-3" /> Editar lead
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-widest"
                    >
                      <Link
                        href={{
                          pathname: "/admin/crm/leads/[id]",
                          params: { id: localLead.id },
                        }}
                        target="_blank"
                      >
                        <ArrowSquareOut size={16} className="mr-3" /> Ver
                        detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-widest"
                    >
                      <Link
                        href={{
                          pathname: "/admin/crm/leads/[id]/proposals",
                          params: { id: localLead.id },
                        }}
                        target="_blank"
                      >
                        <ArrowSquareOut size={16} className="mr-3" /> Ver
                        propostas
                      </Link>
                    </DropdownMenuItem>
                    <div className="my-2 h-px bg-border/10 px-2" />
                    <LeadDeleteDialog
                      leadId={localLead.id}
                      companyName={localLead.companyName}
                      onDeleted={(id) => {
                        setUncontrolledOpen(false)
                        onOpenChange?.(false)
                        onLeadDeleted?.(id)
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                {localLead.status !== LeadStatus.CONVERTIDO ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setIsConvertDialogOpen(true)}
                      disabled={!canConvertLead}
                      className="h-14 w-full rounded-2xl bg-brand-primary text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-brand-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <RocketLaunch size={20} weight="bold" className="mr-3" />
                      Converter lead
                    </Button>
                    {!canConvertLead ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-700/80">
                          Conversao bloqueada
                        </p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-red-700">
                          Crie e aprove uma proposta antes de converter este
                          lead em projeto.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-2xl border-green-500/20 bg-green-500/5 text-[11px] font-black uppercase tracking-widest text-green-600"
                  >
                    <Link
                      href={{
                        pathname: "/admin/projects/[id]",
                        params: { id: localLead.convertedProjectId || "" },
                      }}
                    >
                      <RocketLaunch size={20} weight="fill" className="mr-3" />
                      Acessar projeto
                    </Link>
                  </Button>
                )}

                <div className="flex h-14 items-center justify-between rounded-2xl bg-muted/[0.04] px-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Ultima interacao
                    </span>
                    <span className="text-[10px] font-bold text-foreground/70">
                      {formatDateTime(localLead.updatedAt)}
                    </span>
                  </div>
                  <Calendar
                    size={18}
                    className="text-muted-foreground/30"
                    weight="bold"
                  />
                </div>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1">
            <div className="bg-background px-8 pt-4 sm:px-10 sm:pt-5">
              <TabsList className="flex h-12 w-full items-center justify-start gap-2 rounded-full bg-muted/[0.04] p-1">
                <TabsTrigger
                  value="overview"
                  className="h-full rounded-full px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-all data-[state=active]:bg-brand-primary data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="h-full rounded-full px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-all data-[state=active]:bg-brand-primary data-[state=active]:text-white"
                >
                  Atividades
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-8 pb-8 sm:px-10 sm:pb-10">
              <TabsContent
                value="overview"
                className="m-0 space-y-8 pt-6 outline-none"
              >
                {isEditing ? (
                  <div className="rounded-[2rem] bg-muted/[0.03] p-6 sm:p-8">
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

                <div className="grid gap-8">
                  <div className="space-y-4">
                    <SectionHeader
                      title="Proposta Comercial"
                      icon={NotePencil}
                    />
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
                    <div className="rounded-[1.75rem] bg-muted/[0.03] p-0">
                      <LeadProposalsTab
                        lead={localLead}
                        showHeader={false}
                        onProposalChanged={() => void loadExtraData(localLead.id)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="Estagio do funil" icon={Layout} />
                    <div className="flex flex-wrap gap-2.5">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={Boolean(isUpdatingStatus)}
                          className={`flex items-center rounded-2xl border px-5 py-3 transition-all active:scale-95 ${
                            localLead.status === status
                              ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                              : "border-border/40 bg-background text-muted-foreground/60 hover:border-border/80"
                          }`}
                        >
                          {isUpdatingStatus === status ? (
                            <CircleNotch
                              size={12}
                              className="mr-2 animate-spin"
                            />
                          ) : null}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {t(`status.${status}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeader
                      title="Mensagens para direct"
                      icon={InstagramLogo}
                    />
                    <div className="rounded-[1.75rem] bg-muted/[0.03] p-6 sm:p-8">
                      <LeadQuickActions
                        lead={localLead}
                        templates={templates}
                        proposals={localLead.proposals || []}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="Notas salvas" icon={NotePencil} />
                    <div className="rounded-[1.75rem] bg-muted/[0.03] p-6 sm:p-8">
                      <LeadNotesList notes={localLead.followUpNotes || []} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="timeline"
                className="m-0 space-y-6 pt-6 outline-none"
              >
                <div className="flex items-center justify-between">
                  <SectionHeader title="Historico completo" icon={Lightning} />
                  {isLoadingData ? (
                    <CircleNotch
                      size={18}
                      className="animate-spin text-brand-primary"
                    />
                  ) : null}
                </div>
                <div className="rounded-[1.75rem] bg-muted/[0.03] p-6 sm:p-8">
                  <LeadActivityFeed activities={localLead.activities || []} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <ConvertLeadDialog
          lead={localLead}
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          clients={clients}
          onConverted={() => handleStatusChange(LeadStatus.CONVERTIDO)}
        />
      </SheetContent>
    </Sheet>
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
