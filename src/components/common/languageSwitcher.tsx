"use client"

import * as React from "react"

import { useLocale, useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { AppPathnames, locales } from "@/src/i18n/config"
import { usePathname, useRouter } from "@/src/i18n/navigation"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { motion } from "framer-motion"
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
  es: "ES",
  de: "DE",
  fr: "FR",
}

export function LanguageSwitcher(): React.JSX.Element {
  const t = useTranslations("Locale")
  const currentLocale = useLocale()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

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

  if (!mounted) {
    return <div className="h-8 w-20 animate-pulse rounded-full bg-muted/10" />
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="cursor-pointer outline-none focus-visible:ring-0 focus:ring-0">
        <div className="group flex h-8 items-center gap-2 rounded-full px-3 transition-all hover:bg-muted/10">
          <div className="flex items-center gap-2">
            <ReactCountryFlag
              countryCode={flagCodes[currentLocale]}
              svg
              className="rounded-xs transition-all"
              style={{ width: "1.1em", height: "0.8em" }}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors">
              {currentLocale}
            </span>
          </div>
          <CaretDownIcon
            weight="bold"
            size={10}
            className="text-muted-foreground transition-colors"
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-110 w-40 animate-in rounded-2xl border border-border/60 bg-background/95 p-1.5 shadow-xl shadow-black/5 backdrop-blur-xl duration-200 zoom-in-95 fade-in"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              "group mb-0.5 flex cursor-pointer items-center justify-between rounded-2xl px-2.5 py-2 text-sm transition-all last:mb-0",
              currentLocale === loc
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2.5">
              <ReactCountryFlag
                countryCode={flagCodes[loc]}
                svg
                className={cn(
                  "rounded-[2px] transition-all",
                  currentLocale === loc
                    ? "opacity-100"
                    : "opacity-60 grayscale-[0.4] group-hover:opacity-100 group-hover:grayscale-0"
                )}
                style={{ width: "1.2em", height: "0.9em" }}
              />
              <span className="tracking-tight">{t(loc)}</span>
            </div>
            {currentLocale === loc && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <CheckIcon
                  weight="duotone"
                  size={12}
                  className="text-foreground/70"
                />
              </motion.div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
