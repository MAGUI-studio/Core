import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { AdminSupportTicketDetail } from "@/src/components/admin/support/AdminSupportTicketDetail"

import { protectInternal } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { getAdminSupportTicketById } from "@/src/lib/support-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { subject: true },
  })

  return dashboardMetadata({
    title: ticket
      ? `${ticket.subject} - Atendimento de Ticket`
      : "Atendimento de Ticket",
    description:
      "Painel interno da MAGUI.studio para atendimento, acompanhamento e atualizacao completa dos tickets de suporte no CRM.",
    path: `/admin/support/${id}`,
  })
}

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
