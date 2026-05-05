import * as React from "react"

import { getTranslations } from "next-intl/server"

import { DashboardAsset } from "@/src/types/dashboard"
import {
  ArrowSquareOut,
  DownloadSimple,
  FileCode,
  FilePdf,
  Files,
  Image as ImageIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"

interface ClientAssetCardProps {
  asset: DashboardAsset
}

export async function ClientAssetCard({
  asset,
}: ClientAssetCardProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.projects.details.asset_types")

  const iconMap = {
    CONTRACT: FilePdf,
    DOCUMENT: FilePdf,
    IMAGE: ImageIcon,
    SOURCE_CODE: FileCode,
    DESIGN_SYSTEM: Files,
  }

  const Icon = iconMap[asset.type] || Files

  return (
    <Card className="group relative overflow-hidden rounded-[1.5rem] border-border/20 bg-muted/5 transition-all hover:-translate-y-0.5 hover:border-brand-primary/20 hover:bg-background">
      <CardContent className="flex h-full flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-border/20">
            <Icon weight="duotone" className="size-6" />
          </div>

          <div className="flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full bg-muted/30 text-muted-foreground hover:bg-brand-primary hover:text-white"
            >
              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                <ArrowSquareOut weight="bold" className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex min-h-24 flex-col gap-1 overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary/60">
            {t(asset.type)}
          </p>
          <h4 className="truncate font-heading text-lg font-black uppercase tracking-tight text-foreground/90">
            {asset.name}
          </h4>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
            Adicionado em{" "}
            {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-auto h-10 w-full rounded-full border-border/40 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
        >
          <a href={asset.url} download={asset.name}>
            <DownloadSimple className="mr-2 size-3.5" />
            Download
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
