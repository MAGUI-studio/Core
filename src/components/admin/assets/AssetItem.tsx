"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetOrigin, AssetVisibility } from "@/src/generated/client"
import { DashboardAsset } from "@/src/types/dashboard"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Clock,
  DotsSixVertical,
  Eye,
  EyeSlash,
  File,
  Trash,
  User,
  Warning,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { formatLocalTime } from "@/src/lib/utils/utils"

interface AssetItemProps {
  asset: DashboardAsset
  index: number
  onDelete: (id: string, key: string) => void
  onToggleVisibility: (asset: DashboardAsset) => void
  isDeleting: boolean
}

export function AssetItem({
  asset,
  index,
  onDelete,
  onToggleVisibility,
  isDeleting,
}: AssetItemProps) {
  const t = useTranslations("Admin.projects.details")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col gap-5 rounded-3xl border border-border/40 bg-background/50 p-6 transition-all hover:border-brand-primary/30 hover:bg-muted/5 ${isDragging ? "opacity-50 border-brand-primary shadow-2xl" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-brand-primary transition-colors"
          >
            <DotsSixVertical weight="bold" className="size-5" />
          </div>
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <File weight="duotone" className="size-6" />
            <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-primary font-heading text-[10px] font-black text-white ring-4 ring-background">
              {index + 1}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden gap-1">
            <span className="truncate text-xs font-black uppercase tracking-tight text-foreground">
              {asset.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${asset.origin === AssetOrigin.CLIENT ? "bg-amber-500/10 text-amber-600" : "bg-brand-primary/10 text-brand-primary"}`}
              >
                <User weight="fill" className="size-2.5" />{" "}
                {asset.origin === AssetOrigin.CLIENT ? "Cliente" : "Time"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${asset.visibility === AssetVisibility.CLIENT ? "bg-green-500/10 text-green-600" : "bg-muted/20 text-muted-foreground"}`}
              >
                {asset.visibility === AssetVisibility.CLIENT ? (
                  <Eye weight="fill" className="size-2.5" />
                ) : (
                  <EyeSlash weight="fill" className="size-2.5" />
                )}{" "}
                {asset.visibility === AssetVisibility.CLIENT
                  ? "Publico"
                  : "Interno"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
            onClick={() => onToggleVisibility(asset)}
            disabled={isDeleting}
          >
            {asset.visibility === AssetVisibility.CLIENT ? (
              <EyeSlash weight="bold" className="size-5" />
            ) : (
              <Eye weight="bold" className="size-5" />
            )}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-xl text-muted-foreground/40 hover:bg-red-600/10 hover:text-red-600"
                disabled={isDeleting}
              >
                <Trash weight="bold" className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
              <div className="bg-red-600/10 p-10 pb-6">
                <DialogHeader className="gap-5">
                  <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-red-600 text-white">
                    <Warning weight="bold" className="size-8" />
                  </div>
                  <div>
                    <DialogTitle className="font-heading text-3xl font-black uppercase text-red-600">
                      Excluir
                    </DialogTitle>
                  </div>
                </DialogHeader>
              </div>
              <div className="p-10 pt-6">
                <p className="mb-10 text-muted-foreground/80">
                  {t("delete_asset_confirm_desc")}
                </p>
                <Button
                  className="h-16 w-full rounded-[1.25rem] bg-red-600 font-black uppercase tracking-widest text-white"
                  onClick={() => onDelete(asset.id, asset.key)}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleting") : t("confirm_delete")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 rounded-xl bg-muted/10 px-3 py-1.5">
          <Clock weight="bold" className="size-3 text-muted-foreground/30" />
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
            {formatLocalTime(new Date(asset.createdAt), asset.timezone)}
          </span>
        </div>
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-center rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-5 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary hover:text-white"
        >
          {t("visualize")}
        </a>
      </div>
    </div>
  )
}
