"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetOrigin, AssetType, AssetVisibility } from "@/src/generated/client"
import { DashboardAsset } from "@/src/types/dashboard"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"

import {
  deleteProjectAssetAction,
  updateProjectAssetAction,
  updateProjectAssetsOrderAction,
} from "@/src/lib/actions/project.actions"

import { AssetItem } from "./assets/AssetItem"
import { AssetManagementHeader } from "./assets/AssetManagementHeader"
import { AssetUploadModal } from "./assets/AssetUploadModal"

export function AssetManagement({
  projectId,
  assets: initialAssets,
}: {
  projectId: string
  assets: DashboardAsset[]
}) {
  const t = useTranslations("Admin.projects.details")
  const [assets, setAssets] = React.useState(initialAssets)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [typeFilter, setTypeFilter] = React.useState<AssetType | "ALL">("ALL")
  const [originFilter, setOriginFilter] = React.useState<AssetOrigin | "ALL">(
    "ALL"
  )
  const [visibilityFilter, setVisibilityFilter] = React.useState<
    AssetVisibility | "ALL"
  >("ALL")

  React.useEffect(() => setAssets(initialAssets), [initialAssets])

  const sensors = useSensors(useSensor(PointerSensor))

  const visibleAssets = assets.filter((a) => {
    if (typeFilter !== "ALL" && a.type !== typeFilter) return false
    if (originFilter !== "ALL" && a.origin !== originFilter) return false
    if (visibilityFilter !== "ALL" && a.visibility !== visibilityFilter)
      return false
    return true
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((item) => item.id === active.id)
      const newIndex = assets.findIndex((item) => item.id === over.id)
      const nextAssets = arrayMove(assets, oldIndex, newIndex)
      setAssets(nextAssets)
      await updateProjectAssetsOrderAction(
        projectId,
        nextAssets.map((a) => a.id)
      )
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <AssetManagementHeader
        assetsCount={assets.length}
        visibleCount={visibleAssets.length}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        originFilter={originFilter}
        onOriginFilterChange={setOriginFilter}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {visibleAssets.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-4xl border-2 border-dashed border-border/20 bg-muted/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
              {assets.length === 0
                ? t("no_assets")
                : "Nenhum arquivo neste filtro"}
            </p>
          </div>
        ) : (
          <SortableContext
            items={visibleAssets.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleAssets.map((a, i) => (
                <AssetItem
                  key={a.id}
                  asset={a}
                  index={i}
                  isDeleting={isDeleting === a.id}
                  onDelete={async (id, key) => {
                    setIsDeleting(id)
                    await deleteProjectAssetAction(id, projectId, key)
                    setIsDeleting(null)
                  }}
                  onToggleVisibility={async (asset) => {
                    const next =
                      asset.visibility === AssetVisibility.CLIENT
                        ? AssetVisibility.INTERNAL
                        : AssetVisibility.CLIENT
                    setAssets((curr) =>
                      curr.map((item) =>
                        item.id === asset.id
                          ? { ...item, visibility: next }
                          : item
                      )
                    )
                    const res = await updateProjectAssetAction({
                      id: asset.id,
                      projectId,
                      name: asset.name,
                      type: asset.type,
                      visibility: next,
                    })
                    if (res.error) {
                      setAssets((curr) =>
                        curr.map((item) =>
                          item.id === asset.id
                            ? { ...item, visibility: asset.visibility }
                            : item
                        )
                      )
                      toast.error(res.error)
                    } else toast.success(t("asset_visibility_updated"))
                  }}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </DndContext>

      <AssetUploadModal projectId={projectId} onComplete={() => {}} />
    </div>
  )
}
