import * as React from "react"

import {
  type ActivityKind,
  AdminActivityFeed,
} from "@/src/components/admin/AdminActivityFeed"

import { getAdminDashboardActivity } from "@/src/lib/admin-data"

export async function DashboardActivityWidget() {
  const activities = await getAdminDashboardActivity()

  const activityItems = activities.map((log) => {
    const normalizedAction = log.action.toLowerCase()
    const normalizedEntityType = log.entityType.toLowerCase()

    const kind: ActivityKind =
      normalizedAction.includes("approved") ||
      normalizedAction.includes("rejected")
        ? "approval"
        : normalizedEntityType.includes("asset")
          ? "asset"
          : normalizedEntityType.includes("briefing")
            ? "briefing"
            : normalizedEntityType.includes("update")
              ? "timeline"
              : normalizedEntityType.includes("project")
                ? "project"
                : "system"

    const normalizedSummary = log.summary.replace(/\bBRL\s*/g, "R$ ")

    return {
      id: log.id,
      action: log.action,
      summary: normalizedSummary,
      createdAt: log.createdAt,
      actorName: log.actor?.name ?? null,
      actorRole: log.actor?.role ?? null,
      projectName: log.project?.name ?? null,
      entityType: log.entityType,
      kind,
      href: log.projectId
        ? {
            pathname: "/admin/projects/[id]" as const,
            params: { id: log.projectId },
          }
        : "/admin/projects",
    }
  })

  return <AdminActivityFeed items={activityItems} />
}
