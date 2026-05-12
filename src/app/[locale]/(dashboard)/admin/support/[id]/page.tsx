import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { AdminSupportTicketDetail } from "@/src/components/admin/support/AdminSupportTicketDetail"

import { dashboardMetadata } from "@/src/lib/seo"
import { getAdminSupportTicketById } from "@/src/lib/support-data"
import { protectInternal } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

export const metadata = dashboardMetadata({
  title: "Atendimento de ticket",
  description:
    "Painel administrativo de atendimento, acompanhamento e atualização de tickets no CRM.",
  path: "/admin/support",
})

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  await protectInternal()
  const { id } = await params
  const ticket = await getAdminSupportTicketById(id)

  if (!ticket) {
    notFound()
  }

  const { userId } = await auth()

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (user?.role && ticket.adminUnreadCount > 0) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { adminUnreadCount: 0 },
      })
      ticket.adminUnreadCount = 0
    }
  }

  return (
    <main className="flex flex-col gap-10 bg-background px-6 py-8 lg:px-12 lg:py-12">
      <AdminSupportTicketDetail ticket={ticket} />
    </main>
  )
}
