"use client"

import * as React from "react"

import { useLocale, useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { AppPathnames, locales } from "@/src/i18n/config"
import { usePathname, useRouter } from "@/src/i18n/navigation"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import Cookies from "js-cookie"
import ReactCountryFlag from "react-country-flag"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import { cn } from "@/src/lib/utils/utils"

const flagCodes: Record<string, string> = {
  en: "US",
  pt: "BR",
}

interface HeaderLanguageSwitcherProps {
  compact?: boolean
}

export function HeaderLanguageSwitcher({
  compact = false,
}: HeaderLanguageSwitcherProps): React.JSX.Element {
  const t = useTranslations("Locale")
  const tLanguage = useTranslations("LanguageSwitcher")
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()

  const handleLocaleChange = (newLocale: string): void => {
    if (newLocale === currentLocale) return

    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 })

    if (
      pathname === "/admin/clients/[id]" ||
      pathname === "/admin/projects/[id]" ||
      pathname === "/admin/projects/[id]/assets" ||
      pathname === "/projects/[id]" ||
      pathname === "/projects/[id]/timeline" ||
      pathname === "/projects/[id]/approvals" ||
      pathname === "/projects/[id]/files" ||
      pathname === "/projects/[id]/briefing" ||
      pathname === "/projects/[id]/tasks"
    ) {
      if (typeof params.id !== "string") {
        return
      }

      type RouterHref = Parameters<typeof router.replace>[0]
      router.replace(
        {
          pathname: pathname as AppPathnames,
          params: { id: params.id },
        } as RouterHref,
        { locale: newLocale }
      )
      return
    }

    type RouterHref = Parameters<typeof router.replace>[0]
    router.replace(pathname as RouterHref, { locale: newLocale })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={tLanguage("label")}
        className="cursor-pointer outline-none focus-visible:ring-0 focus:ring-0"
      >
        {compact ? (
          <div className="flex size-9 items-center justify-center rounded-full bg-background/70 transition hover:bg-background">
            <ReactCountryFlag
              countryCode={flagCodes[currentLocale]}
              svg
              style={{ width: "1.1em", height: "0.8em" }}
            />
          </div>
        ) : (
          <div className="flex w-full items-center justify-between rounded-2xl bg-muted/5 px-4 py-3 transition hover:bg-muted/10">
            <div className="flex items-center gap-3">
              <ReactCountryFlag
                countryCode={flagCodes[currentLocale]}
                svg
                style={{ width: "1.2em", height: "0.9em" }}
              />
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  {tLanguage("label")}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
                  {t(currentLocale)}
                </p>
              </div>
            </div>
            <CaretDownIcon className="size-3 text-muted-foreground/40" />
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-110 w-40 rounded-2xl border border-border/60 bg-background/95 p-1.5 shadow-xl shadow-black/5 backdrop-blur-xl"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              "mb-0.5 flex cursor-pointer items-center justify-between rounded-2xl px-2.5 py-2 text-sm transition-all last:mb-0",
              currentLocale === loc
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2.5">
              <ReactCountryFlag
                countryCode={flagCodes[loc]}
                svg
                style={{ width: "1.2em", height: "0.9em" }}
              />
              <span className="tracking-tight">{t(loc)}</span>
            </div>
            {currentLocale === loc && (
              <CheckIcon
                weight="duotone"
                size={12}
                className="text-foreground/70"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
