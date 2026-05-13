import * as React from "react"

import { auth } from "@clerk/nextjs/server"

import { ClientSupportTicketsPage } from "@/src/components/client/support/ClientSupportTicketsPage"

import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { getClientSupportTickets } from "@/src/lib/support-data"

export const metadata = dashboardMetadata({
  title: "Suporte",
  description:
    "Area do cliente da MAGUI.studio para abrir tickets, acompanhar respostas e centralizar todo o historico de suporte no CRM.",
  path: "/support",
})

export default async function SupportPage(): Promise<React.JSX.Element> {
  const { userId } = await auth()
  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      projects: {
        select: {
          id: true,
          name: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  if (!user) return <div />

  const tickets = await getClientSupportTickets(user.id)

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <ClientSupportTicketsPage tickets={tickets} projects={user.projects} />
    </main>
  )
}
