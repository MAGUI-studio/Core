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
  WhatsappLogo,
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
import { Textarea } from "@/src/components/ui/textarea"

import { ConvertLeadDialog } from "@/src/components/admin/ConvertLeadDialog"
import { LeadActivityFeed } from "@/src/components/admin/LeadActivityFeed"
import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"

import { getLeadActivitiesAction } from "@/src/lib/actions/crm.actions"

import { useLeadMutations } from "@/src/hooks/use-lead-mutations"

import { LeadDeleteDialog } from "./lead-drawer/LeadDeleteDialog"
import { LeadEditForm } from "./lead-drawer/LeadEditForm"
import { LeadInfoDisplay } from "./lead-drawer/LeadInfoDisplay"
import { LeadNotesList } from "./lead-drawer/LeadNotesList"
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
  const [note, setNote] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const {
    localLead,
    setLocalLead,
    isUpdatingStatus,
    isSavingNote,
    isSavingLead,
    handleStatusChange,
    handleAddNote,
    handleSaveLead,
  } = useLeadMutations(lead, onLeadUpdated)

  const loadExtraData = React.useCallback(
    async (leadId: string) => {
      setIsLoadingData(true)
      const result = await getLeadActivitiesAction(leadId)
      if (result.success && result.activities) {
        setLocalLead((current) => ({
          ...current,
          activities: result.activities,
          followUpNotes: result.notes,
        }))
      }
      setIsLoadingData(false)
    },
    [setLocalLead]
  )

  React.useEffect(() => {
    if (open && localLead.id) {
      loadExtraData(localLead.id)
    }
  }, [open, localLead.id, loadExtraData])

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setIsEditing(false)
      setNote("")
    }
  }

  const statuses = [
    LeadStatus.GARIMPAGEM,
    LeadStatus.CONTATO_REALIZADO,
    LeadStatus.NEGOCIACAO,
    LeadStatus.CONVERTIDO,
  ]
  const missingCriticalInfo = [
    !localLead.source || localLead.source === "OTHER" ? "Origem" : null,
    !localLead.value?.trim() ? "Valor" : null,
    !localLead.nextActionAt ? "Proximo passo" : null,
    !localLead.assignedToId ? "Responsavel" : null,
  ].filter(Boolean)

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[96vw] overflow-y-auto border-l border-border/15 bg-background p-0 sm:min-w-[40rem] sm:max-w-[42rem] sm:rounded-l-[3.5rem]"
      >
        <div className="flex min-h-screen flex-col">
          {/* Executive Header */}
          <SheetHeader className="border-b border-border/10 px-10 py-12 text-left">
            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase
                      size={16}
                      className="text-brand-primary"
                      weight="bold"
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                      Gestão de Oportunidade
                    </span>
                  </div>
                  <SheetTitle className="font-heading text-4xl font-black tracking-tighter text-foreground">
                    {localLead.companyName}
                  </SheetTitle>
                  <div className="flex items-center gap-3">
                    <LeadStatusBadge status={localLead.status} />
                    <span className="text-xs font-medium text-muted-foreground/40">
                      •
                    </span>
                    <span className="text-xs font-bold text-muted-foreground/60">
                      {t(`source.${localLead.source}`)}
                    </span>
                  </div>
                  {missingCriticalInfo.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {missingCriticalInfo.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700"
                        >
                          Falta {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-full border-border/20 shadow-sm transition-transform active:scale-90"
                    >
                      <DotsThreeVertical size={20} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-50 w-52 rounded-4xl border border-border/10 bg-background p-2 shadow-2xl"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors hover:bg-muted"
                    >
                      <PencilSimple size={16} className="mr-3" /> Editar Lead
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
                        Detalhes
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
                        Propostas
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

              {/* Primary Actions Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {localLead.status !== LeadStatus.CONVERTIDO ? (
                  <Button
                    onClick={() => setIsConvertDialogOpen(true)}
                    className="h-14 rounded-2xl bg-brand-primary text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:bg-brand-primary/90 active:scale-95"
                  >
                    <RocketLaunch size={20} weight="bold" className="mr-3" />
                    Converter Lead
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-2xl border-green-500/30 bg-green-500/5 text-[11px] font-black uppercase tracking-widest text-green-600 shadow-sm"
                  >
                    <Link
                      href={{
                        pathname: "/admin/projects/[id]",
                        params: { id: localLead.convertedProjectId || "" },
                      }}
                    >
                      <RocketLaunch size={20} weight="fill" className="mr-3" />
                      Acessar Projeto
                    </Link>
                  </Button>
                )}

                <div className="flex h-14 items-center justify-between rounded-2xl border border-border/15 bg-muted/10 px-8">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Última Interação
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

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="flex-1">
            <div className="bg-background px-10 pt-6">
              <TabsList className="flex h-12 w-full items-center justify-start gap-2 rounded-full border border-border/10 bg-muted/10 p-1">
                <TabsTrigger
                  value="overview"
                  className="h-full rounded-full px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="h-full rounded-full px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Atividades
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-10">
              <TabsContent
                value="overview"
                className="m-0 space-y-10 outline-none"
              >
                {isEditing && (
                  <div className="rounded-[2.5rem] border border-brand-primary/20 bg-brand-primary/[0.02] p-8 shadow-sm">
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
                )}

                <LeadInfoDisplay lead={localLead} />

                <div className="grid gap-10">
                  <div className="space-y-3">
                    <SectionHeader
                      title="Proposta Comercial"
                      icon={NotePencil}
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="h-14 w-full justify-start rounded-2xl border-brand-primary/25 bg-brand-primary/5 px-6 text-[11px] font-black uppercase tracking-widest text-brand-primary shadow-sm"
                    >
                      <Link
                        href={{
                          pathname: "/admin/crm/proposals/new",
                          query: { leadId: localLead.id },
                        }}
                      >
                        <NotePencil size={20} weight="bold" className="mr-3" />
                        Criar Proposta
                      </Link>
                    </Button>
                  </div>

                  {/* Pipeline Control */}
                  <div className="space-y-4">
                    <SectionHeader title="Estágio do Funil" icon={Layout} />
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={Boolean(isUpdatingStatus)}
                          className={`flex items-center rounded-2xl border px-6 py-3 transition-all active:scale-95 ${
                            localLead.status === s
                              ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                              : "border-border/40 bg-background text-muted-foreground/60 hover:border-border/80"
                          }`}
                        >
                          {isUpdatingStatus === s && (
                            <CircleNotch
                              size={12}
                              className="mr-2 animate-spin"
                            />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {t(`status.${s}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Strategy */}
                  <div className="space-y-6">
                    <SectionHeader
                      title="Contexto comercial"
                      icon={NotePencil}
                    />
                    <div className="relative">
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Registre contexto, proximo passo, decisor e qualquer bloqueio real da negociacao."
                        className="min-h-[140px] resize-none rounded-4xl border-border/15 bg-muted/10 p-8 text-sm font-medium transition-all focus:bg-background focus:ring-1 focus:ring-brand-primary/20 shadow-inner"
                      />
                      <Button
                        onClick={async () => {
                          if (await handleAddNote(note)) setNote("")
                        }}
                        disabled={isSavingNote || note.trim().length < 2}
                        className="absolute bottom-4 right-4 h-11 rounded-2xl bg-foreground px-8 text-[10px] font-black uppercase tracking-widest text-background shadow-xl active:scale-95"
                      >
                        {isSavingNote ? (
                          <CircleNotch size={14} className="animate-spin" />
                        ) : (
                          "Salvar Nota"
                        )}
                      </Button>
                    </div>

                    <div className="mt-4">
                      <LeadNotesList notes={localLead.followUpNotes || []} />
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="space-y-4">
                    <SectionHeader
                      title="Templates de Contato"
                      icon={WhatsappLogo}
                    />
                    <div className="rounded-[2.5rem] border border-border/15 bg-muted/10 p-8 shadow-sm">
                      <LeadQuickActions
                        lead={localLead}
                        templates={templates}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="timeline"
                className="m-0 space-y-8 outline-none"
              >
                <div className="flex items-center justify-between">
                  <SectionHeader title="Histórico Completo" icon={Lightning} />
                  {isLoadingData && (
                    <CircleNotch
                      size={18}
                      className="animate-spin text-brand-primary"
                    />
                  )}
                </div>
                <div className="rounded-[2.5rem] border border-border/15 bg-background p-10 shadow-sm">
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
