import * as React from "react"

import { Text } from "@react-email/components"

import { BaseEmailLayout } from "./BaseEmailLayout"

interface ContractSentEmailProps {
  contactName: string
  contractTitle: string
  contractUrl: string
}

export const ContractSentEmail = ({
  contactName,
  contractTitle,
  contractUrl,
}: ContractSentEmailProps) => {
  return (
    <BaseEmailLayout
      title="Contrato Pendente de Assinatura"
      preview={`O documento ${contractTitle} foi enviado para sua assinatura digital.`}
      ctaText="Assinar Documento"
      ctaUrl={contractUrl}
    >
      <Text className="text-base">Olá, {contactName},</Text>
      <Text className="text-base">
        O contrato oficial para o documento{" "}
        <strong className="text-slate-900">{contractTitle}</strong> foi gerado e
        enviado para assinatura digital via Autentique.
      </Text>
      <Text className="text-base">
        Para garantir a segurança jurídica de ambas as partes e o início
        imediato das próximas etapas, solicitamos que revise e assine o
        documento através do link abaixo.
      </Text>
      <Text className="text-base">
        O processo é totalmente digital e leva menos de 2 minutos.
      </Text>
    </BaseEmailLayout>
  )
}
