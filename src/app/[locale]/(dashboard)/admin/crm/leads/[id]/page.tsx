import * as React from "react"

import { notFound, redirect } from "next/navigation"

import { UserRole } from "@/src/generated/client"

import { LeadDetailsPage } from "@/src/components/admin/LeadDetailsPage"

import { getLeadDetails, getMessageTemplates } from "@/src/lib/crm-data"
import { isAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

interface AdminLeadDetailPageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ mode?: string }>
}

export async function generateMetadata({ params }: AdminLeadDetailPageProps) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { companyName: true },
  })

  return dashboardMetadata({
    title: lead ? `${lead.companyName} - Gestão de Lead` : "Gestão de Lead",
    description: lead
      ? `Página de gestão do lead ${lead.companyName} com propostas, pipeline, atividades e conversão em projeto na MAGUI.studio.`
      : "Detalhes administrativos, propostas e atividades do lead.",
    path: `/admin/crm/leads/${id}`,
  })
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: AdminLeadDetailPageProps): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const initialMode =
    resolvedSearchParams?.mode === "edit" ? "edit" : "overview"

  const [lead, templates, clients] = await Promise.all([
    getLeadDetails(id),
    getMessageTemplates(),
    prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!lead) {
    notFound()
  }

  return (
    <LeadDetailsPage
      lead={lead}
      templates={templates}
      clients={clients}
      initialMode={initialMode}
    />
  )
}
