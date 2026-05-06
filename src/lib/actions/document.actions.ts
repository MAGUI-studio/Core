"use server"

import { AuditActorType, DocumentType } from "@/src/generated/client"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { createAuditLog, getCurrentAppUser } from "@/src/lib/project-governance"

type ContractClauseSeed = {
  title: string
  content: string
}

const EXACT_CONTRACT_TEXT = `I. DAS PARTES
CONTRATADA: GUILHERME BUSTAMANTE, profissional desenvolvedor operando
sob a denominação comercial MAGUI.studio, estabelecido em São José dos
Campos/SP.
CONTRATANTE: [Nome Completo ou Razão Social], devidamente inscrito no [CPF
ou CNPJ] sob no [Número], com endereço em [Endereço Completo].

CLÁUSULA 1. DO OBJETO TÉCNICO
1.1. O presente contrato tem como objeto a prestação de serviços especializados de
arquitetura de interface (UI/UX) e engenharia de software frontend, utilizando o stack
tecnológico composto por Next.js, TypeScript e Tailwind CSS.
1.2. A solução entregue deverá apresentar compatibilidade responsiva e implementação
nativa de alternância de luminância (Light e Dark Mode).
1.3. Exclusões de Responsabilidade: Estão expressamente excluídos do escopo: redação
publicitária (copywriting), licenciamento de ativos de terceiros (fontes e bancos de
imagens), gestão de tráfego pago ou manutenção de infraestrutura pós-entrega.
CLÁUSULA 2. DO CRONOGRAMA E DO "GARGALO DE CONTEÚDO"
2.1. O prazo de execução será de [X] dias úteis, contados a partir da validação do material
inicial enviado pelo CONTRATANTE.
2.2. Cláusula de Reciprocidade de Prazos (Gargalo): Dada a natureza dependente da
prestação de serviço, qualquer dilação por parte do CONTRATANTE no envio de ativos ou
feedbacks resultará na postergação automática do cronograma final na proporção de 2
(dois) dias úteis de entrega para cada 1 (um) dia de atraso na resposta.
CLÁUSULA 3. DA METODOLOGIA DE COMUNICAÇÃO ASSÍNCRONA E GESTÃO VIA
CRM
3.1. Exclusividade de Canal: Toda e qualquer interação técnica ou administrativa deverá
ocorrer, obrigatoriamente, via plataforma oficial de gestão da CONTRATADA (https://
dashboard.magui.studio), doravante denominada CRM.

3.2. Fundamentação do Modelo Assíncrono: A CONTRATADA opera sob regime de alta
concentração técnica (Deep Work), visando a integridade do código e o cumprimento de
prazos. Portanto, não estão previstas e não serão realizadas reuniões por
videoconferência (Meet, Zoom), chamadas de voz ou atendimentos presenciais.
3.3. Segurança do Registro Escrito: A abstenção de chamadas síncronas visa garantir a
segurança jurídica de ambas as partes, assegurando que toda solicitação, alteração ou
aprovação esteja devidamente documentada por escrito no CRM, evitando ambiguidades
comuns em comunicações verbais.
3.4. Aprovação Vinculante: O projeto é segmentado em marcos evolutivos. A sinalização
de aprovação de uma etapa no CRM é considerada irrevogável e irretratável. Alterações
posteriores em etapas já validadas configurarão "Novo Escopo" e serão objeto de aditivo
contratual financeiro.
CLÁUSULA 4. DA PROTEÇÃO DE DADOS (LGPD) E CONFORMIDADE
4.1. O CONTRATANTE é o único controlador dos dados pessoais coletados através da
solução desenvolvida, cabendo-lhe a responsabilidade de implementar Termos de Uso e
Políticas de Privacidade adequados.
4.2. A CONTRATADA compromete-se a seguir boas práticas de segurança durante o
desenvolvimento, mas não será responsabilizada civil ou criminalmente por incidentes de
dados decorrentes da má gestão da hospedagem ou de integrações de terceiros.
CLÁUSULA 5. DAS CONDIÇÕES COMERCIAIS E RETENÇÃO DE CÓDIGO
5.1. Honorários: O valor total do projeto é de R$ [Valor Total].
5.2. Reserva de Agenda (Sinal): O pagamento de 50% (cinquenta por cento) do valor total
é condição para o início dos trabalhos.
5.3. Propriedade Intelectual vs. Código-Fonte: O pagamento integral confere ao
CONTRATANTE o direito de uso da solução em ambiente de produção. A cessão dos
arquivos-fonte brutos (código original para edição futura) é opcional e condicionada ao
pagamento da Taxa de Aquisição de Ativos Técnicos no valor equivalente a 50%
(cinquenta por cento) do valor total deste instrumento.
CLÁUSULA 6. DA INFRAESTRUTURA E DOMÍNIO (HOSTINGER)
6.1. A CONTRATADA intermediará o registro de 01 (um) domínio via Hostinger, com
validade de 12 meses.
6.2. Responsabilidade de Renovação: Após o período inicial, a responsabilidade
financeira pela manutenção do domínio e hospedagem é exclusivamente do
CONTRATANTE. O valor estimado para renovação é de R$ [Valor].

CLÁUSULA 7. GARANTIA TÉCNICA E BUGS
7.1. A CONTRATADA oferece uma garantia de 30 (trinta) dias após a entrega final para
correção de eventuais erros de codificação (bugs) que impeçam o funcionamento do
escopo original.
7.2. A garantia não cobre erros causados por atualizações de navegadores, serviços de
terceiros (Hostinger/APIs) ou edições feitas no código por pessoas não autorizadas pela
MAGUI.studio.
CLÁUSULA 8. DA RESCISÃO E INÉRCIA
8.1. Arrependimento: Em caso de rescisão unilateral pelo CONTRATANTE após o início da
execução, o valor do sinal será retido integralmente.
8.2. Abandono de Projeto: A ausência de interação no CRM por período superior a 15
(quinze) dias facultará a suspensão do projeto. Após 30 dias de inércia, o contrato será
rescindido por abandono.
CLÁUSULA 9. DO FORO
Fica eleito o Foro da Comarca de São José dos Campos/SP para dirimir quaisquer
controvérsias oriundas deste instrumento.`

