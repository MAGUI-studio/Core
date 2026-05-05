"use client"

import { DashboardNotification } from "@/src/types/dashboard"
import { create } from "zustand"

interface NotificationsStore {
  notifications: DashboardNotification[]
  setNotifications: (notifications: DashboardNotification[]) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId && !notification.readAt
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.readAt
          ? notification
          : { ...notification, readAt: new Date().toISOString() }
      ),
    })),
}))
