import * as React from "react"

import { Text } from "@react-email/components"

import { BaseEmailLayout } from "./BaseEmailLayout"

interface ProposalSentEmailProps {
  contactName: string
  proposalTitle: string
  proposalUrl: string
  totalValue: string
}

export const ProposalSentEmail = ({
  contactName,
  proposalTitle,
  proposalUrl,
  totalValue,
}: ProposalSentEmailProps) => {
  return (
    <BaseEmailLayout
      title="Nova Proposta Comercial"
      preview={`Sua proposta para ${proposalTitle} está pronta para revisão.`}
      ctaText="Visualizar Proposta"
      ctaUrl={proposalUrl}
    >
      <Text className="text-base">Olá, {contactName},</Text>
      <Text className="text-base">
        É um prazer informar que a proposta estratégica para o projeto{" "}
        <strong className="text-slate-900">{proposalTitle}</strong> já está
        disponível no seu portal.
      </Text>
      <Text className="text-base font-bold text-slate-900">
        Investimento Total: {totalValue}
      </Text>
      <Text className="text-base">
        Nossa equipe estruturou cada etapa focada em gerar o máximo de
        autoridade e resultado para o seu negócio. Clique no botão abaixo para
        revisar os detalhes, escopo e prazos.
      </Text>
      <Text className="text-base">
        Qualquer dúvida, você pode responder diretamente no chat do projeto
        dentro da plataforma.
      </Text>
    </BaseEmailLayout>
  )
}
