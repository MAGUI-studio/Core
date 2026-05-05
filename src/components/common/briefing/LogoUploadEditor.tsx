"use client"

import * as React from "react"

import Image from "next/image"

import { CircleNotch, CloudArrowUp, X } from "@phosphor-icons/react"
import { generateReactHelpers } from "@uploadthing/react"

import { markActionItemAsCompletedAction } from "@/src/lib/actions/project-briefing.actions"
import { cn } from "@/src/lib/utils/utils"

import type { ourFileRouter } from "@/src/app/api/uploadthing/core"

const { useUploadThing } = generateReactHelpers<typeof ourFileRouter>()

interface LogoUploadEditorProps {
  projectId: string
  value: {
    primary: { name: string; url: string; key: string } | null
    secondary: { name: string; url: string; key: string } | null
  }
  onValueChange: (
    key: "primary" | "secondary",
    asset: { name: string; url: string; key: string } | null
  ) => void
}

export function LogoUploadEditor({
  projectId,
  value,
  onValueChange,
}: LogoUploadEditorProps) {
  const { isUploading, startUpload } = useUploadThing("projectAsset", {
    onClientUploadComplete: () => {
      // Logic handled in handleFileChange
    },
    onUploadError: (error: Error) => {
      alert(`Erro no upload: ${error.message}`)
    },
  })

  const [activeUpload, setActiveUpload] = React.useState<string | null>(null)

  const handleFileChange = async (
    key: "primary" | "secondary",
    files: File[]
  ) => {
    if (!files.length) return

    setActiveUpload(key)
    const res = await startUpload(files)

    if (res && res[0]) {
      const asset = {
        name: res[0].name,
        url: res[0].url,
        key: res[0].key,
      }
      onValueChange(key, asset)
      if (key === "primary") {
        await markActionItemAsCompletedAction(
          projectId,
          "Enviar logo principal da marca (Vetor/PNG)"
        )
      }
    }
    setActiveUpload(null)
  }

  const renderUploadArea = (key: "primary" | "secondary", label: string) => {
    const file = value[key]
    const loading = isUploading && activeUpload === key

    if (file) {
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
          </label>
          <div className="relative group aspect-video flex items-center justify-center rounded-4xl border-2 border-dashed border-brand-primary/20 bg-brand-primary/5 transition-all overflow-hidden">
            <Image
              src={file.url}
              alt={label}
              fill
              className="object-contain p-8"
            />
            <button
              onClick={() => onValueChange(key, null)}
              className="absolute top-4 right-4 size-8 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-destructive/20"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </label>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-border/40 bg-muted/5 p-12 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5",
            loading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) =>
              handleFileChange(key, Array.from(e.target.files || []))
            }
            accept="image/*, .pdf, .svg, .ai, .eps"
          />
          {loading ? (
            <CircleNotch
              size={40}
              className="animate-spin text-brand-primary"
            />
          ) : (
            <CloudArrowUp size={40} className="text-muted-foreground/40" />
          )}
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {loading ? "Enviando arquivo..." : "Clique ou arraste o arquivo"}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground/50 mt-1">
              Vetor, SVG ou PNG transparente
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
      {renderUploadArea("primary", "Logo Principal (Vetor/PNG) *")}
      {renderUploadArea("secondary", "Logo Secundário (Opcional)")}
    </div>
  )
}
