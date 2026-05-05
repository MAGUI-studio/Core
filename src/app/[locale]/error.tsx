"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ArrowClockwise, Warning } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.JSX.Element {
  const t = useTranslations("Errors.general")

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-2xl shadow-destructive/20">
        <Warning size={48} weight="duotone" />
      </div>

      <div className="max-w-xl space-y-4">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl uppercase italic">
          {t("title")}
        </h1>
        <p className="text-lg font-medium text-muted-foreground/80">
          {t("description")}
        </p>
      </div>

      <div className="mt-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border/40 bg-muted/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Technical Details
          </span>
        </div>
        <div className="space-y-3 text-left">
          <p className="font-mono text-xs font-bold text-foreground/80 break-words leading-relaxed">
            {error.message || "Unknown error occurred"}
          </p>
          {error.digest && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                Digest
              </span>
              <code className="font-mono text-[10px] text-brand-primary/60">
                {error.digest}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <Button
          onClick={() => reset()}
          className="group h-14 min-w-[200px] cursor-pointer rounded-full bg-foreground px-10 text-[11px] font-black uppercase tracking-[0.3em] text-background transition-all hover:opacity-90 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <ArrowClockwise
              size={18}
              weight="bold"
              className="transition-transform group-hover:rotate-180 duration-500"
            />
            {t("button")}
          </div>
        </Button>

        <p className="text-[10px] font-medium text-muted-foreground/30">
          If this persists, please contact technical support.
        </p>
      </div>
    </div>
  )
}
