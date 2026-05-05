"use server"

import { UserRole } from "@/src/generated/client"

import {
  getAdminDashboardPerformance,
  getAdminDashboardSummary,
} from "@/src/lib/admin-data"
import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

export async function takeDashboardSnapshotAction() {
  try {
    // We need an admin user ID for the summary, fetch first admin
    const admin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    })

    if (!admin) {
      throw new Error("No admin user found to generate metrics")
    }

    const [stats, perf] = await Promise.all([
      getAdminDashboardSummary(admin.id),
      getAdminDashboardPerformance(),
    ])

    const snapshot = await prisma.dashboardMetricSnapshot.create({
      data: {
        activeProjects: stats.activeProjectsCount,
        completedProjects: stats.completedProjectsCount,
        pendingApprovals: stats.pendingApprovalsCount,
        totalLeads: stats.activeLeadsCount + stats.convertedLeadsCount,
        convertedLeads: stats.convertedLeadsCount,
        negotiationValue: stats.negotiationValue,
        avgApprovalHours: Math.round(perf.averageApprovalHours),
      },
    })

    return { success: true, snapshot }
  } catch (error) {
    logger.error({ error }, "Take Snapshot Error")
    return { success: false, error: "Failed to generate metrics snapshot" }
  }
}
