"use client"

import * as React from "react"

import { Check, Info, Warning, X } from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps): React.JSX.Element {
  return (
    <Sonner
      theme="system"
      position="top-right"
      closeButton={false}
      expand
      visibleToasts={6}
      icons={{
        success: (
          <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <Check weight="bold" className="size-3.5" />
          </div>
        ),
        info: (
          <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <Info weight="bold" className="size-3.5" />
          </div>
        ),
        warning: (
          <div className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Warning weight="bold" className="size-3.5" />
          </div>
        ),
        error: (
          <div className="flex size-6 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <X weight="bold" className="size-3.5" />
          </div>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full max-w-[380px] items-center gap-4 rounded-none border border-border/40 bg-background/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-brand-primary/20",
          title:
            "font-heading text-[11px] font-black uppercase tracking-[0.2em] text-foreground leading-none",
          description:
            "mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed",
          content: "flex-1 min-w-0",
          icon: "shrink-0",
          success: "border-l-4 border-l-brand-primary",
          error: "border-l-4 border-l-red-500",
          warning: "border-l-4 border-l-amber-500",
          info: "border-l-4 border-l-brand-primary/50",
        },
      }}
      {...props}
    />
  )
}