function buildExactContractClauses(): ContractClauseSeed[] {
  return [
    {
      title: "EXACT_CONTRACT_TEXT",
      content: EXACT_CONTRACT_TEXT,
    },
  ]
}

export async function createContractFromProposalAction(proposalId: string) {
  try {
    await protect("admin")
    const actor = await getCurrentAppUser()

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        title: true,
        leadId: true,
        projectId: true,
        project: {
          select: {
            clientId: true,
          },
        },
      },
    })

    if (!proposal) {
      return { success: false, error: "Proposta não encontrada." }
    }

    const existing = await prisma.document.findFirst({
      where: {
        type: DocumentType.CONTRACT,
        sourceLeadId: proposal.leadId,
        title: `Contrato de Prestação de Serviços - ${proposal.title}`,
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    })

    const clauses = buildExactContractClauses()

    const result = await prisma.$transaction(async (tx) => {
      const document = existing
        ? await tx.document.update({
            where: { id: existing.id },
            data: {
              clientId: proposal.project?.clientId ?? null,
              projectId: proposal.projectId ?? null,
              clauses: {
                deleteMany: {},
                create: clauses.map((clause, index) => ({
                  order: index,
                  title: clause.title,
                  content: clause.content,
                })),
              },
              versions: {
                create: {
                  versionNumber: 1,
                  createdById: actor?.id ?? null,
                  contentSnapshot: {
                    clauses,
                  },
                },
              },
            },
          })
        : await tx.document.create({
            data: {
              type: DocumentType.CONTRACT,
              title: `Contrato de Prestação de Serviços - ${proposal.title}`,
              sourceLeadId: proposal.leadId,
              clientId: proposal.project?.clientId ?? null,
              projectId: proposal.projectId ?? null,
              clauses: {
                create: clauses.map((clause, index) => ({
                  order: index,
                  title: clause.title,
                  content: clause.content,
                })),
              },
              versions: {
                create: {
                  versionNumber: 1,
                  createdById: actor?.id ?? null,
                  contentSnapshot: {
                    clauses,
                  },
                },
              },
            },
          })

      await createAuditLog(
        {
          action: "document.contract_created",
          entityType: "Document",
          entityId: document.id,
          summary: `Contrato gerado a partir da proposta "${proposal.title}".`,
          actorId: actor?.id,
          actorType: actor ? AuditActorType.USER : AuditActorType.SYSTEM,
          projectId: proposal.projectId ?? null,
          metadata: {
            proposalId: proposal.id,
            leadId: proposal.leadId,
          },
        },
        tx
      )

      return document
    })

    return {
      success: true,
      documentId: result.id,
      reused: Boolean(existing),
      regenerated: Boolean(existing),
    }
  } catch (error) {
    logger.error({ error }, "Create Contract From Proposal Error")
    return { success: false, error: "Falha ao gerar contrato." }
  }
}
