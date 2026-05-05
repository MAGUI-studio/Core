"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Trash, Warning } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { deleteProjectAction } from "@/src/lib/actions/project.actions"

interface DangerZoneProps {
  projectId: string
}

export function DangerZone({ projectId }: DangerZoneProps) {
  const t = useTranslations("Admin.projects.details")
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [confirmValue, setConfirmValue] = React.useState("")
  const [error, setError] = React.useState(false)

  const confirmCode = projectId.slice(-6).toUpperCase()

  const handleDelete = async () => {
    if (confirmValue.toUpperCase() !== confirmCode) {
      setError(true)
      return
    }

    setIsDeleting(true)
    const result = await deleteProjectAction(projectId)
    if (result.success) {
      router.push("/admin/projects")
    } else {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
            <Warning weight="fill" className="size-4" />
            {t("danger_zone_title")}
          </h3>
          <p className="max-w-md text-sm font-medium leading-relaxed text-muted-foreground/60">
            {t("danger_zone_desc")}
          </p>
        </div>

        <Dialog onOpenChange={(open) => !open && setConfirmValue("")}>
          <DialogTrigger asChild>
            <Button className="h-16 rounded-[1.25rem] bg-red-600 px-10 font-sans font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98]">
              <Trash weight="bold" className="mr-3 size-6" />
              {t("delete_project")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] backdrop-blur-xl shadow-2xl text-left">
            <div className="bg-red-600/10 p-10 pb-6">
              <DialogHeader className="gap-5">
                <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-red-600 text-white shadow-xl shadow-red-600/20">
                  <Warning weight="bold" className="size-8" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight text-red-600 leading-none">
                    {t("delete_confirm_title")}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-black text-red-600/60 uppercase tracking-[0.2em]">
                    Ação Crítica e Irreversível
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            <div className="p-10 pt-6">
              <p className="mb-10 text-base font-medium leading-relaxed text-muted-foreground/80">
                {t("delete_confirm_desc")}
              </p>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("delete_confirm_input_label", {
                      fallback: "Confirme o código de segurança:",
                    })}
                  </Label>

                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-center justify-center rounded-[1.5rem] border-2 border-dashed border-red-600/20 bg-red-600/5 py-10">
                      <span className="font-mono text-5xl font-black tracking-[0.5em] text-red-600 drop-shadow-sm">
                        {confirmCode}
                      </span>
                    </div>

                    <Input
                      value={confirmValue}
                      onChange={(e) => {
                        setConfirmValue(e.target.value)
                        setError(false)
                      }}
                      placeholder="DIGITE O CÓDIGO ACIMA"
                      className="h-20 rounded-[1.5rem] border-border/40 bg-muted/10 text-center font-mono text-3xl font-black uppercase tracking-[0.3em] transition-all focus:border-red-600/40 focus:bg-muted/20"
                    />
                  </div>

                  {error && (
                    <p className="text-center text-[10px] font-black text-red-600 uppercase tracking-widest animate-shake">
                      {t("delete_confirm_error")}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-5">
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-16 rounded-[1.25rem] font-sans font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted/10 hover:text-foreground"
                    onClick={() => setConfirmValue("")}
                  >
                    {t("cancel")}
                  </Button>
                </DialogTrigger>
                <Button
                  className="h-16 rounded-[1.25rem] bg-red-600 font-sans font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-30"
                  onClick={handleDelete}
                  disabled={
                    isDeleting || confirmValue.toUpperCase() !== confirmCode
                  }
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-3">
                      <div className="size-5 animate-spin rounded-full border-3 border-white/20 border-t-white" />
                      <span>{t("deleting")}</span>
                    </div>
                  ) : (
                    <span>{t("confirm_delete")}</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
