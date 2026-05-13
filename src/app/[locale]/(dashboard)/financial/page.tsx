import * as React from "react"

import { getTranslations } from "next-intl/server"

import { auth } from "@clerk/nextjs/server"

import { ClientFinancialView } from "@/src/components/client/ClientFinancialView"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientInvoices } from "@/src/lib/financial-data"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { verifyAndSyncStripePayment } from "@/src/lib/stripe-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata() {
  const t = await getTranslations("Dashboard.financial")

  return dashboardMetadata({
    title: t("title"),
    description: t("description"),
    path: "/financial",
  })
}

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function FinancialPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element | null> {
  const { session_id } = await searchParams
  const { userId } = await auth()

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, name: true },
  })

  if (!user) return null

  let verifiedInstallmentId: string | null = null

  if (session_id) {
    const result = await verifyAndSyncStripePayment(session_id)
    if (result.success && result.installmentId) {
      verifiedInstallmentId = result.installmentId
    }
  }

  const invoices = await getClientInvoices(user.id)
  return (
    <div className="flex flex-col gap-10 px-6 py-10 lg:px-12 lg:py-12">
      <ClientSectionHeader
        eyebrow="Financeiro"
        title="Minhas cobrancas"
        description="Acompanhe cobrancas avulsas, parcelas em aberto, pagamentos e comprovantes em um unico lugar."
      />

      <ClientFinancialView
        title="Minhas cobrancas"
        eyebrow="Financeiro"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoices={invoices as any}
        verifyingInstallmentId={verifiedInstallmentId}
      />
    </div>
  )
}
