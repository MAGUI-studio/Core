import { NotificationType } from "@/src/generated/client"

type NotificationCopy = (key: string) => string

export type NotificationPresentation = {
  categoryLabel: string
  emphasisLabel: string
  requiresAction: boolean
  cardClassName: string
  categoryClassName: string
  emphasisClassName: string
}

export function getNotificationPresentation(
  t: NotificationCopy,
  type: NotificationType
): NotificationPresentation {
  switch (type) {
    case NotificationType.UPDATE_PENDING_APPROVAL:
      return {
        categoryLabel: t("client_action"),
        emphasisLabel: t("requires_approval"),
        requiresAction: true,
        cardClassName:
          "border-amber-500/20 bg-amber-500/[0.045] shadow-sm dark:border-amber-400/25 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(10,10,10,0.78))] dark:shadow-lg dark:shadow-amber-500/10",
        categoryClassName:
          "border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
        emphasisClassName:
          "bg-amber-500/15 text-amber-900 dark:bg-amber-400 dark:text-zinc-950",
      }
    case NotificationType.UPDATE_REJECTED:
      return {
        categoryLabel: t("admin_action"),
        emphasisLabel: t("adjustments_requested"),
        requiresAction: true,
        cardClassName:
          "border-orange-500/20 bg-orange-500/[0.045] shadow-sm dark:border-orange-400/25 dark:bg-[linear-gradient(135deg,rgba(251,146,60,0.12),rgba(10,10,10,0.78))] dark:shadow-lg dark:shadow-orange-500/10",
        categoryClassName:
          "border border-orange-500/20 bg-orange-500/10 text-orange-800 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-200",
        emphasisClassName:
          "bg-orange-500/15 text-orange-900 dark:bg-orange-400 dark:text-zinc-950",
      }
    case NotificationType.BRIEFING_SUBMITTED:
      return {
        categoryLabel: t("new_briefing"),
        emphasisLabel: t("review_content"),
        requiresAction: true,
        cardClassName:
          "border-sky-500/20 bg-sky-500/[0.045] shadow-sm dark:border-sky-400/25 dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(10,10,10,0.78))] dark:shadow-lg dark:shadow-sky-500/10",
        categoryClassName:
          "border border-sky-500/20 bg-sky-500/10 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
        emphasisClassName:
          "bg-sky-500/15 text-sky-900 dark:bg-sky-400 dark:text-zinc-950",
      }
    case NotificationType.UPDATE_APPROVED:
      return {
        categoryLabel: t("approved"),
        emphasisLabel: t("status_approved"),
        requiresAction: false,
        cardClassName:
          "border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(10,10,10,0.76))]",
        categoryClassName:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200",
        emphasisClassName:
          "bg-emerald-500/12 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200",
      }
    case NotificationType.UPDATE_PUBLISHED:
      return {
        categoryLabel: t("update"),
        emphasisLabel: t("informational"),
        requiresAction: false,
        cardClassName:
          "border-brand-primary/20 bg-brand-primary/[0.04] dark:bg-[linear-gradient(135deg,rgba(0,149,255,0.10),rgba(10,10,10,0.76))]",
        categoryClassName:
          "border border-brand-primary/20 bg-brand-primary/10 text-[oklch(0.43_0.14_245)] dark:border-brand-primary/15 dark:bg-brand-primary/10 dark:text-brand-primary",
        emphasisClassName:
          "bg-brand-primary/12 text-[oklch(0.43_0.14_245)] dark:text-brand-primary",
      }
    case NotificationType.PROJECT_STATUS_CHANGED:
      return {
        categoryLabel: t("project"),
        emphasisLabel: t("status_updated"),
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
    case NotificationType.ASSET_UPLOADED:
      return {
        categoryLabel: t("file"),
        emphasisLabel: t("new_material"),
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
    case NotificationType.LEAD_ASSIGNED:
      return {
        categoryLabel: t("crm"),
        emphasisLabel: t("lead_assigned"),
        requiresAction: true,
        cardClassName:
          "border-fuchsia-500/20 bg-fuchsia-500/[0.04] dark:border-fuchsia-400/20 dark:bg-[linear-gradient(135deg,rgba(217,70,239,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-800 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-200",
        emphasisClassName:
          "bg-fuchsia-500/12 text-fuchsia-900 dark:bg-fuchsia-400/15 dark:text-fuchsia-200",
      }
    case NotificationType.OPERATIONAL_REMINDER:
      return {
        categoryLabel: t("operations"),
        emphasisLabel: t("automatic_reminder"),
        requiresAction: true,
        cardClassName:
          "border-rose-500/20 bg-rose-500/[0.04] dark:border-rose-400/20 dark:bg-[linear-gradient(135deg,rgba(244,63,94,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
        emphasisClassName:
          "bg-rose-500/12 text-rose-900 dark:bg-rose-400/15 dark:text-rose-200",
      }
    case NotificationType.CONNECT_ACCESS_REQUEST:
      return {
        categoryLabel: t("connect"),
        emphasisLabel: t("connect_access_request"),
        requiresAction: true,
        cardClassName:
          "border-violet-500/20 bg-violet-500/[0.04] dark:border-violet-400/20 dark:bg-[linear-gradient(135deg,rgba(139,92,246,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-violet-500/20 bg-violet-500/10 text-violet-800 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200",
        emphasisClassName:
          "bg-violet-500/12 text-violet-900 dark:bg-violet-400/15 dark:text-violet-200",
      }
    case "SUPPORT_TICKET_CREATED" as NotificationType:
      return {
        categoryLabel: t("support"),
        emphasisLabel: t("new_ticket"),
        requiresAction: true,
        cardClassName:
          "border-cyan-500/20 bg-cyan-500/[0.04] dark:border-cyan-400/20 dark:bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-cyan-500/20 bg-cyan-500/10 text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200",
        emphasisClassName:
          "bg-cyan-500/12 text-cyan-900 dark:bg-cyan-400/15 dark:text-cyan-200",
      }
    case "SUPPORT_TICKET_CLIENT_REPLY" as NotificationType:
      return {
        categoryLabel: t("support"),
        emphasisLabel: t("client_reply"),
        requiresAction: true,
        cardClassName:
          "border-sky-500/20 bg-sky-500/[0.04] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-sky-500/20 bg-sky-500/10 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
        emphasisClassName:
          "bg-sky-500/12 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200",
      }
    case "SUPPORT_TICKET_ADMIN_REPLY" as NotificationType:
      return {
        categoryLabel: t("support"),
        emphasisLabel: t("team_reply"),
        requiresAction: true,
        cardClassName:
          "border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
        emphasisClassName:
          "bg-emerald-500/12 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200",
      }
    default:
      return {
        categoryLabel: t("notification"),
        emphasisLabel: t("informational"),
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
  }
}
