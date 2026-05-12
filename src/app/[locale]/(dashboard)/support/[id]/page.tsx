import * as React from "react"

import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientSupportTicketDetail } from "@/src/components/client/support/ClientSupportTicketDetail"

import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { getClientSupportTicketById } from "@/src/lib/support-data"

export const metadata = dashboardMetadata({
  title: "Detalhes do ticket",
  description:
    "Acompanhe mensagens, prazo de resposta e histórico do ticket de suporte pelo CRM.",
  path: "/support",
})

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { userId } = await auth()
  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  if (!user) return <div />

  const { id } = await params
  const ticket = await getClientSupportTicketById(id, user.id)

  if (!ticket) {
    notFound()
  }

  if (ticket.clientUnreadCount > 0) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { clientUnreadCount: 0 },
    })
    ticket.clientUnreadCount = 0
  }

  return (
    <main className="flex flex-col gap-10 bg-background px-6 py-8 lg:px-12 lg:py-12">
      <ClientSupportTicketDetail ticket={ticket} />
    </main>
  )
}
