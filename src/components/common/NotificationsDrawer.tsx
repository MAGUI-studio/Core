"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { useNotificationsStore } from "@/src/stores/notifications-store"
import { DashboardNotification } from "@/src/types/dashboard"
import {
  BellRingingIcon,
  BellSimpleIcon,
  CheckIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

import { getNotificationPresentation } from "@/src/components/common/notification-presentation"

import {
  markNotificationAsReadAction,
  markNotificationsAsReadAction,
} from "@/src/lib/actions/notification.actions"
import { cn, formatLocalTime } from "@/src/lib/utils/utils"

interface NotificationsDrawerProps {
  notifications: DashboardNotification[]
}

export function NotificationsDrawer({
  notifications,
}: NotificationsDrawerProps): React.JSX.Element {
  const t = useTranslations("Notifications")
  const tPresentation = useTranslations("Notifications.presentation")
  const router = useRouter()
  const [isSubmitting, startTransition] = React.useTransition()
  const [open, setOpen] = React.useState(false)
  const storeNotifications = useNotificationsStore(
    (state) => state.notifications
  )
  const setNotifications = useNotificationsStore(
    (state) => state.setNotifications
  )
  const markAllAsReadInStore = useNotificationsStore(
    (state) => state.markAllAsRead
  )
  const markAsReadInStore = useNotificationsStore((state) => state.markAsRead)

  React.useEffect(() => {
    setNotifications(notifications)
  }, [notifications, setNotifications])

  const unreadCount = storeNotifications.filter(
    (notification) => !notification.readAt
  ).length

  const markAllAsRead = () => {
    if (unreadCount === 0) {
      return
    }

    startTransition(async () => {
      const result = await markNotificationsAsReadAction(
        storeNotifications
          .filter((notification) => !notification.readAt)
          .map((notification) => notification.id)
      )

      if (!result.success) {
        toast.error(result.error ?? t("mark_all_error"))
        return
      }

      markAllAsReadInStore()
      toast.success(t("mark_all_success"))
    })
  }

  const handleNotificationClick = (notification: DashboardNotification) => {
    const ctaPath = notification.ctaPath

    if (!ctaPath) {
      return
    }

    startTransition(async () => {
      if (!notification.readAt) {
        markAsReadInStore(notification.id)

        const result = await markNotificationAsReadAction(notification.id)

        if (!result.success) {
          toast.error(result.error ?? t("mark_all_error"))
          return
        }
      }

      setOpen(false)
      router.push(ctaPath)
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full bg-background/50 text-foreground/70 transition-all hover:bg-muted/20 hover:text-foreground"
        >
          <BellSimpleIcon weight="duotone" className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5 text-[8px] font-black leading-none text-white shadow-lg shadow-brand-primary/20">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">{t("title")}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[94vw] border-l border-border/30 bg-background/95 p-0 sm:min-w-152 sm:max-w-[40vw]"
      >
        <SheetHeader className="border-b border-border/20 px-7 py-7">
          <div className="flex items-start justify-between gap-5 pr-10">
            <div className="max-w-md">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
                {t("eyebrow")}
              </p>
              <SheetTitle className="mt-3 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
                {t("title")}
              </SheetTitle>
              <SheetDescription className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/60">
                {t("description")}
              </SheetDescription>
            </div>

            {unreadCount > 0 && (
              <span className="mt-1 rounded-full bg-brand-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-primary/20">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 w-full rounded-2xl border-border/40 bg-background/70 px-5 text-[10px] font-black uppercase tracking-[0.2em]"
            disabled={isSubmitting || unreadCount === 0}
            onClick={markAllAsRead}
          >
            <CheckIcon weight="bold" className="mr-2 size-4" />
            {t("mark_all")}
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {storeNotifications.length === 0 ? (
            <section className="flex min-h-[50svh] flex-col items-center justify-center rounded-4xl border border-dashed border-border/40 bg-muted/5 p-8 text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-[1.25rem] bg-muted/20 text-muted-foreground/30">
                <BellRingingIcon weight="duotone" className="size-7" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                {t("empty")}
              </p>
            </section>
          ) : (
            <div className="grid gap-4">
              {storeNotifications.map((notification) => {
                const presentation = getNotificationPresentation(
                  tPresentation,
                  notification.type
                )

                const content = (
                  <div
                    className={cn(
                      "rounded-[1.9rem] border p-5 text-left transition-all sm:p-6",
                      notification.ctaPath &&
                        "cursor-pointer hover:-translate-y-0.5",
                      notification.readAt
                        ? "border-border/25 bg-background/35"
                        : presentation.cardClassName
                    )}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.24em]",
                            presentation.categoryClassName
                          )}
                        >
                          {presentation.categoryLabel}
                        </span>

                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.24em]",
                            presentation.emphasisClassName
                          )}
                        >
                          {presentation.emphasisLabel}
                        </span>

                        {!notification.readAt && (
                          <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.24em] text-brand-primary dark:bg-white/10 dark:text-white">
                            {t("new")}
                          </span>
                        )}

                        <span className="ml-auto text-[8px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
                          {formatLocalTime(
                            new Date(notification.createdAt),
                            "America/Sao_Paulo"
                          )}
                        </span>
                      </div>

                      {notification.project?.name && (
                        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-muted-foreground/45">
                          {t("project_label", {
                            name: notification.project.name,
                          })}
                        </p>
                      )}

                      <div className="space-y-2.5">
                        <p
                          className={cn(
                            "text-base font-black uppercase leading-tight tracking-tight sm:text-[17px]",
                            notification.readAt
                              ? "text-foreground/78"
                              : "text-foreground"
                          )}
                        >
                          {notification.title}
                        </p>

                        <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/68 sm:text-[15px]">
                          {notification.message}
                        </p>
                      </div>

                      <div className="mt-1 border-t border-border/15 pt-4">
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-[0.24em]",
                            presentation.requiresAction
                              ? "text-amber-700 dark:text-amber-200/80"
                              : "text-muted-foreground/45"
                          )}
                        >
                          {presentation.requiresAction
                            ? t("state.requires_attention")
                            : notification.readAt
                              ? t("state.read")
                              : t("state.unread")}
                        </span>
                      </div>
                    </div>
                  </div>
                )

                if (!notification.ctaPath) {
                  return <div key={notification.id}>{content}</div>
                }

                return (
                  <button
                    type="button"
                    key={notification.id}
                    className="block"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {content}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
