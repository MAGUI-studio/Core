"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { SignOutButton } from "@clerk/nextjs"
import {
  ArrowUpRightIcon,
  DownloadSimple,
  SignOut,
} from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"
import { PwaInstallInstructionsDialog } from "@/src/components/common/PwaInstallInstructionsDialog"

import { usePwaInstall } from "@/src/hooks/use-pwa-install"

interface UserMenuProps {
  viewer: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  }
}

export function UserMenu({ viewer }: UserMenuProps) {
  const t = useTranslations("Sidebar")
  const tPwa = useTranslations("Sidebar.pwa")
  const [isOpen, setIsOpen] = React.useState(false)
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

  return (
    <div
      className="hidden lg:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="group flex items-center gap-2 rounded-2xl bg-background px-2.5 py-1.5 transition-all outline-none focus-visible:ring-0 focus:ring-0 hover:bg-muted/40">
            <Avatar className="size-8 rounded-xl shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage
                src={viewer.imageUrl ?? undefined}
                alt={viewer.fullName || ""}
              />
              <AvatarFallback className="rounded-xl bg-brand-primary/10 text-[9px] font-black uppercase text-brand-primary">
                {viewer.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:grid text-left leading-tight">
              <span className="max-w-32 truncate text-[9px] font-black uppercase tracking-[0.18em] text-foreground transition-colors">
                {viewer.firstName || viewer.fullName?.split(" ")[0]}
              </span>
              <span className="max-w-32 truncate text-[8px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                {viewer.isAdmin ? t("user.admin_role") : t("user.client_role")}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-64 rounded-[1.75rem] bg-background p-3 shadow-[0_28px_48px_-18px_rgba(0,0,0,0.28)] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="mb-3 flex items-center gap-3 rounded-[1.5rem] bg-muted/20 p-3">
            <Avatar className="h-11 w-11 rounded-2xl shadow-md">
              <AvatarImage
                src={viewer.imageUrl ?? undefined}
                alt={viewer.fullName || ""}
              />
              <AvatarFallback className="rounded-2xl text-brand-primary font-black uppercase">
                {viewer.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 overflow-hidden text-left leading-tight">
              <span className="truncate font-heading text-sm font-black uppercase tracking-tight text-foreground">
                {viewer.fullName}
              </span>
              <span className="mt-0.5 truncate font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {viewer.email}
              </span>
            </div>
          </div>

          <div className="grid gap-2 p-1">
            <HeaderLanguageSwitcher />
            <HeaderThemeToggle />
          </div>

          <DropdownMenuSeparator className="my-3 bg-muted/50" />

          <SignOutButton>
            <DropdownMenuItem className="group/item cursor-pointer rounded-[1.25rem] px-3 py-2.5 text-foreground/88 transition-all hover:bg-red-500/[0.05] hover:text-red-500 focus:bg-red-500/[0.05] focus:text-red-500 outline-none focus:ring-0">
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 text-foreground/70 transition-colors group-hover/item:bg-red-500/10 group-hover/item:text-red-500">
                <SignOut weight="bold" className="size-4.5" />
              </div>
              <div className="ml-3 flex flex-col leading-tight">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.18em]">
                  {t("user.signOut")}
                </span>
                <span className="text-[11px] text-muted-foreground transition-colors group-hover/item:text-red-500/70">
                  {t("user.signOut_description")}
                </span>
              </div>
            </DropdownMenuItem>
          </SignOutButton>

          {shouldShowInstallAction && (
            <>
              <DropdownMenuSeparator className="my-3 bg-muted/50" />
              <div className="rounded-[1.75rem] px-2 py-2 text-left text-foreground/88">
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
                    className="flex min-h-14 w-full items-center justify-between rounded-[1.25rem] bg-brand-primary px-4 py-3 text-white shadow-[0_20px_45px_-24px_rgba(0,147,200,0.9)] transition-all hover:scale-[1.01] hover:bg-brand-primary/92"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-white/14">
                        <DownloadSimple weight="bold" className="size-4.5" />
                      </div>
                      <span className="font-sans text-[11px] font-black uppercase tracking-[0.18em]">
                        {tPwa("install_now")}
                      </span>
                    </div>
                    <ArrowUpRightIcon weight="bold" className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PwaInstallInstructionsDialog
        isSafari={isSafari}
        open={showInstructions}
        onOpenChange={setShowInstructions}
      />
    </div>
  )
}
