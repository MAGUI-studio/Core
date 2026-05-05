"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ArrowUpRightIcon } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

export function BackToTopButton(): React.JSX.Element {
  const t = useTranslations("Dashboard.footer")

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="h-10 w-max rounded-full border border-border/25 bg-background/40 px-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-foreground/70 hover:bg-background/70"
    >
      {t("back_to_top")}
      <ArrowUpRightIcon weight="bold" className="ml-2 size-3.5" />
    </Button>
  )
}
