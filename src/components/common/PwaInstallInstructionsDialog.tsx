"use client"

import * as React from "react"

import {
  ArrowSquareOut,
  DotsThreeCircle,
  ShareNetwork,
} from "@phosphor-icons/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

interface PwaInstallInstructionsDialogProps {
  isSafari: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PwaInstallInstructionsDialog({
  isSafari,
  open,
  onOpenChange,
}: PwaInstallInstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-4xl border-0 bg-white p-6 text-black ring-1 ring-black/8 sm:max-w-lg">
        <DialogHeader className="gap-3 pr-8">
          <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight text-black">
            Instalar no iPhone
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-black/72">
            {isSafari
              ? "No iPhone, o app precisa ser adicionado manualmente pela opcao de compartilhar do Safari."
              : "No iPhone, a instalacao do app funciona pelo Safari. Abra esta dashboard no Safari para adicionar a Tela de Inicio."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {!isSafari && (
            <div className="rounded-[1.5rem] bg-sky-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <ArrowSquareOut
                  className="mt-0.5 size-5 shrink-0 text-brand-primary"
                  weight="bold"
                />
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-primary">
                    Primeiro passo
                  </p>
                  <p className="text-sm leading-relaxed text-black">
                    Toque em compartilhar no navegador atual e abra a pagina no
                    Safari.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[1.5rem] bg-slate-100 px-4 py-4">
            <div className="flex items-start gap-3">
              <ShareNetwork
                className="mt-0.5 size-5 shrink-0 text-black"
                weight="duotone"
              />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black">
                  1. Toque em Compartilhar
                </p>
                <p className="text-sm leading-relaxed text-black/70">
                  No Safari, use o botao de compartilhar na barra inferior ou
                  superior.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-100 px-4 py-4">
            <div className="flex items-start gap-3">
              <DotsThreeCircle
                className="mt-0.5 size-5 shrink-0 text-black"
                weight="duotone"
              />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black">
                  2. Adicione a Tela de Inicio
                </p>
                <p className="text-sm leading-relaxed text-black/70">
                  Role a lista de acoes e toque em Adicionar a Tela de Inicio.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-100 px-4 py-4">
            <div className="flex items-start gap-3">
              <ArrowSquareOut
                className="mt-0.5 size-5 shrink-0 text-black"
                weight="duotone"
              />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black">
                  3. Ative o modo app
                </p>
                <p className="text-sm leading-relaxed text-black/70">
                  Se o iPhone mostrar a opcao Open as Web App, deixe ativada e
                  finalize em Adicionar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
