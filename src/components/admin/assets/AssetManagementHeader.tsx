"use client"

import * as React from "react"

import { AssetOrigin, AssetType, AssetVisibility } from "@/src/generated/client"

interface AssetManagementHeaderProps {
  assetsCount: number
  visibleCount: number
  typeFilter: AssetType | "ALL"
  onTypeFilterChange: (v: AssetType | "ALL") => void
  originFilter: AssetOrigin | "ALL"
  onOriginFilterChange: (v: AssetOrigin | "ALL") => void
  visibilityFilter: AssetVisibility | "ALL"
  onVisibilityFilterChange: (v: AssetVisibility | "ALL") => void
}

export function AssetManagementHeader({
  assetsCount,
  visibleCount,
  typeFilter,
  onTypeFilterChange,
  originFilter,
  onOriginFilterChange,
  visibilityFilter,
  onVisibilityFilterChange,
}: AssetManagementHeaderProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/45 p-4 md:grid-cols-4">
      <div className="space-y-1 md:col-span-1">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
          Arquivos
        </p>
        <p className="text-sm font-medium text-muted-foreground/65">
          {visibleCount} de {assetsCount} exibidos
        </p>
      </div>

      <select
        value={typeFilter}
        onChange={(e) =>
          onTypeFilterChange(e.target.value as AssetType | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">Todos os tipos</option>
        <option value={AssetType.CONTRACT}>Contrato</option>
        <option value={AssetType.DESIGN_SYSTEM}>Design system</option>
        <option value={AssetType.IMAGE}>Imagem</option>
        <option value={AssetType.DOCUMENT}>Documento</option>
        <option value={AssetType.SOURCE_CODE}>Código-fonte</option>
      </select>

      <select
        value={originFilter}
        onChange={(e) =>
          onOriginFilterChange(e.target.value as AssetOrigin | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">Todas as origens</option>
        <option value={AssetOrigin.ADMIN}>Time interno</option>
        <option value={AssetOrigin.CLIENT}>Cliente</option>
      </select>

      <select
        value={visibilityFilter}
        onChange={(e) =>
          onVisibilityFilterChange(e.target.value as AssetVisibility | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">Toda visibilidade</option>
        <option value={AssetVisibility.CLIENT}>Visível ao cliente</option>
        <option value={AssetVisibility.INTERNAL}>Interno</option>
      </select>
    </div>
  )
}
