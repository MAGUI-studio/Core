"use client"

import * as React from "react"

import { SavedView } from "@/src/types/crm"
import { MagnifyingGlass, Star, Trash } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

import { CRMFilters, KanbanFilters } from "../KanbanFilters"

interface KanbanHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filters: CRMFilters
  onFiltersChange: (f: CRMFilters) => void
  totalCount: number
  filteredCount: number
  viewItems: SavedView[]
  onApplyView: (v: SavedView) => void
  onDeleteView: (id: string) => void
  onSaveView: (name: string) => void
  isSavingView: boolean
  isDeletingViewId: string | null
  density: "comfortable" | "compact"
  onDensityChange: (d: "comfortable" | "compact") => void
}

export function KanbanHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  viewItems,
  onApplyView,
  onDeleteView,
  onSaveView,
  isSavingView,
  isDeletingViewId,
  density,
  onDensityChange,
}: KanbanHeaderProps) {
  const [viewName, setViewName] = React.useState("")

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <KanbanFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
        <div className="relative w-full max-w-md">
          <MagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/55" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar lead..."
            className="h-12 rounded-full border-border/60 bg-background/80 pl-11"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/30 bg-background/55 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
            <Star weight="duotone" className="size-4 text-brand-primary" />{" "}
            Visões salvas
          </span>
          {viewItems.map((v) => (
            <div
              key={v.id}
              className="inline-flex items-center overflow-hidden rounded-full border border-border/35 bg-muted/10"
            >
              <button
                type="button"
                onClick={() => onApplyView(v)}
                className="px-3 py-2 text-[9px] font-black uppercase text-foreground/75 hover:text-brand-primary"
              >
                {v.name}
              </button>
              <button
                type="button"
                disabled={isDeletingViewId === v.id}
                onClick={() => onDeleteView(v.id)}
                className="border-l border-border/30 px-2 py-2 text-muted-foreground/45 hover:text-destructive"
              >
                <Trash weight="duotone" className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="inline-flex rounded-full border border-border/35 bg-muted/10 p-1">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDensityChange(d)}
                className={`rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${density === d ? "bg-foreground text-background" : "text-muted-foreground/65 hover:text-foreground"}`}
              >
                {d === "comfortable" ? "Conforto" : "Compacto"}
              </button>
            ))}
          </div>
          <Input
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Nome da visão"
            className="h-10 min-w-56 rounded-full border-border/50 bg-background/80"
          />
          <Button
            onClick={() => {
              onSaveView(viewName)
              setViewName("")
            }}
            disabled={isSavingView}
            className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-[0.18em]"
          >
            {isSavingView ? "Salvando" : "Salvar filtros"}
          </Button>
        </div>
      </div>
    </div>
  )
}
