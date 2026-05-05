"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  ArrowUpRightIcon,
  CaretDown,
  ChartLineUp,
  ChartPie,
  DownloadSimple,
  House,
  Link as LinkIcon,
  List,
  Money,
  ProjectorScreen,
  SignOut,
  Tag,
  Users,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"
import { PwaInstallInstructionsDialog } from "@/src/components/common/PwaInstallInstructionsDialog"
import {
  type HeaderNavLeaf,
  getAdminHeaderNav,
  getClientHeaderNav,
  isNavItemActive,
} from "@/src/components/common/header/navigation"

import { usePwaInstall } from "@/src/hooks/use-pwa-install"

interface MobileHeaderMenuProps {
  viewer: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  } | null
}

function NavIcon({
  icon,
  className,
}: {
  icon: HeaderNavLeaf["icon"]
  className?: string
}) {
  switch (icon) {
    case "dashboard":
      return <ChartPie weight="duotone" className={className} />
    case "home":
      return <House weight="duotone" className={className} />
    case "crm":
      return <ChartLineUp weight="duotone" className={className} />
    case "clients":
      return <Users weight="duotone" className={className} />
    case "projects":
      return <ProjectorScreen weight="duotone" className={className} />
    case "tag":
      return <Tag weight="bold" className={className} />
    case "link":
      return <LinkIcon weight="bold" className={className} />
    case "money":
      return <Money weight="duotone" className={className} />
    case "list":
    case "plus":
    default:
      return <List weight="duotone" className={className} />
  }
}

