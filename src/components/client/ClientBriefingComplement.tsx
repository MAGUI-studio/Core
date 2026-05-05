"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Plus } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import { createBriefingNoteAction } from "@/src/lib/actions/project-briefing.actions"

interface ClientBriefingComplementProps {
  projectId: string
  notes: {
    id: string
    title: string
    content: string
    createdAt: Date
  }[]
}

export function ClientBriefingComplement({
  projectId,
  notes,
}: ClientBriefingComplementProps): React.JSX.Element {
  const t = useTranslations("Dashboard.project_detail.briefing_complement")
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    startTransition(async () => {
      await createBriefingNoteAction({ projectId, title, content })
      setTitle("")
      setContent("")
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <Card className="overflow-hidden border-border/25 bg-muted/5 shadow-none ring-1 ring-border/5">
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground/60">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("form.title_label")}
              </label>
              <Input
                placeholder={t("form.title_placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-2xl border-border/40 bg-muted/20 px-5 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("form.description_label")}
              </label>
              <Textarea
                placeholder={t("form.description_placeholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-36 resize-none rounded-[1.5rem] border-border/40 bg-muted/20 p-5 text-sm leading-relaxed"
              />
            </div>
            <CardFooter className="p-0">
              <Button
                type="submit"
                disabled={isPending || !title.trim() || !content.trim()}
                className="h-12 w-full rounded-full bg-brand-primary text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
              >
                <Plus weight="bold" className="mr-2 size-4" />
                {isPending ? t("form.submitting") : t("form.submit")}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <div className="grid gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl border border-border/10 bg-muted/5 p-6"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                    {note.title}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="font-sans text-sm font-medium leading-relaxed text-muted-foreground/80">
                  {note.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
