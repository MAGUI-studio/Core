import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { ClientFinancialView } from "@/src/components/client/ClientFinancialView"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getProjectInvoices } from "@/src/lib/financial-data"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { verifyAndSyncStripePayment } from "@/src/lib/stripe-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  const t = await getTranslations("Dashboard.project_detail.pages.financial")

  return dashboardMetadata({
    title: project ? `${t("title")} - ${project.name}` : t("title"),
    description: project
      ? `${t("description")} Projeto: ${project.name}.`
      : t("description"),
    path: `/projects/${id}/financial`,
  })
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function ProjectFinancialPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { session_id } = await searchParams
  const { userId } = await auth()

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return null

  const project = await prisma.project.findUnique({
    where: { id, clientId: user.id },
    select: { id: true, name: true },
  })

  if (!project) return notFound()

  let verifiedInstallmentId: string | null = null

  // Fallback: If returned from Stripe with session_id, verify manually
  if (session_id) {
    const result = await verifyAndSyncStripePayment(session_id)
    if (result.success && result.installmentId) {
      verifiedInstallmentId = result.installmentId
    }
  }

  const invoices = await getProjectInvoices(id)

  const t = await getTranslations("Dashboard.project_detail.pages.financial")

  return (
    <div className="flex flex-col gap-10">
      <ClientSectionHeader
        eyebrow={`${project.name} / ${t("title")}`}
        title={t("title")}
        description={t("description")}
      />

      <ClientFinancialView
        title={project.name}
        eyebrow={t("title")}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoices={invoices as any}
        verifyingInstallmentId={verifiedInstallmentId}
      />
    </div>
  )
}
