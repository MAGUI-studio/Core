"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

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
  const t = useTranslations("Admin.projects.details")

  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/45 p-4 md:grid-cols-4">
      <div className="space-y-1 md:col-span-1">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
          {t("assets_eyebrow")}
        </p>
        <p className="text-sm font-medium text-muted-foreground/65">
          {t("assets_count_info", { visibleCount, assetsCount })}
        </p>
      </div>

      <select
        value={typeFilter}
        onChange={(e) =>
          onTypeFilterChange(e.target.value as AssetType | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">{t("asset_type_all")}</option>
        <option value={AssetType.CONTRACT}>{t("asset_types.CONTRACT")}</option>
        <option value={AssetType.DESIGN_SYSTEM}>
          {t("asset_types.DESIGN_SYSTEM")}
        </option>
        <option value={AssetType.IMAGE}>{t("asset_types.IMAGE")}</option>
        <option value={AssetType.DOCUMENT}>{t("asset_types.DOCUMENT")}</option>
        <option value={AssetType.SOURCE_CODE}>
          {t("asset_types.SOURCE_CODE")}
        </option>
      </select>

      <select
        value={originFilter}
        onChange={(e) =>
          onOriginFilterChange(e.target.value as AssetOrigin | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">{t("asset_origin_all")}</option>
        <option value={AssetOrigin.ADMIN}>{t("asset_origins.ADMIN")}</option>
        <option value={AssetOrigin.CLIENT}>{t("asset_origins.CLIENT")}</option>
      </select>

      <select
        value={visibilityFilter}
        onChange={(e) =>
          onVisibilityFilterChange(e.target.value as AssetVisibility | "ALL")
        }
        className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
      >
        <option value="ALL">{t("asset_visibility_all")}</option>
        <option value={AssetVisibility.CLIENT}>
          {t("asset_visibilities.CLIENT")}
        </option>
        <option value={AssetVisibility.INTERNAL}>
          {t("asset_visibilities.INTERNAL")}
        </option>
      </select>
    </div>
  )
}