export function MobileHeaderMenu({
  viewer,
}: MobileHeaderMenuProps): React.JSX.Element {
  const t = useTranslations("Sidebar")
  const tPwa = useTranslations("Sidebar.pwa")
  const pathname = usePathname()
  const [showInstructions, setShowInstructions] = React.useState(false)
  const { isSafari, isStandalone, installStatus, promptInstall } =
    usePwaInstall()
  const shouldShowInstallAction =
    !isStandalone && installStatus !== "unavailable"

  const handlePwaAction = React.useCallback(() => {
    if (installStatus === "manual") {
      setShowInstructions(true)
      return
    }

    void promptInstall()
  }, [installStatus, promptInstall])

  if (!viewer) {
    return (
      <div className="size-9 animate-pulse rounded-full bg-muted/20 lg:hidden" />
    )
  }

  const adminNav = getAdminHeaderNav(t)
  const clientNav = getClientHeaderNav(t)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-[1.15rem] border border-white/10 bg-background/80 text-foreground shadow-[0_14px_30px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all hover:scale-[1.02] hover:border-brand-primary/20 hover:bg-background lg:hidden"
          aria-label={t("menu")}
        >
          <List weight="bold" className="size-4.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-white/10 bg-background/95 p-0 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:max-w-md"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-white/10 px-5 pt-5 pb-4 text-left">
            <SheetTitle className="font-heading text-[9px] font-black uppercase tracking-[0.42em] text-brand-primary">
              {t("menu")}
            </SheetTitle>

            <div className="mt-4 overflow-hidden bg-transparent px-3.5 py-3 shadow-none">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 shadow-sm">
                  <AvatarImage
                    src={viewer.imageUrl ?? undefined}
                    alt={viewer.fullName || ""}
                  />
                  <AvatarFallback className="rounded-[1.1rem] bg-muted text-sm font-black uppercase text-foreground">
                    {viewer.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-black uppercase tracking-[0.04em] text-foreground">
                    {viewer.firstName || viewer.fullName?.split(" ")[0]}
                  </span>
                  <span className="mt-0.5 truncate font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {viewer.isAdmin
                      ? t("user.admin_role")
                      : t("user.client_role")}
                  </span>
                  <span className="mt-1 truncate text-[11px] text-muted-foreground/80">
                    {viewer.email}
                  </span>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-4 flex items-center gap-2">
              <HeaderLanguageSwitcher compact />
              <HeaderThemeToggle compact />
            </div>

            <nav className="grid gap-2.5">
              {viewer.isAdmin ? (
                <>
                  <SheetClose asChild>
                    <Link
                      href={adminNav.dashboard.href}
                      className={`flex min-h-[52px] items-center gap-3.5 rounded-[1.4rem] border px-4 transition-all active:scale-[0.98] ${
                        isNavItemActive(pathname, adminNav.dashboard)
                          ? "border-brand-primary/20 bg-brand-primary text-white shadow-[0_18px_30px_-20px_rgba(0,147,200,0.9)]"
                          : "border-white/10 bg-white/55 text-muted-foreground/80 hover:border-brand-primary/10 hover:bg-white/75 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/8"
                      }`}
                    >
                      <NavIcon
                        icon={adminNav.dashboard.icon}
                        className="size-5"
                      />
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em]">
                        {adminNav.dashboard.label}
                      </span>
                    </Link>
                  </SheetClose>

                  {adminNav.groups.map((group) => {
                    const defaultOpen = group.items.some((item) =>
                      isNavItemActive(pathname, item)
                    )

                    return (
                      <Collapsible
                        key={group.label}
                        defaultOpen={defaultOpen}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger className="flex min-h-[52px] w-full items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/45 px-4 text-left transition-all hover:border-brand-primary/10 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/8">
                          <div className="flex items-center gap-3.5">
                            <NavIcon
                              icon={group.icon}
                              className="size-5 text-brand-primary"
                            />
                            <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-foreground">
                              {group.label}
                            </span>
                          </div>
                          <CaretDown className="size-4 text-muted-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2.5 grid gap-2 pl-3">
                          {group.items.map((item) => (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={`flex min-h-[48px] items-center gap-3 rounded-[1.2rem] border px-4 transition-all active:scale-[0.98] ${
                                  isNavItemActive(pathname, item)
                                    ? "border-brand-primary/18 bg-brand-primary/10 text-brand-primary shadow-[0_14px_24px_-24px_rgba(0,147,200,0.9)]"
                                    : "border-transparent bg-white/35 text-muted-foreground/75 hover:border-white/10 hover:bg-white/55 hover:text-foreground dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                                }`}
                              >
                                <NavIcon
                                  icon={item.icon}
                                  className="size-4.5"
                                />
                                <div className="flex flex-col">
                                  <span className="font-sans text-[10px] font-black uppercase tracking-[0.16em]">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground/55 leading-tight">
                                      {item.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </SheetClose>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })}
                </>
              ) : (
                clientNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex min-h-[50px] items-center gap-3 rounded-[1.2rem] border px-4 transition-all active:scale-[0.98] ${
                        isNavItemActive(pathname, item)
                          ? "border-brand-primary/18 bg-brand-primary/10 text-brand-primary shadow-[0_14px_24px_-24px_rgba(0,147,200,0.9)]"
                          : "border-white/10 bg-white/45 text-muted-foreground/80 hover:border-brand-primary/10 hover:bg-white/70 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/8"
                      }`}
                    >
                      <>
                        <NavIcon icon={item.icon} className="size-4.5" />
                        <span className="font-sans text-[10px] font-black uppercase tracking-[0.16em]">
                          {item.label}
                        </span>
                      </>
                    </Link>
                  </SheetClose>
                ))
              )}
            </nav>

            {shouldShowInstallAction && (
              <div className="mt-4 rounded-[1.75rem] px-2 py-2 text-left text-foreground">
                <div className="flex flex-col gap-3 rounded-[1.65rem] px-3 py-3">
                  <span className="font-sans text-[9px] font-black uppercase tracking-[0.28em] text-muted-foreground/65">
                    {tPwa("eyebrow")}
                  </span>

                  <div className="space-y-1">
                    <h3 className="font-heading text-[1.2rem] font-black uppercase leading-none tracking-tight text-foreground">
                      {tPwa("title")}
                    </h3>
                    <p className="max-w-[16rem] text-[11px] leading-relaxed text-muted-foreground">
                      {tPwa("description")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePwaAction}
                    className="flex min-h-16 w-full items-center justify-between rounded-[1.35rem] bg-brand-primary px-4 py-3 text-white shadow-[0_22px_50px_-26px_rgba(0,147,200,0.92)] transition-all active:scale-[0.99] hover:bg-brand-primary/92"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-white/14">
                        <DownloadSimple weight="bold" className="size-5" />
                      </div>
                      <span className="font-sans text-[12px] font-black uppercase tracking-[0.18em]">
                        {tPwa("install_now")}
                      </span>
                    </div>
                    <ArrowUpRightIcon weight="bold" className="size-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <SignOutButton>
              <button className="group flex w-full items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-3 text-foreground/88 shadow-sm transition-all active:scale-[0.98] hover:border-red-500/20 hover:bg-red-500/[0.04] hover:text-red-500">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 text-foreground/70 transition-colors group-hover:bg-red-500/10 group-hover:text-red-500">
                    <SignOut weight="bold" className="size-4.5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.16em]">
                      {t("user.signOut")}
                    </span>
                    <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-red-500/70">
                      {t("user.signOut_description")}
                    </span>
                  </div>
                </div>
              </button>
            </SignOutButton>
          </div>
        </div>
      </SheetContent>

      <PwaInstallInstructionsDialog
        isSafari={isSafari}
        open={showInstructions}
        onOpenChange={setShowInstructions}
      />
    </Sheet>
  )
}
