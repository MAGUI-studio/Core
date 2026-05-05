import * as React from "react"

import { Text } from "@react-email/components"

import { BaseEmailLayout } from "./BaseEmailLayout"

interface InvoiceSentEmailProps {
  contactName: string
  invoiceTitle: string
  invoiceUrl: string
  dueDate: string
  totalAmount: string
}

export const InvoiceSentEmail = ({
  contactName,
  invoiceTitle,
  invoiceUrl,
  dueDate,
  totalAmount,
}: InvoiceSentEmailProps) => {
  return (
    <BaseEmailLayout
      title="Nova Fatura Emitida"
      preview={`Sua fatura para ${invoiceTitle} foi emitida com vencimento em ${dueDate}.`}
      ctaText="Ver Detalhes Financeiros"
      ctaUrl={invoiceUrl}
    >
      <Text className="text-base">Olá, {contactName},</Text>
      <Text className="text-base">
        Informamos que a fatura referente a{" "}
        <strong className="text-slate-900">{invoiceTitle}</strong> foi gerada em
        nosso sistema.
      </Text>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest m-0">
          Vencimento
        </Text>
        <Text className="text-lg font-black text-slate-900 m-0">{dueDate}</Text>

        <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4 m-0">
          Valor Total
        </Text>
        <Text className="text-lg font-black text-blue-600 m-0">
          {totalAmount}
        </Text>
      </div>
    </BaseEmailLayout>
  )
}
