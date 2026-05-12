"use server"

import { NotificationType } from "@/src/generated/client"

import { getAdminDashboardAttention } from "@/src/lib/admin-data"
import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

export async function triggerAutomatedFollowUpsAction() {
  try {
    const today = new Date().toISOString()
    const { stagnantLeads } = await getAdminDashboardAttention(today)

    if (stagnantLeads.length === 0) {
      return { success: true, count: 0 }
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    })

    if (!admin) {
      throw new Error("No admin user found to receive notifications")
    }

    let notificationsCreated = 0

    for (const lead of stagnantLeads) {
      // Check if we already notified about this lead recently (last 24h)
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: admin.id,
          type: NotificationType.OPERATIONAL_REMINDER,
          AND: [
            { metadata: { path: ["path"], equals: "lead_stale" } },
            { metadata: { path: ["leadId"], equals: lead.id } },
          ],
          createdAt: {
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: NotificationType.OPERATIONAL_REMINDER,
            title: "Lead Estagnado",
            message: `O lead "${lead.companyName}" está sem interação há mais de 4 dias. Verifique o status da negociação.`,
            ctaPath: `/admin/crm`,
            metadata: {
              path: "lead_stale",
              leadId: lead.id,
              companyName: lead.companyName,
            },
          },
        })
        notificationsCreated++
      }
    }

    return { success: true, count: notificationsCreated }
  } catch (error) {
    logger.error({ error }, "Trigger Automated Follow-ups Error")
    return { success: false, error: "Falha ao disparar follow-ups automáticos" }
  }
}
