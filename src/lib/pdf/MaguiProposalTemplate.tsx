import * as React from "react"

import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import fs from "node:fs"
import path from "node:path"

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const CONTENT_TOP = 80
const CONTENT_RIGHT = 50
const CONTENT_BOTTOM = 70
const CONTENT_LEFT = 50

function imageToDataUri(dir: string, fileName: string) {
  const filePath = path.join(process.cwd(), "public", dir, fileName)
  const file = fs.readFileSync(filePath)
  const extension = path.extname(fileName).slice(1)
  const mimeType = extension === "svg" ? "image/svg+xml" : `image/${extension}`
  return `data:${mimeType};base64,${file.toString("base64")}`
}

const FRONT_IMAGE = imageToDataUri("images", "proposal_front.png")
const BACK_IMAGE = imageToDataUri("images", "proposal_back.png")
const PAGE_IMAGE = imageToDataUri("images", "proposal_page.png")

const styles = StyleSheet.create({
  page: {
    position: "relative",
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fontFamily: "Helvetica",
    color: "#000000",
  },
  fullBleed: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  content: {
    position: "absolute",
    top: CONTENT_TOP,
    left: CONTENT_LEFT,
    right: CONTENT_RIGHT,
    bottom: CONTENT_BOTTOM,
  },
  title: {
    fontSize: 16,
    lineHeight: 1.2,
    marginBottom: 14,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  companyLine: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 18,
  },
  metaText: {
    fontSize: 8.2,
    lineHeight: 1.3,
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 9.6,
    lineHeight: 1.5,
    marginTop: 6,
    marginBottom: 8,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
  },
  clauseTitle: {
    fontSize: 9.6,
    lineHeight: 1.5,
    marginTop: 18,
    marginBottom: 8,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
  },
  paragraph: {
    fontSize: 9.4,
    lineHeight: 1.55,
    marginBottom: 7,
    color: "#000000",
    textAlign: "justify",
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 7,
  },
  bulletMark: {
    width: 10,
    fontSize: 9.4,
    lineHeight: 1.55,
    fontFamily: "Helvetica-Bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.4,
    lineHeight: 1.55,
    textAlign: "justify",
  },
  spacer: {
    height: 10,
  },
  investmentBox: {
    marginTop: 8,
    marginBottom: 10,
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: "#0A84C6",
    backgroundColor: "#0A84C6",
    borderRadius: 8,
  },
  investmentTitle: {
    fontSize: 10,
    lineHeight: 1.3,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  investmentValue: {
    fontSize: 20,
    lineHeight: 1.1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  investmentMeta: {
    fontSize: 9.2,
    lineHeight: 1.5,
    color: "#EAF6FD",
  },
  connectBonusBox: {
    marginTop: 8,
    marginBottom: 10,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  connectBonusEyebrow: {
    fontSize: 8,
    lineHeight: 1.3,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    color: "#0A84C6",
  },
  connectBonusTitle: {
    fontSize: 13,
    lineHeight: 1.2,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  connectBonusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  connectBonusText: {
    fontSize: 9.2,
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: "justify",
    color: "#1F2937",
  },
  connectBonusFeatureText: {
    fontSize: 8.8,
    lineHeight: 1.45,
    marginBottom: 10,
    color: "#000000",
    textAlign: "justify",
  },
  connectBonusPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 11,
    lineHeight: 1.4,
    color: "#000000",
    marginBottom: 2,
  },
  connectBonusLink: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#0A84C6",
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  studioInlineLink: {
    fontSize: 9.4,
    lineHeight: 1.55,
    color: "#0A84C6",
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  connectBonusOldPrice: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textDecoration: "line-through",
    color: "#000000",
  },
  connectBonusFreePrice: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0A84C6",
  },
  footer: {
    position: "absolute",
    left: CONTENT_LEFT,
    right: CONTENT_RIGHT,
    bottom: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#4B5563",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
})

interface ProposalItem {
  description: string
  longDescription?: string | null
  unitValue: number
  quantity: number
}

interface ProposalData {
  title?: string | null
  createdAt: Date | string
  validUntil?: Date | string | null
  totalValue: number
  currency?: string | null
  notes?: string | null
  items: ProposalItem[]
}

interface LeadData {
  companyName: string
}

interface MaguiProposalTemplateProps {
  proposal: ProposalData
  lead: LeadData
}

type ParsedNotes = {
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
  connectBonus: string[]
}

type Block =
  | { type: "section"; text: string }
  | { type: "aboutStudio" }
  | { type: "clause"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; lines: string[] }
  | { type: "investment"; proposal: ProposalData }
  | { type: "connectBonus" }
  | { type: "spacer" }

function toDateLabel(value?: Date | string | null) {
  if (!value) return "Não definido"
  return new Date(value).toLocaleDateString("pt-BR")
}

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value)
}

function splitContent(value?: string | null) {
  if (!value) return []

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function normalizeSectionKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function parseProposalNotes(notes?: string | null): ParsedNotes {
  const parsed: ParsedNotes = {
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
    connectBonus: [],
  }

  if (!notes?.trim()) return parsed

  const sections = notes
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean)

  sections.forEach((section) => {
    const [rawTitle, ...rest] = section.split(/\r?\n/)
    const title = normalizeSectionKey(rawTitle.replace(/^##\s*/, ""))
    const lines = splitContent(rest.join("\n").trim())

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
    else if (title === "magui connect" || title === "bonus magui connect")
      parsed.connectBonus = lines
  })

  return parsed
}

function splitParagraphIntoChunks(text: string, targetLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (!normalized) return []

  const sentences = normalized.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ""

  sentences.forEach((sentence) => {
    if (!current) {
      current = sentence
      return
    }

    if (`${current} ${sentence}`.length <= targetLength) {
      current = `${current} ${sentence}`
      return
    }

    chunks.push(current)
    current = sentence
  })

  if (current) chunks.push(current)
  return chunks
}

function estimateLines(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.length / charsPerLine))
}

function estimateBlockHeight(block: Block) {
  if (block.type === "spacer") return 10
  if (block.type === "section") return 24
  if (block.type === "clause") return 34
  if (block.type === "investment") return 126
  if (block.type === "connectBonus") return 120
  if (block.type === "aboutStudio") {
    return Math.max(
      18,
      estimateLines(
        "MAGUI.studio é um estúdio de arquitetura de interface, performance digital e engenharia frontend. Nossa atuação é focada em transformar demandas comerciais em ativos digitais claros, rápidos, confiáveis e visualmente sólidos.",
        86
      ) * 15
    )
  }
  if (block.type === "paragraph") {
    return Math.max(18, estimateLines(block.text, 86) * 15)
  }

  return 10 + block.lines.reduce((sum, line) => sum + estimateLines(line, 82) * 15, 0)
}

function cleanPageBlocks(blocks: Block[]) {
  const cleaned = [...blocks]
  while (cleaned[0]?.type === "spacer") cleaned.shift()
  while (cleaned.at(-1)?.type === "spacer") cleaned.pop()
  return cleaned
}

function paginateBlocks(blocks: Block[]) {
  const pages: Block[][] = []
  let current: Block[] = []
  let height = 0
  const usableHeight = PAGE_HEIGHT - CONTENT_TOP - CONTENT_BOTTOM - 12
  const firstPageUsableHeight = usableHeight - 112

  blocks.forEach((block, index) => {
    const blockHeight = estimateBlockHeight(block)
    const currentLimit = pages.length === 0 ? firstPageUsableHeight : usableHeight

    const nextBlock = blocks[index + 1]
    const keepWithNext =
      (block.type === "clause" || block.type === "section") &&
      nextBlock &&
      (nextBlock.type === "paragraph" || nextBlock.type === "bullets")
        ? estimateBlockHeight(nextBlock)
        : 0

    if (current.length > 0 && height + blockHeight + keepWithNext > currentLimit) {
      const cleaned = cleanPageBlocks(current)
      if (cleaned.length > 0) pages.push(cleaned)
      current = []
      height = 0
    }

    if (current.length === 0 && block.type === "spacer") return

    current.push(block)
    height += blockHeight
  })

  const cleaned = cleanPageBlocks(current)
  if (cleaned.length > 0) pages.push(cleaned)
  return pages
}

function renderRichText(text: string, key: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${key}-${index}`} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      )
    }

    return <React.Fragment key={`${key}-${index}`}>{part}</React.Fragment>
  })
}

function renderBlock(block: Block, index: number) {
  if (block.type === "section") {
    return (
      <Text key={index} style={styles.sectionTitle}>
        {block.text}
      </Text>
    )
  }

  if (block.type === "aboutStudio") {
    return (
      <Text key={index} style={styles.paragraph}>
        <Link src="https://magui.studio" style={styles.studioInlineLink}>
          MAGUI.studio
        </Link>{" "}
        é um estúdio de arquitetura de interface, performance digital e engenharia frontend. Nossa atuação é focada em transformar demandas comerciais em ativos digitais claros, rápidos, confiáveis e visualmente sólidos.
      </Text>
    )
  }

  if (block.type === "clause") {
    return (
      <Text key={index} style={styles.clauseTitle}>
        {block.text}
      </Text>
    )
  }

  if (block.type === "paragraph") {
    return (
      <Text key={index} style={styles.paragraph}>
        {renderRichText(block.text, `paragraph-${index}`)}
      </Text>
    )
  }

  if (block.type === "bullets") {
    return (
      <View key={index}>
        {block.lines.map((line, lineIndex) => (
          <View key={`${index}-${lineIndex}`} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>-</Text>
            <Text style={styles.bulletText}>
              {renderRichText(line, `bullet-${index}-${lineIndex}`)}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  if (block.type === "investment") {
    const proposal = block.proposal

    return (
      <View key={index} style={styles.investmentBox}>
        <Text style={styles.investmentTitle}>INVESTIMENTO TOTAL</Text>
        <Text style={styles.investmentValue}>
          {formatCurrency(proposal.totalValue, proposal.currency || "BRL")}
        </Text>
        <Text style={styles.investmentMeta}>
          {renderRichText(
            "Este valor corresponde à **licença de uso da solução em produção**, à condução técnica da entrega e à estruturação comercial apresentada nesta proposta.",
            `investment-${index}`
          )}
        </Text>
      </View>
    )
  }

  if (block.type === "connectBonus") {
    return (
      <View key={index} style={styles.connectBonusBox}>
        <Text style={styles.connectBonusEyebrow}>BÔNUS COMERCIAL</Text>
        <View style={styles.connectBonusHeaderRow}>
          <Text style={styles.connectBonusTitle}>MAGUI Connect</Text>
          <Link src="https://bio.magui.studio" style={styles.connectBonusLink}>
            Ver demonstração
          </Link>
        </View>
        <Text style={styles.connectBonusText}>
          {renderRichText(
            "O **MAGUI Connect** é uma página no estilo Linktree, criada para reunir os principais links, canais de contato e pontos de acesso da marca em um único lugar, com apresentação mais profissional. Nesta proposta, ele está sendo concedido como **bônus 100% gratuito**",
            `connect-title-${index}`
          )}
          {" de "}
          <Text style={styles.bold}>R$ 497,00</Text>
          {" por "}
          <Text style={styles.bold}>R$ 0,00.</Text>
        </Text>
      </View>
    )
  }

  return <View key={index} style={styles.spacer} />
}

function buildProposalBlocks(
  proposal: ProposalData,
  lead: LeadData,
  notes: ParsedNotes,
  validUntil?: Date | string | null
): Block[] {
  const summary = notes.executiveSummary.length
    ? notes.executiveSummary
    : [
        `Esta proposta comercial apresenta a estrutura de entrega da MAGUI.studio para **${lead.companyName}**, com foco em clareza comercial, execução previsível e alinhamento total com o modelo operacional que será formalizado em contrato.`,
      ]

  const objectives = notes.objectives.length
    ? notes.objectives
    : [
        "Otimizar a presença digital, melhorar a leitura de valor da oferta e transformar a intenção comercial em uma entrega organizada e mensurável.",
      ]

  const impact = notes.expectedImpact.length
    ? notes.expectedImpact
    : [
        "Mais clareza na oferta, menos atrito no processo comercial e uma entrega digital percebida como séria, rápida e confiável.",
      ]

  const differentials = notes.differentials.length
    ? notes.differentials
    : [
        "Condução técnica com alto rigor, comunicação assíncrona centralizada e escopo organizado para evitar ruídos e retrabalho.",
      ]

  const timeline = notes.timeline.length
    ? notes.timeline
    : [
        "Estimativa em dias úteis, com início da contagem somente após briefing validado e materiais obrigatórios enviados pelo cliente via CRM.",
      ]

  const paymentTerms = notes.paymentTerms.length
    ? notes.paymentTerms
    : [
        "Pagamento dividido em **50% no sinal** e **50% antes da publicação oficial**, sempre pela plataforma via link seguro.",
      ]

  const notIncluded = notes.notIncluded.length
    ? notes.notIncluded
    : [
        "Redação publicitária, tráfego pago, redes sociais e licenciamento oneroso de ativos de terceiros não fazem parte do escopo padrão.",
      ]

  const platformFlow = notes.platformFlow.length
    ? notes.platformFlow
    : [
        "Toda a comunicação, aprovações e envio de materiais acontecem pela plataforma oficial da MAGUI.studio, preservando histórico, segurança e rastreabilidade.",
      ]

  const nextSteps = notes.nextSteps.length
    ? notes.nextSteps
    : [
        "Aprovação da proposta.",
        "Assinatura do contrato digital.",
        "Pagamento do sinal de 50%.",
        "Acesso ao CRM para preenchimento do briefing.",
      ]

  const acceptance = notes.acceptanceCriteria.length
    ? notes.acceptanceCriteria
    : [
        "Entrega validada com base em responsividade, integridade técnica, funcionamento do escopo aprovado e critérios combinados na proposta.",
      ]

  const warranty = notes.warranty.length
    ? notes.warranty
    : [
        "Ajustes e garantia seguem o escopo aprovado, sem incluir novas funcionalidades fora do combinado inicial.",
      ]

  const hasConnectBonus = notes.connectBonus.length > 0
  const proposalValidity = validUntil
    ? toDateLabel(validUntil)
    : "a data indicada nesta proposta"

  const scopeBullets = proposal.items.flatMap((item) => {
    const description = item.longDescription?.trim()
      ? `**${item.description}:** ${item.longDescription.trim()}`
      : `**${item.description}:** entrega estruturada com foco em execução limpa, performance e resultado final consistente.`

    return splitParagraphIntoChunks(description, 200)
  })

  return [
    { type: "section", text: "I. SOBRE A MAGUI.STUDIO" },
    { type: "aboutStudio" },
    {
      type: "paragraph",
      text: "Trabalhamos com metodologia assíncrona, escopo técnico bem definido e comunicação centralizada via CRM. Isso cria previsibilidade para o cliente e protege a execução do projeto contra ruído, retrabalho e desalinhamento.",
    },
    { type: "clause", text: "1. IDENTIFICAÇÃO DAS PARTES E OBJETIVO DO PROJETO" },
    {
      type: "paragraph",
      text: `Esta proposta comercial é apresentada pela **MAGUI.studio** para **${lead.companyName}**.`,
    },
    ...summary.flatMap((line) =>
      splitParagraphIntoChunks(line, 220).map((text) => ({ type: "paragraph", text }) as Block)
    ),
    { type: "bullets", lines: objectives },
    { type: "clause", text: "2. ESCOPO TÉCNICO DETALHADO" },
    { type: "bullets", lines: scopeBullets },
    { type: "clause", text: "3. IMPACTO ESPERADO E DIFERENCIAIS" },
    { type: "bullets", lines: [...impact, ...differentials] },
    {
      type: "paragraph",
      text: "Quando a presença digital é lenta, confusa ou visualmente fraca, a operação comercial perde tempo explicando o básico e desperdiça oportunidades que já chegaram com intenção de compra. Esta proposta existe para transformar esse ponto de contato em um ativo mais convincente, mais rápido e mais profissional.",
    },
    { type: "clause", text: "4. INVESTIMENTO E CONDIÇÕES DE PAGAMENTO" },
    { type: "bullets", lines: paymentTerms },
    ...proposal.items.map(
      (item) =>
        ({
          type: "paragraph",
          text: `**${item.description}:** ${item.quantity}x ${formatCurrency(item.unitValue, proposal.currency || "BRL")} = **${formatCurrency(item.unitValue * item.quantity, proposal.currency || "BRL")}**`,
        }) as Block
    ),
    { type: "investment", proposal },
    ...(hasConnectBonus ? ([{ type: "connectBonus" }] as Block[]) : []),
    {
      type: "paragraph",
      text: "A **publicação oficial em produção** ocorre somente após a compensação do saldo final, conforme a regra comercial e contratual da MAGUI.studio.",
    },
    {
      type: "paragraph",
      text: `Esta proposta permanece válida até **${proposalValidity}**. A reserva de agenda só é confirmada após aprovação formal e pagamento do sinal, garantindo previsibilidade real de início e entrega.`,
    },
    { type: "clause", text: "5. PRAZO, GATILHO DE INÍCIO E METODOLOGIA DE TRABALHO" },
    { type: "bullets", lines: timeline },
    { type: "bullets", lines: platformFlow },
    {
      type: "paragraph",
      text: "O prazo começa somente após o preenchimento do briefing e o envio dos ativos obrigatórios pelo CRM. A ausência de retorno do cliente impacta diretamente o cronograma, conforme a regra contratual.",
    },
    { type: "clause", text: "6. CRITÉRIOS DE ACEITE, EXCLUSÕES E TRANSPARÊNCIA DE ESCOPO" },
    { type: "bullets", lines: acceptance },
    { type: "bullets", lines: notIncluded },
    { type: "bullets", lines: warranty },
    { type: "clause", text: "7. INFRAESTRUTURA, CONTINUIDADE E CUSTOS FUTUROS" },
    {
      type: "paragraph",
      text: "O primeiro ciclo de **12 meses** pode incluir domínio e hospedagem conforme o escopo comercial aprovado. Após esse período, a continuidade do projeto depende da renovação da infraestrutura e das condições de permanência aplicáveis.",
    },
    {
      type: "paragraph",
      text: "Para manter a página ativa após o primeiro ano, aplica-se a taxa anual vigente de **R$ 297,00**, além da renovação do domínio quando cabível. Esta informação é apresentada desde a proposta para garantir transparência total.",
    },
    { type: "clause", text: "8. PRÓXIMOS PASSOS E FORMALIZAÇÃO" },
    { type: "bullets", lines: nextSteps },
  ]
}

function InternalPage({
  title,
  leadName,
  createdAt,
  validUntil,
  isFirstPage,
  blocks,
}: {
  title: string
  leadName: string
  createdAt?: Date | string
  validUntil?: Date | string | null
  isFirstPage: boolean
  blocks: Block[]
}) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={PAGE_IMAGE} style={styles.sheet} fixed />

      <View style={styles.content}>
        {isFirstPage ? (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.companyLine}>{leadName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Emitido em {toDateLabel(createdAt)}</Text>
              <Text style={styles.metaText}>Válido até {toDateLabel(validUntil)}</Text>
            </View>
          </>
        ) : null}

        {blocks.map((block, index) => renderBlock(block, index))}

        <View style={styles.footer} fixed>
          <Text>MAGUI.studio</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </View>
    </Page>
  )
}

export function MaguiProposalTemplate({
  proposal,
  lead,
}: MaguiProposalTemplateProps) {
  const notes = parseProposalNotes(proposal.notes)
  const blocks = buildProposalBlocks(proposal, lead, notes, proposal.validUntil)
  const pages = paginateBlocks(blocks)

  return (
    <Document title={proposal.title || "Proposta Comercial"}>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={FRONT_IMAGE} style={styles.fullBleed} />
      </Page>

      {pages.map((pageBlocks, index) => (
        <InternalPage
          key={`proposal-${index}`}
          title={proposal.title || "PROPOSTA COMERCIAL"}
          leadName={lead.companyName}
          createdAt={proposal.createdAt}
          validUntil={proposal.validUntil}
          isFirstPage={index === 0}
          blocks={pageBlocks}
        />
      ))}

      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={BACK_IMAGE} style={styles.fullBleed} />
      </Page>
    </Document>
  )
}

