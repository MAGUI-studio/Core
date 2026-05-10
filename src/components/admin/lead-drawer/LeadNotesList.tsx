"use client"

import * as React from "react"

import { LeadNote } from "@/src/types/crm"
import { ChatCircleText, Clock, UserCircle } from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"

interface LeadNotesListProps {
  notes: LeadNote[]
}

export function LeadNotesList({
  notes,
}: LeadNotesListProps): React.JSX.Element {
  if (!notes || notes.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="mb-4 flex justify-center">
          <ChatCircleText
            size={32}
            className="text-muted-foreground/20"
            weight="duotone"
          />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
          Nenhum insight estratégico registrado.
        </p>
      </div>
    )
  }

  // Sort notes by date descending
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-4.5">
      {sortedNotes.map((note) => {
        const authorName = note.author?.name || "Sistema"
        const initials = authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={note.id} className="flex items-start gap-3.5">
            <div className="pt-1">
              <Avatar className="size-10 border border-border/10">
                <AvatarFallback className="bg-brand-primary/10 text-[10px] font-black text-brand-primary">
                  {initials || <UserCircle size={20} />}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1 rounded-[1.25rem] bg-muted/[0.03] p-5 sm:p-6">
              <div className="mb-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                    {authorName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-muted-foreground/40">
                  <Clock size={12} weight="bold" />
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>

              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-muted-foreground/80">
                {note.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
