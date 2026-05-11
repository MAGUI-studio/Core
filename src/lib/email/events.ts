import * as React from "react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { ContractSentEmail } from "@/src/components/email/ContractSentEmail"
import { InvoiceSentEmail } from "@/src/components/email/InvoiceSentEmail"
import { ProjectUpdateEmail } from "@/src/components/email/ProjectUpdateEmail"

import prisma from "@/src/lib/prisma"

import { env } from "@/src/config/env"

import { sendTransactionalEmail } from "./index"

export type ProductEvent =
  | { type: "CONTRACT_SENT"; documentId: string }
  | { type: "INVOICE_SENT"; invoiceId: string }
  | { type: "UPDATE_PUBLISHED"; updateId: string; projectId: string }
  | { type: "UPDATE_PENDING_APPROVAL"; updateId: string; projectId: string }
  | { type: "BRIEFING_REQUESTED"; projectId: string }

export async function triggerProductEvent(event: ProductEvent) {
  try {
    switch (event.type) {
      case "BRIEFING_REQUESTED": {
        const project = await prisma.project.findUnique({
          where: { id: event.projectId },
          include: { client: true },
        })

        if (!project?.client.email) return

        await sendTransactionalEmail({
          to: project.client.email,
          subject: `Briefing Solicitado: ${project.name}`,
          template: React.createElement(ProjectUpdateEmail, {
            contactName: project.client.name || "Cliente",
            projectName: project.name,
            updateTitle: "Novo preenchimento de briefing solicitado",
            updateUrl: `${env.NEXT_PUBLIC_SITE_URL}/projects/${project.id}/briefing`,
            requiresApproval: true,
          }),
          templateKey: "BRIEFING_REQUESTED",
          entityType: "Project",
          entityId: project.id,
        })
        break
      }

      case "UPDATE_PUBLISHED":
      case "UPDATE_PENDING_APPROVAL": {
        const update = await prisma.update.findUnique({
          where: { id: event.updateId },
          include: { project: { include: { client: true } } },
        })

        if (!update?.project?.client.email) return

        const requiresApproval = event.type === "UPDATE_PENDING_APPROVAL"

        await sendTransactionalEmail({
          to: update.project.client.email,
          subject: requiresApproval
            ? `Aprovação Pendente: ${update.title}`
            : `Nova Evolução: ${update.title}`,
          template: React.createElement(ProjectUpdateEmail, {
            contactName: update.project.client.name || "Cliente",
            projectName: update.project.name,
            updateTitle: update.title,
            updateUrl: `${env.NEXT_PUBLIC_SITE_URL}/projects/${update.projectId}`,
            requiresApproval,
          }),
          templateKey: event.type,
          entityType: "Update",
          entityId: update.id,
        })
        break
      }

      case "CONTRACT_SENT": {
        const doc = await prisma.document.findUnique({
          where: { id: event.documentId },
          include: { client: true },
        })

        if (!doc?.client?.email) return

        await sendTransactionalEmail({
          to: doc.client.email,
          subject: `Documento para Assinatura: ${doc.title}`,
          template: React.createElement(ContractSentEmail, {
            contactName: doc.client.name || "Cliente",
            contractTitle: doc.title,
            contractUrl: `${env.NEXT_PUBLIC_SITE_URL}/portal/documents/${doc.id}`,
          }),
          templateKey: "CONTRACT_SENT",
          entityType: "Document",
          entityId: doc.id,
        })
        break
      }

      case "INVOICE_SENT": {
        const invoice = await prisma.invoice.findUnique({
          where: { id: event.invoiceId },
          include: {
            client: true,
            project: { include: { client: true } },
          },
        })

        if (!invoice) return

        const invoiceClient = invoice.client ?? invoice.project?.client

        if (!invoiceClient?.email) return

        const invoiceUrl = invoice.projectId
          ? `${env.NEXT_PUBLIC_SITE_URL}/projects/${invoice.projectId}/financial`
          : `${env.NEXT_PUBLIC_SITE_URL}/financial`

        await sendTransactionalEmail({
          to: invoiceClient.email,
          subject: `Fatura Emitida: ${invoice.title}`,
          template: React.createElement(InvoiceSentEmail, {
            contactName: invoiceClient.name || "Cliente",
            invoiceTitle: invoice.title,
            invoiceUrl,
            dueDate: invoice.dueDate
              ? format(new Date(invoice.dueDate), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              : "N/D",
            totalAmount: `${invoice.currency} ${(invoice.totalAmount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          }),
          templateKey: "INVOICE_SENT",
          entityType: "Invoice",
          entityId: invoice.id,
        })
        break
      }
    }
  } catch (error) {
    console.error("Error triggering product event email:", error)
  }
}
