import * as React from "react"

import { Text } from "@react-email/components"

import { BaseEmailLayout } from "./BaseEmailLayout"

interface SupportTicketReplyEmailProps {
  contactName: string
  ticketSubject: string
  ticketNumber: string
  ticketUrl: string
  messagePreview: string
  isResolved?: boolean
}

export const SupportTicketReplyEmail = ({
  contactName,
  ticketSubject,
  ticketNumber,
  ticketUrl,
  messagePreview,
  isResolved = false,
}: SupportTicketReplyEmailProps) => {
  const title = isResolved ? "Ticket Resolvido" : "Nova Resposta no Suporte"
  const preview = isResolved
    ? `Seu ticket #${ticketNumber} foi marcado como resolvido.`
    : `Recebemos uma nova atualização para o ticket #${ticketNumber}.`

  return (
    <BaseEmailLayout
      title={title}
      preview={preview}
      ctaText="Ver Chamado Completo"
      ctaUrl={ticketUrl}
    >
      <Text className="text-base">Olá, {contactName},</Text>

      <Text className="text-base">
        {isResolved
          ? `Temos boas notícias! O seu chamado `
          : `Gostaríamos de informar que houve uma nova interação no seu chamado `}
        <strong className="text-slate-900">
          #{ticketNumber} - {ticketSubject}
        </strong>
        .
      </Text>

      <div className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 italic text-slate-700">
        &quot;{messagePreview}&quot;
      </div>

      <Text className="text-base">
        {isResolved
          ? "Se você acredita que ainda há algo a ser tratado, basta responder a este e-mail ou reabrir o chamado pelo portal."
          : "Você pode visualizar a resposta completa e interagir com nossa equipe clicando no botão abaixo."}
      </Text>
    </BaseEmailLayout>
  )
}
