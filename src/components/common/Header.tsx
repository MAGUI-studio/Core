"use client"

import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  DashboardNotification,
  DashboardUpdateAttachment,
} from "@/src/types/dashboard"
import { AnimatePresence, motion } from "framer-motion"

import { HeaderLanguageSwitcher } from "@/src/components/common/HeaderLanguageSwitcher"
import { HeaderThemeToggle } from "@/src/components/common/HeaderThemeToggle"
import { MobileHeaderMenu } from "@/src/components/common/MobileHeaderMenu"
import { NotificationsDrawer } from "@/src/components/common/NotificationsDrawer"
import { Logo } from "@/src/components/common/logo"

import { AdminNav } from "./header/AdminNav"
import { ApprovalBanner } from "./header/ApprovalBanner"
import { UserMenu } from "./header/UserMenu"

interface HeaderProps {
  notifications?: DashboardNotification[]
  pendingApprovals?: {
    count: number
    projectId: string
    projectName: string
    lastUpdateId: string
    lastUpdateTitle: string
    lastUpdateDescription: string | null
    attachments: DashboardUpdateAttachment[]
  }[]
  viewer?: {
    email: string | null
    firstName: string | null
    fullName: string | null
    imageUrl: string | null
    isAdmin: boolean
  } | null
}

export function Header({
  notifications = [],
  pendingApprovals = [],
  viewer = null,
}: HeaderProps): React.JSX.Element {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-background"
    >
      <AnimatePresence>
        {pendingApprovals.length > 0 && (
          <ApprovalBanner approvals={pendingApprovals} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
        className="mx-auto flex h-16 w-full max-w-440 items-center justify-between px-4 lg:px-10"
      >
        <div className="flex items-center gap-6 lg:gap-9">
          <Link
            href="/"
            className="transition-all hover:opacity-60 active:scale-95 outline-none focus-visible:ring-0"
          >
            <Logo width={118} height={28} />
          </Link>

          <AdminNav isAdmin={viewer?.isAdmin} />
        </div>

        <div className="flex items-center gap-3">
          {!viewer ? (
            <div className="size-8 rounded-full bg-muted/20 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 lg:gap-2.5">
              <NotificationsDrawer notifications={notifications} />
              <div className="hidden items-center gap-2 lg:flex">
                <HeaderLanguageSwitcher compact />
                <HeaderThemeToggle compact />
              </div>
              <MobileHeaderMenu viewer={viewer} />
              <UserMenu viewer={viewer} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.header>
  )
}
