type ProposalItemInput = {
  description: string
  longDescription?: string | null
  quantity?: number
}

type ProposalSourceInput = {
  title: string
  totalValue: number
  currency?: string | null
  notes?: string | null
  items: ProposalItemInput[]
}

export type ContractDynamicFormData = {
  contractingLegalName: string
  contractingDocumentType: "CPF" | "CNPJ"
  contractingDocumentNumber: string
  contractingAddress: string
  contractingSignerName: string
  renewalValue: string
}

type BuildContractTextInput = {
  proposal: ProposalSourceInput
  form: ContractDynamicFormData
}

export type ParsedProposalNotes = {
  executiveSummary: string[]
  objectives: string[]
  expectedImpact: string[]
  differentials: string[]
  timeline: string[]
  paymentTerms: string[]
  acceptanceCriteria: string[]
  notIncluded: string[]
  warranty: string[]
  platformFlow: string[]
  nextSteps: string[]
  additionalNotes: string[]
  bonus: string[]
}

function normalizeSectionTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

function splitContent(value?: string | null) {
  if (!value) return []

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function parseProposalNotes(notes?: string | null): ParsedProposalNotes {
  const parsed: ParsedProposalNotes = {
    executiveSummary: [],
    objectives: [],
    expectedImpact: [],
    differentials: [],
    timeline: [],
    paymentTerms: [],
    acceptanceCriteria: [],
    notIncluded: [],
    warranty: [],
    platformFlow: [],
    nextSteps: [],
    additionalNotes: [],
    bonus: [],
  }

  if (!notes?.trim()) return parsed

  const sections = notes
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean)

  sections.forEach((section) => {
    const [rawTitle, ...rest] = section.split(/\r?\n/)
    const title = normalizeSectionTitle(rawTitle.replace(/^##\s*/, ""))
    const content = rest.join("\n").trim()
    const lines = splitContent(content)

    if (title === "resumo executivo") parsed.executiveSummary = lines
    else if (title === "objetivos do projeto") parsed.objectives = lines
    else if (title === "impacto esperado") parsed.expectedImpact = lines
    else if (title === "diferenciais da entrega") parsed.differentials = lines
    else if (title === "prazo estimado") parsed.timeline = lines
    else if (title === "condicoes de pagamento") parsed.paymentTerms = lines
    else if (title === "criterios de aceite") parsed.acceptanceCriteria = lines
    else if (title === "o que nao esta incluso") parsed.notIncluded = lines
    else if (title === "garantia e ajustes") parsed.warranty = lines
    else if (title === "operacao pela plataforma") parsed.platformFlow = lines
    else if (title === "proximos passos") parsed.nextSteps = lines
    else if (title === "observacoes adicionais") parsed.additionalNotes = lines
    else if (title === "bonus exclusivo") parsed.bonus = lines
  })

  if (
    parsed.executiveSummary.length === 0 &&
    parsed.objectives.length === 0 &&
    parsed.expectedImpact.length === 0 &&
    parsed.differentials.length === 0 &&
    parsed.timeline.length === 0 &&
    parsed.paymentTerms.length === 0 &&
    parsed.acceptanceCriteria.length === 0 &&
    parsed.notIncluded.length === 0 &&
    parsed.warranty.length === 0 &&
    parsed.platformFlow.length === 0 &&
    parsed.nextSteps.length === 0 &&
    parsed.additionalNotes.length === 0 &&
    parsed.bonus.length === 0
  ) {
    parsed.additionalNotes = splitContent(notes)
  }

  return parsed
}

export function formatCurrencyBRL(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value)
}

function joinWithConjunction(items: string[]) {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} e ${items[1]}`

  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`
}

