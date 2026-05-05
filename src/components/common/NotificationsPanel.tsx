"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { DashboardNotification } from "@/src/types/dashboard"
import { BellRinging } from "@phosphor-icons/react"

import { cn, formatLocalTime } from "@/src/lib/utils/utils"

import { getNotificationPresentation } from "./notification-presentation"

interface NotificationsPanelProps {
  notifications: DashboardNotification[]
}

export function NotificationsPanel({
  notifications,
}: NotificationsPanelProps): React.JSX.Element {
  const t = useTranslations("Notifications")
  const tPresentation = useTranslations("Notifications.presentation")

  if (notifications.length === 0) {
    return (
      <section className="rounded-4xl border border-dashed border-border/40 bg-muted/5 p-10 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted/20 text-muted-foreground/30">
          <BellRinging className="size-6" weight="duotone" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          {t("empty")}
        </p>
      </section>
    )
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <section className="rounded-4xl border border-border/30 bg-background/20 p-8 backdrop-blur-xl shadow-2xl shadow-black/5">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-brand-primary">
            Sinais
          </p>
          <h3 className="mt-1 font-heading text-xl font-black uppercase tracking-tight text-foreground/90">
            Radar
          </h3>
        </div>
        {unreadCount > 0 && (
          <div className="rounded-full bg-brand-primary px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white animate-pulse">
            {unreadCount} novos
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const presentation = getNotificationPresentation(
            tPresentation,
            notification.type
          )

          return (
            <div
              key={notification.id}
              className={cn(
                "rounded-3xl border p-5",
                notification.readAt
                  ? "border-border/25 bg-background/20"
                  : presentation.cardClassName
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em]",
                    presentation.categoryClassName
                  )}
                >
                  {presentation.categoryLabel}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em]",
                    presentation.emphasisClassName
                  )}
                >
                  {presentation.emphasisLabel}
                </span>
                <span className="ml-auto text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/35">
                  {formatLocalTime(
                    new Date(notification.createdAt),
                    "America/Sao_Paulo"
                  )}
                </span>
              </div>

              <p className="mt-4 text-[12px] font-black uppercase tracking-tight text-foreground">
                {notification.title}
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground/65">
                {notification.message}
              </p>

              {notification.project?.name && (
                <p className="mt-3 text-[8px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                  {t("project_label", { name: notification.project.name })}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
