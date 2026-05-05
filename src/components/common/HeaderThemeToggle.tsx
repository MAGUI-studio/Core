"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { MoonIcon, SunIcon } from "@phosphor-icons/react"

import { useThemeTransition } from "@/src/lib/hooks/useThemeTransition"

interface HeaderThemeToggleProps {
  compact?: boolean
}

export function HeaderThemeToggle({
  compact = false,
}: HeaderThemeToggleProps): React.JSX.Element {
  const t = useTranslations("ThemeToggle")
  const { resolvedTheme, toggleTheme } = useThemeTransition()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(timer)
  }, [])

  if (!mounted) {
    return (
      <div
        className={
          compact
            ? "h-9 w-9 animate-pulse rounded-full bg-muted/10"
            : "h-10 w-full animate-pulse rounded-2xl bg-muted/10"
        }
      />
    )
  }

  const isLight = resolvedTheme === "light"

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground/75 transition hover:bg-background hover:text-foreground"
        aria-label={isLight ? t("dark") : t("light")}
        title={isLight ? t("dark") : t("light")}
      >
        {isLight ? (
          <MoonIcon weight="duotone" className="size-4" />
        ) : (
          <SunIcon weight="duotone" className="size-4" />
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("label")}
      className="flex w-full items-center justify-between rounded-2xl bg-muted/5 px-4 py-3 text-left transition hover:bg-muted/10"
    >
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {t("label")}
        </p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
          {isLight ? t("light") : t("dark")}
        </p>
      </div>
      <div className="flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground/75">
        {isLight ? (
          <SunIcon weight="duotone" className="size-4" />
        ) : (
          <MoonIcon weight="duotone" className="size-4" />
        )}
      </div>
    </button>
  )
}
