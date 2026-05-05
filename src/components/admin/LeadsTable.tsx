"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Lead, MessageTemplate } from "@/src/types/crm"
import { MagnifyingGlass, Rows, SealWarning } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { LeadDetailsDrawer } from "@/src/components/admin/LeadDetailsDrawer"
import { LeadStatusBadge } from "@/src/components/admin/LeadStatusBadge"

import {
  formatLeadValue,
  getLeadDaysWithoutMovement,
  getNextActionMeta,
  isLeadStagnant,
} from "@/src/lib/utils/crm"

interface LeadsTableProps {
  leads: Lead[]
  clients: Array<{ id: string; name: string | null; email: string }>
  templates: MessageTemplate[]
}

export function LeadsTable({
  leads,
  clients,
  templates,
}: LeadsTableProps): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [search, setSearch] = React.useState("")
  const [leadItems, setLeadItems] = React.useState(leads)

  React.useEffect(() => {
    setLeadItems(leads)
  }, [leads])

  const filteredLeads = React.useMemo(() => {
    let result = [...leadItems]

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.companyName.toLowerCase().includes(query) ||
          (lead.contactName ?? "").toLowerCase().includes(query) ||
          (lead.email ?? "").toLowerCase().includes(query)
      )
    }

    result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return result
  }, [leadItems, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="w-fit rounded-full border-border/60 bg-background/80 px-5 text-[10px] font-black uppercase tracking-[0.22em]"
        >
          <Rows className="mr-2 size-4" />
          {filteredLeads.length} leads filtrados
        </Button>
      </div>

      <div className="relative group max-w-md">
        <MagnifyingGlass
          weight="duotone"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por empresa, contato ou e-mail..."
          className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:bg-muted/30 focus-visible:ring-brand-primary/20"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/40 bg-muted/10 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.company")}
              </TableHead>
              <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.contact")}
              </TableHead>
              <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.status")}
              </TableHead>
              <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.value")}
              </TableHead>
              <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Contato
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Observação
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  {t("table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const stagnant = isLeadStagnant(lead)
                const nextAction = getNextActionMeta(lead.nextActionAt)
                const missingCriticalInfo = [
                  !lead.value?.trim() ? "Sem valor" : null,
                  !lead.assignedToId ? "Sem responsavel" : null,
                  !lead.nextActionAt ? "Sem follow-up" : null,
                ].filter(Boolean)

                return (
                  <TableRow
                    key={lead.id}
                    className={`group border-border/20 transition-all hover:bg-brand-primary/[0.03] ${
                      stagnant ? "bg-amber-500/[0.035]" : ""
                    }`}
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-1 h-12 w-1 rounded-full ${
                            stagnant ? "bg-amber-500/70" : "bg-brand-primary/50"
                          }`}
                        />
                        <div>
                          <div className="font-bold tracking-tight text-foreground">
                            {lead.companyName}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/55">
                            {lead.source} • Atualizado em{" "}
                            {new Date(lead.updatedAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.18em] ${nextAction.tone}`}
                            >
                              {nextAction.label}
                            </span>
                            {missingCriticalInfo.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {lead.contactName || "---"}
                        </span>
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          {lead.email || "---"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="font-mono text-sm font-semibold text-brand-primary">
                        {formatLeadValue(lead.value)}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                          {lead.phone || "Sem telefone"}
                        </span>
                        <span className="text-sm font-medium text-foreground/75">
                          {lead.instagram || "Sem Instagram"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end">
                        {stagnant ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                            <SealWarning size={13} />
                            {getLeadDaysWithoutMovement(lead)} dia(s)
                          </div>
                        ) : (
                          <span className="max-w-[18rem] truncate text-sm text-muted-foreground/60">
                            {lead.notes || "Sem observações"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <LeadDetailsDrawer
                        lead={lead}
                        clients={clients}
                        templates={templates}
                        onLeadUpdated={(nextLead) => {
                          setLeadItems((current) =>
                            current.map((item) =>
                              item.id === nextLead.id ? nextLead : item
                            )
                          )
                        }}
                        onLeadDeleted={(leadId) => {
                          setLeadItems((current) =>
                            current.filter((item) => item.id !== leadId)
                          )
                        }}
                      >
                        <Button
                          variant="outline"
                          className="rounded-full border-border/60 bg-background/70 px-4 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          Abrir lead
                        </Button>
                      </LeadDetailsDrawer>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/20 bg-muted/20 px-8 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Total de {filteredLeads.length} leads encontrados
          </p>
        </div>
      </Card>
    </div>
  )
}
