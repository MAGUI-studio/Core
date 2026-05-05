"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@clerk/nextjs/server"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"
import { getCurrentAppUser } from "@/src/lib/project-governance"

async function getCurrentNotificationUserId(): Promise<string | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await getCurrentAppUser()

  return user?.id ?? null
}

export async function markNotificationsAsReadAction(
  notificationIds?: string[]
): Promise<{ error?: string; success?: boolean }> {
  try {
    const currentUserId = await getCurrentNotificationUserId()

    if (!currentUserId) {
      return { error: "Unauthorized" }
    }

    await prisma.notification.updateMany({
      where: {
        userId: currentUserId,
        readAt: null,
        ...(notificationIds?.length
          ? {
              id: {
                in: notificationIds,
              },
            }
          : {}),
      },
      data: {
        readAt: new Date(),
      },
    })

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Mark Notifications As Read Error:")
    return { error: "Erro ao atualizar notificações" }
  }
}

export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ error?: string; success?: boolean }> {
  return markNotificationsAsReadAction([notificationId])
}
