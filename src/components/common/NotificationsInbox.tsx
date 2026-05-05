"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ArrowUpRightIcon, BellRinging, Check } from "@phosphor-icons/react"
import { toast } from "sonner"

import { markNotificationsAsReadAction } from "@/src/lib/actions/notification.actions"
import { cn, formatLocalTime } from "@/src/lib/utils/utils"

import { Button } from "../ui/button"

type NotificationsInboxItem = {
  id: string
  title: string
  message: string
  ctaPath: string | null
  readAt: Date | string | null
  createdAt: Date | string
  project?: {
    id: string
    name: string
  } | null
}

interface NotificationsInboxProps {
  notifications: NotificationsInboxItem[]
  totalPages?: number
  currentPage?: number
}

export function NotificationsInbox({
  notifications,
  totalPages = 1,
  currentPage = 1,
}: NotificationsInboxProps): React.JSX.Element {
  const t = useTranslations("Notifications")
  const tPagination = useTranslations("Notifications.pagination")
  const [isSubmitting, startTransition] = React.useTransition()

  const unreadNotifications = notifications.filter(
    (notification) => !notification.readAt
  )

  const markAllAsRead = () => {
    if (unreadNotifications.length === 0) {
      return
    }

    startTransition(async () => {
      const result = await markNotificationsAsReadAction(
        unreadNotifications.map((notification) => notification.id)
      )

      if (result.success) {
        toast.success(t("mark_all_success"))
      } else {
        toast.error(result.error ?? t("mark_all_error"))
      }
    })
  }

  if (notifications.length === 0) {
    return (
      <section className="flex min-h-[320px] flex-col items-center justify-center rounded-4xl border border-dashed border-border/40 bg-muted/5 p-10 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-[1.5rem] bg-muted/20 text-muted-foreground/30">
          <BellRinging weight="duotone" className="size-8" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          {t("empty")}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-4xl border border-border/30 bg-background/30 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl lg:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-border/20 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground/60">
            {t("description")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-2xl border-border/40 bg-background/50 px-5 text-[10px] font-black uppercase tracking-[0.2em]"
          disabled={isSubmitting || unreadNotifications.length === 0}
          onClick={markAllAsRead}
        >
          <Check weight="bold" className="mr-2 size-4" />
          {t("mark_all")}
        </Button>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "rounded-[1.5rem] border p-5 transition-all",
              notification.readAt
                ? "border-border/25 bg-background/20"
                : "border-brand-primary/20 bg-brand-primary/5 shadow-lg shadow-brand-primary/5"
            )}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p
                    className={cn(
                      "text-[11px] font-black uppercase tracking-tight",
                      notification.readAt
                        ? "text-foreground/70"
                        : "text-foreground"
                    )}
                  >
                    {notification.title}
                  </p>

                  {!notification.readAt && (
                    <span className="rounded-full bg-brand-primary px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                      {t("new")}
                    </span>
                  )}

                  {notification.project?.name && (
                    <span className="rounded-full border border-border/30 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">
                      {notification.project.name}
                    </span>
                  )}
                </div>

                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/65">
                  {notification.message}
                </p>
              </div>

              <div className="shrink-0 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/35">
                {formatLocalTime(
                  new Date(notification.createdAt),
                  "America/Sao_Paulo"
                )}
              </div>
            </div>

            {notification.ctaPath && (
              <div className="mt-5">
                <a
                  href={notification.ctaPath}
                  target="_self"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-background/40 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
                >
                  {t("open")}
                  <ArrowUpRightIcon weight="bold" className="size-3.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4 border-t border-border/10 pt-8">
          <Button
            asChild
            variant="outline"
            disabled={currentPage <= 1}
            className="rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            {currentPage <= 1 ? (
              <span>{tPagination("previous")}</span>
            ) : (
              <a href={`?page=${currentPage - 1}`}>{tPagination("previous")}</a>
            )}
          </Button>

          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            {tPagination("page", { current: currentPage, total: totalPages })}
          </span>

          <Button
            asChild
            variant="outline"
            disabled={currentPage >= totalPages}
            className="rounded-full border-border/40 px-6 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            {currentPage >= totalPages ? (
              <span>{tPagination("next")}</span>
            ) : (
              <a href={`?page=${currentPage + 1}`}>{tPagination("next")}</a>
            )}
          </Button>
        </div>
      )}
    </section>
  )
}
