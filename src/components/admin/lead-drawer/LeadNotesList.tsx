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
    <div className="relative space-y-8 before:absolute before:left-5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border/30">
      {sortedNotes.map((note) => {
        const authorName = note.author?.name || "Sistema"
        const initials = authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={note.id} className="relative pl-14">
            {/* Avatar / Marker */}
            <div className="absolute left-0 top-0">
              <Avatar className="size-10 border-2 border-background shadow-sm ring-2 ring-border/10 transition-transform hover:scale-110">
                <AvatarFallback className="bg-brand-primary/10 text-[10px] font-black text-brand-primary">
                  {initials || <UserCircle size={20} />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Note Content */}
            <div className="rounded-[1.5rem] border border-border/40 bg-muted/5 p-6 transition-all hover:bg-muted/10">
              <div className="mb-3 flex items-center justify-between gap-4">
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
