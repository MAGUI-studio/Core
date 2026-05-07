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
  contractingPartyType: "INDIVIDUAL" | "COMPANY"
  contractingLegalName: string
  contractingDocumentNumber: string
  contractingAddress: string
  contractingCityState: string
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
    return "Exclusões de Responsabilidade: Estão expressamente excluídos do escopo: gestão de redes sociais (posts e artes), licenciamento de ativos de terceiros com ônus financeiro (fontes e bancos de imagens pagos), gestão de tráfego pago e redação publicitária (copywriting)."
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

function buildExecutionDaysLabel(executionDays: string) {
  const numberWords: Record<string, string> = {
    "7": "sete",
    "10": "dez",
    "15": "quinze",
    "20": "vinte",
    "25": "vinte e cinco",
    "30": "trinta",
    "35": "trinta e cinco",
    "40": "quarenta",
    "45": "quarenta e cinco",
  }

  const normalized = executionDays.trim()
  const word = numberWords[normalized]

  if (!word) return `${normalized} dias úteis`

  return `${normalized} (${word}) dias úteis`
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
  const executionDaysLabel = buildExecutionDaysLabel(executionDays)
  const renewalValue = sanitizeCurrencyFragment(form.renewalValue)
  const clauseOne = buildObjectClauseOne(proposal.items, proposal.title)
  const clauseTwo = buildObjectClauseTwo(parsedNotes, proposal.items)
  const clauseThree = buildExcludedScopeClause(parsedNotes)
  const contractingPartyLine =
    form.contractingPartyType === "INDIVIDUAL"
      ? `CONTRATANTE: ${form.contractingSignerName}, brasileiro(a), portador(a) do CPF nº ${form.contractingDocumentNumber}, residente e domiciliado(a) na ${form.contractingAddress}, ${form.contractingCityState}.`
      : `CONTRATANTE: ${form.contractingSignerName}, brasileiro(a), portador(a) do CPF nº ${form.contractingDocumentNumber}, representante da empresa ${form.contractingLegalName}, residente e domiciliado(a) na ${form.contractingAddress}, ${form.contractingCityState}.`

  return `I. DAS PARTES
CONTRATADA: GUILHERME BUSTAMANTE, brasileiro, desenvolvedor, portador do CPF nº 464.952.288-99, operando sob a denominação comercial MAGUI.studio, com domicílio profissional em São José dos Campos/SP.

${contractingPartyLine}

CLÁUSULA 1. DO OBJETO TÉCNICO
1.1. ${clauseOne}
1.2. ${clauseTwo}
1.3. ${clauseThree}
CLÁUSULA 2. DO CRONOGRAMA E DO "GARGALO DE CONTEÚDO"
2.1. O prazo de execução será de ${executionDaysLabel}, contados a partir da validação do material inicial enviado pelo CONTRATANTE, que consiste obrigatoriamente no preenchimento do briefing e envio de ativos através do CRM da CONTRATADA (https://dashboard.magui.studio).

2.2. Cláusula de Reciprocidade de Prazos (Gargalo): Dada a natureza dependente da prestação de serviço, qualquer atraso por parte do CONTRATANTE no envio de materiais, ativos ou feedbacks resultará na postergação automática do cronograma final na proporção de 02 (dois) dias úteis de entrega para cada 01 (um) dia de atraso na resposta, visando a reorganização da fila de produção da CONTRATADA.

2.3. Suspensão por Inatividade: Caso o CONTRATANTE não forneça as informações ou materiais necessários por um período superior a 7 (sete) dias corridos, o projeto será automaticamente suspenso. A retomada do cronograma estará sujeita à disponibilidade de agenda da CONTRATADA e ao pagamento de uma taxa de reativação de 20% sobre o valor total do contrato, para cobertura de custos operacionais de reagendamento.
CLÁUSULA 3. DA METODOLOGIA DE COMUNICAÇÃO ASSÍNCRONA E GESTÃO VIA CRM
3.1. Exclusividade de Canal: Toda e qualquer interação técnica ou administrativa deverá ocorrer, obrigatoriamente, via plataforma oficial (https://dashboard.magui.studio). Comunicações via WhatsApp serão consideradas apenas informativas, não gerando obrigações contratuais até que sejam formalizadas no CRM.

3.2. Fundamentação do Modelo Assíncrono: A CONTRATADA opera sob regime de alta concentração técnica (Deep Work). Não estão previstas reuniões por videoconferência (Meet, Zoom), chamadas de voz ou atendimentos presenciais. As dúvidas e solicitações serão respondidas via CRM em até 24 (vinte e quatro) horas úteis.
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
4.2. A CONTRATADA compromete-se a seguir boas práticas de segurança durante o desenvolvimento, mas não será responsabilizada por falhas em serviços de infraestrutura de terceiros (ex: Vercel, Hostinger) ou integrações externas.
4.3. Propriedade de Ativos: O CONTRATANTE declara possuir os direitos de uso de todas as imagens, logotipos e textos fornecidos, assumindo total responsabilidade por eventuais infrações de direitos autorais.
CLÁUSULA 5. DAS CONDIÇÕES COMERCIAIS E RETENÇÃO DE CÓDIGO
5.1. Honorários: O valor total do projeto é de ${totalValue}.
5.2. Reserva de Agenda (Sinal): O pagamento será dividido em duas etapas:

Sinal (50%): Pago no ato da assinatura para reserva de agenda e início da estruturação.

Saldo Final (50%): Pago após a aprovação final do projeto em ambiente de homologação (link de testes) e obrigatoriamente antes da publicação em ambiente de produção (domínio definitivo).
5.3. Licença de Uso vs. Propriedade Intelectual: O pagamento do valor total do projeto (${totalValue}) confere ao CONTRATANTE o direito de uso e licenciamento da solução final em ambiente de produção (online).
5.3.1. Retenção de Código-Fonte: A CONTRATADA retém a propriedade intelectual sobre o código-fonte, arquitetura de software e arquivos editáveis. A entrega do repositório original para edição por terceiros é opcional e está condicionada ao pagamento da Taxa de Aquisição de Ativos Técnicos, no valor fixado em 100% (cem por cento) sobre o valor total deste contrato.
5.4. Liberação: A publicação oficial da Landing Page no domínio definitivo ocorrerá apenas após a confirmação do pagamento da segunda parcela (50% final).
CLÁUSULA 6. DA INFRAESTRUTURA E DOMÍNIO
6.1. Cortesia de Primeiro Ano: O valor total deste contrato inclui, como cortesia para o primeiro ciclo de 12 meses, o registro de 01 (um) domínio exclusivamente nas extensões .com.br ou .com.

Parágrafo Único: Caso o CONTRATANTE opte por extensões diferentes das citadas (ex: .ai, .tech, .store), o custo integral do registro e das renovações será de responsabilidade direta e exclusiva do CONTRATANTE.

6.2. Renovação de Domínio (Titularidade): Após os primeiros 12 meses, a responsabilidade financeira e técnica pela renovação do domínio junto ao registrador (Hostinger, Registro.br, etc.) passa a ser integralmente do CONTRATANTE. A CONTRATADA não se responsabiliza pela perda do domínio por falta de pagamento das taxas de renovação de terceiros.

6.3. Hospedagem e Manutenção Técnica (Service Fee): A hospedagem da Landing Page será realizada em servidor próprio da CONTRATADA (Vercel). O primeiro ano de hospedagem está incluso no valor total deste contrato.

6.4. Taxa de Permanência (Anuidade): Para manter a página ativa no servidor da CONTRATADA após o 12º mês, o CONTRATANTE deverá pagar uma taxa anual de R$ 297,00 (duzentos e noventa e sete reais). Este valor refere-se exclusivamente à manutenção do serviço de hospedagem e disponibilidade técnica, não incluindo a renovação do domínio citada na cláusula 6.2.

6.5. Suspensão por Inadimplência: O atraso superior a 05 (cinco) dias no pagamento da Taxa de Permanência (6.4) ou a falta de renovação do domínio por parte do CONTRATANTE (6.2) resultará na suspensão imediata da página e dos serviços vinculados.

CLÁUSULA 7. GARANTIA TÉCNICA E BUGS
7.1. A CONTRATADA oferece uma garantia de 30 (trinta) dias após a entrega final para correção de eventuais erros de codificação (bugs) que impeçam o pleno funcionamento do escopo aprovado.

7.2. A garantia não cobre erros causados por atualizações de navegadores, instabilidade em serviços de terceiros (hospedagem, APIs externas, gateways de pagamento) ou intervenções feitas no código por pessoas não autorizadas pela MAGUI.studio.

7.3. Exclusões: Solicitações de mudanças estéticas, ajustes de texto ou novas funcionalidades após a entrega não são cobertas pela garantia, sendo consideradas evolução de escopo e sujeitas a novo orçamento.
CLÁUSULA 8. DA RESCISÃO E INÉRCIA
8.1. Arrependimento e Retenção: Em caso de rescisão unilateral pelo CONTRATANTE após a assinatura deste instrumento e início da execução, o valor pago a título de Sinal (50%) será retido integralmente pela CONTRATADA para cobertura de custos operacionais e reserva de agenda.

8.2. Abandono de Projeto: Conforme estabelecido na Cláusula 2.3, a inatividade do CONTRATANTE superior a 07 (sete) dias corridos resultará na suspensão do projeto. Caso a inércia ultrapasse 30 (trinta) dias corridos, o contrato será considerado rescindido por abandono.

8.3. Efeitos da Rescisão por Abandono: Na hipótese de rescisão por abandono (8.2), a CONTRATADA fica desobrigada de entregar qualquer arquivo ou realizar a publicação da página, não cabendo ao CONTRATANTE o reembolso de quaisquer valores já pagos.

8.4. Rescisão por Justa Causa: O descumprimento de qualquer cláusula deste contrato por uma das partes autoriza a rescisão imediata pela parte prejudicada, mediante aviso prévio por escrito via CRM.
CLÁUSULA 9. DO DIREITO DE EXPOSIÇÃO E CRÉDITOS
9.1. Portfólio: O CONTRATANTE autoriza a MAGUI.studio a utilizar o nome, marca, depoimentos e capturas de tela do projeto finalizado em seu portfólio, redes sociais e materiais de apresentação para fins de divulgação técnica e comercial.

9.2. Assinatura de Rodapé: A CONTRATADA reserva-se o direito de manter um link discreto no rodapé da Landing Page desenvolvida, contendo a identificação "Desenvolvido por MAGUI.studio" (ou similar), vinculado ao site oficial da CONTRATADA.

9.3. Licenciamento White Label: Caso o CONTRATANTE opte pela não exposição em portfólio ou pela remoção dos créditos de rodapé (9.2), deverá realizar o pagamento de uma Taxa de Licenciamento de Marca Branca no valor fixo de R$ 200,00 (duzentos reais). A remoção da assinatura sem o devido pagamento configurará descumprimento contratual de propriedade intelectual.
CLÁUSULA 10. DA RESPONSABILIDADE PELO CONTEÚDO
10.1. O CONTRATANTE é o único responsável pela veracidade das informações, ofertas, promessas de venda e legalidade dos produtos/serviços anunciados no projeto.
10.2. A CONTRATADA atua estritamente como desenvolvedora técnica, não tendo qualquer ingerência ou responsabilidade sobre o modelo de negócio ou resultados financeiros do CONTRATANTE.

CLÁUSULA 11. CASO FORTUITO OU FORÇA MAIOR
11.1. Nenhuma das partes será responsável por falhas ou atrasos no cumprimento de suas obrigações decorrentes de causas fora de seu controle razoável, incluindo, mas não se limitando a, desastres naturais, guerras, greves gerais ou interrupções globais de infraestrutura de internet.

CLÁUSULA 12. DA VALIDADE JURÍDICA DIGITAL
12.1. As partes reconhecem a validade jurídica de assinaturas eletrônicas e aceites digitais realizados via Autentique, Gov.br ou plataforma interna da CONTRATADA.

CLÁUSULA 13. DO FORO
13.1. Fica eleito o Foro da Comarca de São José dos Campos/SP para dirimir controvérsias deste instrumento.`
}
