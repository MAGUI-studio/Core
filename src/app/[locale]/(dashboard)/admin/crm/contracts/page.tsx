import * as React from "react"

import { DocumentType } from "@/src/generated/client"
import { getTranslations } from "next-intl/server"

import { ContractsOverviewList } from "@/src/components/admin/contracts/ContractsOverviewList"

import { protectAdmin } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Contratos gerados",
  description:
    "Central para consultar contratos já gerados, acompanhar status documental, versões e vínculos com clientes, propostas e projetos.",
  path: "/admin/crm/contracts",
})

function readRecord(source: unknown) {
  return source && typeof source === "object"
    ? (source as Record<string, unknown>)
    : {}
}

export default async function ContractsPage(): Promise<React.JSX.Element> {
  await protectAdmin()

  const t = await getTranslations("Admin.crm")
  const documents = await prisma.document.findMany({
    where: {
      type: DocumentType.CONTRACT,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          companyName: true,
          email: true,
        },
      },
      lead: {
        select: {
          id: true,
          companyName: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        select: {
          versionNumber: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  const contracts = documents.map((document) => {
    const contractingData = readRecord(document.contractingData)
    const commercialData = readRecord(document.commercialData)

    return {
      id: document.id,
      title: document.title,
      status: document.status,
      companyName:
        document.client?.companyName ||
        document.client?.name ||
        document.lead?.companyName ||
        String(contractingData.legalName || "").trim() ||
        "Sem empresa definida",
      proposalTitle:
        typeof commercialData.proposalTitle === "string"
          ? commercialData.proposalTitle
          : null,
      projectName: document.project?.name ?? null,
      clientId: document.clientId,
      projectId: document.projectId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      latestVersionNumber: document.versions[0]?.versionNumber ?? 1,
    }
  })

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute right-0 top-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            Contratos Gerados
          </h1>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Consulte todos os contratos já gerados pela operação, acompanhe
            status documental, versões e vínculos com clientes, propostas e
            projetos em uma única área.
          </p>
        </div>
      </div>

      <div className="p-0">
        <ContractsOverviewList contracts={contracts} />
      </div>
    </main>
  )
}
