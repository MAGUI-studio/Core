"use client"

import * as React from "react"

import { DashboardBriefingEntry } from "@/src/types/dashboard"
import { FileText, NotePencil, Plus } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { createBriefingNoteAction } from "@/src/lib/actions/project.actions"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

interface BriefingNotesProps {
  projectId: string
  notes: DashboardBriefingEntry[]
}

export function BriefingNotes({
  projectId,
  notes,
}: BriefingNotesProps): React.JSX.Element {
  const [isAdding, setIsAdding] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    const result = await createBriefingNoteAction({
      projectId,
      title,
      content,
    })

    if (result.success) {
      setTitle("")
      setContent("")
      setIsAdding(false)
      toast.success("Nota de briefing adicionada.")
    } else {
      toast.error(result.error || "Erro ao adicionar nota.")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <FileText weight="fill" className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-black uppercase tracking-tight">
              Briefing Complementar
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Notas vivas e especificacoes detalhadas
            </p>
          </div>
        </div>

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="rounded-full px-5 text-[9px] font-black uppercase tracking-widest"
          >
            <Plus weight="bold" className="mr-2 size-3" />
            Adicionar Nota
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-4 rounded-4xl border border-brand-primary/20 bg-brand-primary/[0.02] p-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo da nota (ex: Regras de Checkout)"
            className="rounded-xl border-border/40 bg-background/50 font-heading text-lg font-black uppercase tracking-tight"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Descreva detalhadamente a especificacao ou observacao..."
            className="min-h-[150px] rounded-xl border-border/40 bg-background/50 text-sm leading-relaxed"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsAdding(false)}
              className="rounded-full text-[9px] font-black uppercase tracking-widest"
            >
              Cancelar
            </Button>
            <Button
              disabled={isSubmitting || !title.trim() || !content.trim()}
              onClick={handleSubmit}
              className="rounded-full px-6 text-[9px] font-black uppercase tracking-widest"
            >
              {isSubmitting ? "Salvando..." : "Salvar Nota"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border-2 border-dashed border-border/10 py-12">
            <NotePencil
              weight="thin"
              className="size-10 text-muted-foreground/15"
            />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/25">
              Nenhuma nota complementar ainda.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group relative rounded-4xl border border-border/40 bg-background/40 p-8 transition-all hover:bg-background/60"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xl font-black uppercase tracking-tight text-foreground/90">
                    {note.title}
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {format(new Date(note.createdAt), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-sm leading-relaxed text-muted-foreground/80">
                    {note.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
