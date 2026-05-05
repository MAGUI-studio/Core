"use client"

import * as React from "react"

import { Trash, Warning } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { deleteLead } from "@/src/lib/actions/crm.actions"

interface LeadDeleteDialogProps {
  leadId: string
  companyName: string
  onDeleted: (id: string) => void
}

export function LeadDeleteDialog({
  leadId,
  companyName,
  onDeleted,
}: LeadDeleteDialogProps) {
  const [confirmValue, setConfirmValue] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState(false)
  const code = leadId.slice(-6).toUpperCase()

  const handleDelete = async () => {
    if (confirmValue.toUpperCase() !== code) {
      setError(true)
      return
    }
    setIsDeleting(true)
    const result = await deleteLead(leadId)
    if (result.success) {
      toast.success("Lead removido.")
      onDeleted(leadId)
    } else {
      toast.error("Erro ao remover lead.")
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-3 border-t border-border/15 pt-8">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700 dark:text-red-300">
        Remover lead
      </p>
      <Dialog
        onOpenChange={() => {
          setConfirmValue("")
          setError(false)
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-red-500/20 text-red-700 hover:bg-red-500/10 dark:text-red-300"
          >
            <Trash className="mr-2 size-4" /> Excluir lead
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl overflow-hidden rounded-[2.5rem] border-none bg-background/95 p-0 text-left shadow-2xl">
          <div className="bg-red-600/10 p-10 pb-6">
            <DialogHeader className="gap-5">
              <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-red-600 text-white shadow-xl shadow-red-600/20">
                <Warning weight="bold" className="size-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <DialogTitle className="font-heading text-3xl font-black tracking-tight text-red-600">
                  Excluir lead
                </DialogTitle>
                <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-red-600/60">
                  Acao critica e irreversivel
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="p-10 pt-6">
            <p className="mb-10 text-base font-medium leading-relaxed text-muted-foreground/80">
              Essa acao remove {companyName} em definitivo.
            </p>
            <div className="flex flex-col gap-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Confirme o codigo:
              </Label>
              <div className="flex items-center justify-center rounded-[1.5rem] border-2 border-dashed border-red-600/20 bg-red-600/5 py-10">
                <span className="font-mono text-5xl font-black tracking-[0.5em] text-red-600">
                  {code}
                </span>
              </div>
              <Input
                value={confirmValue}
                onChange={(e) => {
                  setConfirmValue(e.target.value)
                  setError(false)
                }}
                placeholder="DIGITE O CODIGO ACIMA"
                className="h-20 rounded-[1.5rem] border-border/40 bg-muted/10 text-center font-mono text-3xl font-black uppercase tracking-[0.3em]"
              />
              {error && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-600">
                  O codigo nao confere.
                </p>
              )}
            </div>
            <div className="mt-12 grid grid-cols-2 gap-5">
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                className="h-16 rounded-[1.25rem] bg-red-600 font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isDeleting || confirmValue.toUpperCase() !== code}
              >
                {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
