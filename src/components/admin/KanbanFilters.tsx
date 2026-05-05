"use client"

import * as React from "react"

import { LeadSource } from "@/src/generated/client"
import { Funnel, Trash, X } from "@phosphor-icons/react"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

export interface CRMFilters {
  source: "all" | LeadSource
  stagnation: "all" | "3" | "7" | "15"
  hasContact: "all" | "phone" | "instagram" | "email"
}

interface KanbanFiltersProps {
  filters: CRMFilters
  onFiltersChange: (filters: CRMFilters) => void
  totalCount: number
  filteredCount: number
}

export function KanbanFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: KanbanFiltersProps): React.JSX.Element {
  const hasActiveFilters =
    filters.source !== "all" ||
    filters.stagnation !== "all" ||
    filters.hasContact !== "all"

  const clearFilters = () => {
    onFiltersChange({
      source: "all",
      stagnation: "all",
      hasContact: "all",
    })
  }

  const sources = Object.values(LeadSource)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-full border-border/60 bg-background/80 px-4 text-[10px] font-black uppercase tracking-widest"
            >
              <Funnel className="mr-2 size-4" />
              Filtros Avancados
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-full px-1.5 py-0 text-[9px]"
                >
                  Ativos
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 rounded-[1.8rem] border-border/40 p-6 shadow-2xl"
            align="start"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Origem do Lead
                  </label>
                  <Select
                    value={filters.source}
                    onValueChange={(v) =>
                      onFiltersChange({
                        ...filters,
                        source: v as "all" | LeadSource,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border/40">
                      <SelectValue placeholder="Todas as origens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {sources.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Tempo de Estagnacao
                  </label>
                  <Select
                    value={filters.stagnation}
                    onValueChange={(v) =>
                      onFiltersChange({
                        ...filters,
                        stagnation: v as "all" | "3" | "7" | "15",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border/40">
                      <SelectValue placeholder="Qualquer tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer tempo</SelectItem>
                      <SelectItem value="3">Parado ha 3+ dias</SelectItem>
                      <SelectItem value="7">Parado ha 7+ dias</SelectItem>
                      <SelectItem value="15">Parado ha 15+ dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Possui Contato
                  </label>
                  <Select
                    value={filters.hasContact}
                    onValueChange={(v) =>
                      onFiltersChange({
                        ...filters,
                        hasContact: v as
                          | "all"
                          | "phone"
                          | "instagram"
                          | "email",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border/40">
                      <SelectValue placeholder="Qualquer informação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer informação</SelectItem>
                      <SelectItem value="phone">Tem Telefone</SelectItem>
                      <SelectItem value="instagram">Tem Instagram</SelectItem>
                      <SelectItem value="email">Tem E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="mr-2 size-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 rounded-full px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 transition-all hover:bg-background"
          >
            Reset
            <X className="ml-1.5 size-3" />
          </Button>
        )}
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
        Mostrando <span className="text-foreground">{filteredCount}</span> de{" "}
        {totalCount} leads
      </p>
    </div>
  )
}
