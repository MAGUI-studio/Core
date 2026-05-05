import * as React from "react"

import { Text } from "@react-email/components"

import { BaseEmailLayout } from "./BaseEmailLayout"

interface ProjectUpdateEmailProps {
  contactName: string
  projectName: string
  updateTitle: string
  updateUrl: string
  requiresApproval?: boolean
}

export const ProjectUpdateEmail = ({
  contactName,
  projectName,
  updateTitle,
  updateUrl,
  requiresApproval = false,
}: ProjectUpdateEmailProps) => {
  const title = requiresApproval
    ? "Aprovação Pendente no Projeto"
    : "Nova Evolução no Projeto"

  const preview = requiresApproval
    ? `A atualização "${updateTitle}" aguarda sua aprovação.`
    : `Acabamos de publicar uma nova atualização: ${updateTitle}`

  return (
    <BaseEmailLayout
      title={title}
      preview={preview}
      ctaText={requiresApproval ? "Revisar e Aprovar" : "Ver Timeline"}
      ctaUrl={updateUrl}
    >
      <Text className="text-base">Olá, {contactName},</Text>
      <Text className="text-base">
        Temos novidades no projeto{" "}
        <strong className="text-slate-900">{projectName}</strong>.
      </Text>
      <Text className="text-base italic text-slate-600">
        &quot;{updateTitle}&quot;
      </Text>

      {requiresApproval ? (
        <Text className="text-base">
          Esta atualização requer sua validação para que possamos prosseguir
          conforme o planejado. Por favor, revise os detalhes e registre sua
          aprovação no botão abaixo.
        </Text>
      ) : (
        <Text className="text-base">
          Uma nova etapa foi concluída e registrada na sua timeline. Você pode
          acompanhar o progresso detalhado clicando no botão abaixo.
        </Text>
      )}
      <Text className="text-base">
        Continuamos trabalhando com foco total na excelência do seu projeto.
      </Text>
    </BaseEmailLayout>
  )
}
