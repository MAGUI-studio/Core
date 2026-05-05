"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetOrigin, AssetType, AssetVisibility } from "@/src/generated/client"
import {
  Eye,
  EyeSlash,
  File,
  Plus,
  UploadSimple,
  X,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

import { createProjectAssetAction } from "@/src/lib/actions/project.actions"
import { useUploadThing } from "@/src/lib/uploadthing"

interface AssetUploadModalProps {
  projectId: string
  onComplete: () => void
}

export function AssetUploadModal({
  projectId,
  onComplete,
}: AssetUploadModalProps) {
  const t = useTranslations("Admin.projects.details")
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [visibility, setVisibility] = React.useState<AssetVisibility>(
    AssetVisibility.CLIENT
  )

  const { startUpload, isUploading } = useUploadThing("projectAsset", {
    onClientUploadComplete: async (res) => {
      if (res) {
        for (const file of res) {
          await createProjectAssetAction({
            projectId,
            name: file.name,
            url: file.url,
            key: file.key,
            type: AssetType.DOCUMENT,
            origin: AssetOrigin.ADMIN,
            visibility,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        }
        setSelectedFiles([])
        setIsOpen(false)
        toast.success("Upload concluido.")
        onComplete()
      }
    },
  })

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
      setIsOpen(true)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="file"
            multiple
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            onChange={handleSelect}
            title=""
          />
          <Button className="h-20 w-full rounded-4xl border-2 border-dashed border-border/40 bg-muted/5 font-sans font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary">
            <Plus weight="bold" className="mr-3 size-6" /> {t("upload_button")}
          </Button>
        </div>
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
          {t("upload_hint")}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <div className="bg-brand-primary/10 p-10 pb-6">
            <DialogHeader className="gap-5">
              <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
                <UploadSimple weight="bold" className="size-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <DialogTitle className="font-heading text-3xl font-black uppercase text-brand-primary">
                  Confirmar Upload
                </DialogTitle>
                <DialogDescription className="text-xs font-black text-brand-primary/60 uppercase tracking-[0.2em]">
                  Processamento de Arquivos
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="p-10 pt-6">
            <div className="mb-8 grid gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-muted/10 p-2">
                <Button
                  variant={
                    visibility === AssetVisibility.CLIENT ? "default" : "ghost"
                  }
                  className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setVisibility(AssetVisibility.CLIENT)}
                >
                  <Eye className="mr-2 size-4" /> Visivel p/ Cliente
                </Button>
                <Button
                  variant={
                    visibility === AssetVisibility.INTERNAL
                      ? "default"
                      : "ghost"
                  }
                  className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setVisibility(AssetVisibility.INTERNAL)}
                >
                  <EyeSlash className="mr-2 size-4" /> Apenas Interno
                </Button>
              </div>
            </div>
            <div className="mb-10 flex flex-col gap-3 max-h-[350px] overflow-y-auto scrollbar-hide">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-[1.25rem] border border-border/40 bg-muted/10 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <File weight="duotone" className="size-6" />
                    </div>
                    <div className="grid gap-0.5">
                      <span className="truncate text-xs font-black uppercase">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/40">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const f = [...selectedFiles]
                      f.splice(i, 1)
                      setSelectedFiles(f)
                      if (f.length === 0) setIsOpen(false)
                    }}
                    className="hover:text-destructive"
                  >
                    <X weight="bold" className="size-5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Button
                variant="ghost"
                className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest"
                onClick={() => {
                  setSelectedFiles([])
                  setIsOpen(false)
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                className="h-16 rounded-[1.25rem] bg-brand-primary font-black uppercase tracking-widest text-white"
                onClick={() =>
                  startUpload(selectedFiles, {
                    projectId,
                    scope: "assets",
                  } as never)
                }
                disabled={isUploading}
              >
                {isUploading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