function normalizeSentence(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

function stripTrailingPeriod(text: string) {
  return text.replace(/[.]+$/g, "").trim()
}

function buildScopeSummary(items: ProposalItemInput[]) {
  const descriptions = items
    .map((item) => normalizeSentence(item.description))
    .filter(Boolean)

  return joinWithConjunction([...new Set(descriptions)])
}

function buildObjectClauseOne(
  items: ProposalItemInput[],
  fallbackTitle: string
) {
  const scopeSummary = buildScopeSummary(items)

  if (scopeSummary) {
    return `O presente contrato tem como objeto a prestação dos serviços especializados descritos na proposta comercial aprovada, contemplando ${scopeSummary}.`
  }

  return `O presente contrato tem como objeto a prestação dos serviços especializados descritos na proposta comercial aprovada para o projeto "${fallbackTitle}".`
}

function buildObjectClauseTwo(
  parsedNotes: ParsedProposalNotes,
  items: ProposalItemInput[]
) {
  const detailSources = [
    ...items
      .map((item) => item.longDescription?.trim())
      .filter((value): value is string => Boolean(value)),
    ...parsedNotes.acceptanceCriteria,
    ...parsedNotes.differentials,
    ...parsedNotes.executiveSummary,
  ]

  const primaryDetail = detailSources
    .map((value) => normalizeSentence(value))
    .find(Boolean)

  if (primaryDetail) {
    return `A solução entregue deverá seguir o escopo comercial aprovado e os critérios definidos na proposta, incluindo ${stripTrailingPeriod(primaryDetail)}.`
  }

  const scopeSummary = buildScopeSummary(items)

  if (scopeSummary) {
    return `A solução entregue deverá seguir o escopo comercial aprovado para ${scopeSummary}, respeitando os critérios de execução definidos na proposta comercial.`
  }

  return "A solução entregue deverá seguir o escopo comercial aprovado e os critérios definidos na proposta comercial."
}

function buildExcludedScopeClause(parsedNotes: ParsedProposalNotes) {
  if (parsedNotes.notIncluded.length === 0) {
    return "Exclusões de Responsabilidade: Estão expressamente excluídos do escopo: redação publicitária (copywriting), licenciamento de ativos de terceiros (fontes e bancos de imagens), gestão de tráfego pago ou manutenção de infraestrutura pós-entrega."
  }

  return `Exclusões de Responsabilidade: Estão expressamente excluídos do escopo: ${parsedNotes.notIncluded
    .map((line) => stripTrailingPeriod(normalizeSentence(line)))
    .join("; ")}.`
}

function extractTimelineDays(parsedNotes: ParsedProposalNotes) {
  const timelineText = parsedNotes.timeline.join(" ")
  const match = timelineText.match(/(\d+(?:\s*a\s*\d+)?)\s*dias?\s*(?:úteis|uteis)?/i)

  return match?.[1]?.replace(/\s+/g, " ").trim() ?? "X"
}

function buildPaymentSignalClause(
  parsedNotes: ParsedProposalNotes,
  totalValue: number,
  currency?: string | null
) {
  if (parsedNotes.paymentTerms.length > 0) {
    const normalized = parsedNotes.paymentTerms
      .map((line) => normalizeSentence(line))
      .join(" ")
      .replace(
        /Pagamento via[^.]+\.?/i,
        "O pagamento será disponibilizado por meio de link seguro da plataforma da CONTRATADA, com processamento via Stripe, podendo ser realizado por cartão de crédito ou boleto bancário."
      )

    if (/Stripe|cartão de crédito|boleto bancário/i.test(normalized)) {
      return normalized
    }

    return `${normalized} O pagamento será disponibilizado por meio de link seguro da plataforma da CONTRATADA, com processamento via Stripe, podendo ser realizado por cartão de crédito ou boleto bancário.`
  }

  const halfValue = formatCurrencyBRL(
    Math.round(totalValue / 2),
    currency ?? "BRL"
  )
  return `O pagamento de 50% (cinquenta por cento) do valor total, equivalente a ${halfValue}, é condição para o início dos trabalhos. O pagamento será disponibilizado por meio de link seguro da plataforma da CONTRATADA, com processamento via Stripe, podendo ser realizado por cartão de crédito ou boleto bancário.`
}

function sanitizeCurrencyFragment(value: string) {
  return value.replace(/^R\$\s*/i, "").trim()
}

export function buildContractText({
  proposal,
  form,
}: BuildContractTextInput) {
  const parsedNotes = parseProposalNotes(proposal.notes)
  const totalValue = formatCurrencyBRL(proposal.totalValue, proposal.currency ?? "BRL")
  const executionDays = extractTimelineDays(parsedNotes)
  const renewalValue = sanitizeCurrencyFragment(form.renewalValue)
  const clauseOne = buildObjectClauseOne(proposal.items, proposal.title)
  const clauseTwo = buildObjectClauseTwo(parsedNotes, proposal.items)
  const clauseThree = buildExcludedScopeClause(parsedNotes)
  const paymentSignal = buildPaymentSignalClause(
    parsedNotes,
    proposal.totalValue,
    proposal.currency
  )

  return `I. DAS PARTES
CONTRATADA: GUILHERME BUSTAMANTE, profissional desenvolvedor operando
sob a denominação comercial MAGUI.studio, estabelecido em São José dos
Campos/SP.
CONTRATANTE: ${form.contractingLegalName}, devidamente inscrito no ${form.contractingDocumentType}
sob no ${form.contractingDocumentNumber}, com endereço em ${form.contractingAddress}.

CLÁUSULA 1. DO OBJETO TÉCNICO
1.1. ${clauseOne}
1.2. ${clauseTwo}
1.3. ${clauseThree}
CLÁUSULA 2. DO CRONOGRAMA E DO "GARGALO DE CONTEÚDO"
2.1. O prazo de execução será de ${executionDays} dias úteis, contados a partir da validação do material
inicial enviado pelo CONTRATANTE.
2.2. Cláusula de Reciprocidade de Prazos (Gargalo): Dada a natureza dependente da
prestação de serviço, qualquer dilação por parte do CONTRATANTE no envio de ativos ou
feedbacks resultará na postergação automática do cronograma final na proporção de 2
(dois) dias úteis de entrega para cada 1 (um) dia de atraso na resposta.
CLÁUSULA 3. DA METODOLOGIA DE COMUNICAÇÃO ASSÍNCRONA E GESTÃO VIA CRM
3.1. Exclusividade de Canal: Toda e qualquer interação técnica ou administrativa deverá
ocorrer, obrigatoriamente, via plataforma oficial de gestão da CONTRATADA (https://dashboard.magui.studio), doravante denominada CRM.

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
5.1. Honorários: O valor total do projeto é de ${totalValue}.
5.2. Reserva de Agenda (Sinal): ${paymentSignal}
5.3. Propriedade Intelectual vs. Código-Fonte: O pagamento integral confere ao
CONTRATANTE o direito de uso da solução em ambiente de produção. A cessão dos
arquivos-fonte brutos (código original para edição futura) é opcional e condicionada ao
pagamento da Taxa de Aquisição de Ativos Técnicos no valor equivalente a 50%
(cinquenta por cento) do valor total deste instrumento.
CLÁUSULA 6. DA INFRAESTRUTURA E DOMÍNIO (HOSTINGER)
6.1. A CONTRATADA intermediará o registro de 01 (um) domínio via Hostinger, com
validade de 12 meses.
6.2. Responsabilidade de Renovação: Após o período inicial, a responsabilidade
financeira pela manutenção do domínio é exclusivamente do
CONTRATANTE. O valor estimado para renovação é de R$ ${renewalValue}.

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
}
