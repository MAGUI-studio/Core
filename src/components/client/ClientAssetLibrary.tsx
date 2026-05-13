"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { FileIcon, Files, MagnifyingGlass } from "@phosphor-icons/react"

import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { ClientEmptyState } from "./ClientEmptyState"

interface Asset {
  id: string
  name: string
  url: string
  type: string
  createdAt: Date
}

interface ClientAssetLibraryProps {
  assets: Asset[]
}

export function ClientAssetLibrary({ assets }: ClientAssetLibraryProps) {
  const t = useTranslations("Dashboard.project_detail.empty_states.assets")
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesTab = activeTab === "all" || asset.type === activeTab
    return matchesSearch && matchesTab
  })

  if (assets.length === 0) {
    return (
      <ClientEmptyState
        title={t("title")}
        description={t("description")}
        icon={Files}
      />
    )
  }

  const assetTypes = Array.from(new Set(assets.map((a) => a.type)))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full border-border/40 bg-muted/20 pl-11 pr-4 text-sm transition-all focus:border-brand-primary/40 focus:ring-0"
          />
        </div>

        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger
            size="lg"
            className="h-12 w-full rounded-full border-border/40 bg-muted/10 px-5 text-[10px] font-black uppercase tracking-widest md:w-56"
          >
            <SelectValue placeholder={t("type_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                value="all"
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                {t("filter_all")}
              </SelectItem>
              {assetTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAssets.map((asset) => (
          <a
            key={asset.id}
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 rounded-4xl border border-border/20 bg-muted/5 p-6 transition-all hover:-translate-y-1 hover:border-brand-primary/20 hover:bg-background"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                <FileIcon weight="duotone" className="size-6" />
              </div>
              <Badge
                variant="outline"
                className="rounded-full bg-muted/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 border-none"
              >
                {asset.type}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="truncate font-heading text-lg font-black uppercase tracking-tight text-foreground">
                {asset.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
