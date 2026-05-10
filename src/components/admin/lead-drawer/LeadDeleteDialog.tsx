"use client"

import * as React from "react"

import { Trash } from "@phosphor-icons/react"
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
        <DialogContent className="w-[min(96vw,72rem)] max-w-[72rem] rounded-[2.5rem] border border-border/30 bg-background p-8 text-left shadow-2xl sm:p-10">
          <DialogHeader className="gap-3">
            <DialogTitle className="font-heading text-3xl font-black tracking-tight text-foreground">
              Excluir lead
            </DialogTitle>
            <DialogDescription className="max-w-none text-sm leading-relaxed text-muted-foreground/75">
              Essa acao remove o lead da empresa {companyName} em definitivo.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 grid gap-4">
            <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-muted/30 p-4 text-sm text-foreground/80">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                  Empresa
                </span>
                <span className="text-right font-black uppercase">
                  {companyName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                  Validacao
                </span>
                <span className="font-mono text-sm font-black tracking-[0.25em] text-foreground">
                  {code}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Confirme o codigo:
              </Label>
              <div className="flex items-center justify-center rounded-[1.5rem] border border-border/30 bg-muted/20 py-8">
                <span className="font-mono text-4xl font-black tracking-[0.5em] text-foreground">
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
                className="h-16 rounded-[1.5rem] border-border/40 bg-muted/10 text-center font-mono text-2xl font-black uppercase tracking-[0.3em]"
              />
              {error && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-600">
                  O codigo nao confere.
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-5">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="h-16 rounded-[1.25rem] border-border/30 bg-background px-6 text-base font-black uppercase tracking-widest"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                className="h-16 rounded-[1.25rem] bg-red-600 px-6 text-base font-black uppercase tracking-widest text-white hover:bg-red-700"
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
