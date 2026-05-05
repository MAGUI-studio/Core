import * as React from "react"

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import fs from "node:fs"
import path from "node:path"

// PDF Engine only supports Hex/RGB. Converting MAGUI brand colors.
const BRAND_COLORS = {
  primary: "#0093C8", // Official brand blue
  background: "#0F172A",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  ink: "#0F172A",
  body: "#334155",
  rule: "#D7E2EA",
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

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
    color: BRAND_COLORS.ink,
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
    position: "relative",
    flex: 1,
    paddingTop: 94, // Increased margin as requested (74 + 20)
    paddingRight: 60,
    paddingBottom: 64,
    paddingLeft: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: "auto",
  },
  studioInfo: {
    textAlign: "right",
  },
  studioName: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND_COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  studioDetails: {
    fontSize: 7,
    color: BRAND_COLORS.textMuted,
  },
  headerLine: {
    width: 40,
    height: 2,
    borderRadius: 999,
    backgroundColor: BRAND_COLORS.primary,
    marginBottom: 10,
  },
  kicker: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: BRAND_COLORS.primary,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    lineHeight: 1.1,
    marginBottom: 8,
    maxWidth: 440,
  },
  continuationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    lineHeight: 1.1,
    marginBottom: 8,
  },
  leadLine: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  intro: {
    fontSize: 9.5,
    lineHeight: 1.6,
    color: BRAND_COLORS.body,
    marginBottom: 8,
    maxWidth: 450,
  },
  metaRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 8,
    color: BRAND_COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 18,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    paddingRight: 10,
  },
  bulletMark: {
    width: 8,
    fontSize: 9,
    color: BRAND_COLORS.primary,
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: BRAND_COLORS.body,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.5,
    color: BRAND_COLORS.body,
    marginBottom: 7,
  },
  itemBlock: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: BRAND_COLORS.body,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 10,
    paddingBottom: 10,
  },
  pricingLeft: {
    flex: 1,
    paddingRight: 10,
  },
  pricingRight: {
    width: 140,
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    marginBottom: 3,
  },
  priceMeta: {
    fontSize: 8,
    color: BRAND_COLORS.textMuted,
  },
  investmentBox: {
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    backgroundColor: BRAND_COLORS.background,
    borderRadius: 12,
  },
  investmentLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: BRAND_COLORS.primary,
    fontWeight: "bold",
    marginBottom: 8,
  },
  investmentValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 1,
    marginBottom: 10,
  },
  investmentText: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: "#94A3B8",
    maxWidth: 420,
  },
  investmentMiniGrid: {
    flexDirection: "row",
    gap: 18,
    marginTop: 12,
  },
  investmentMiniCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  investmentMiniLabel: {
    fontSize: 7,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  investmentMiniValue: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: BRAND_COLORS.textMuted,
    paddingTop: 10,
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

interface ParsedNotes {
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
}

interface TextSectionBlock {
  kind: "bullets" | "paragraphs"
  title: string
  lines: string[]
}

interface ItemSectionBlock {
  kind: "items"
  title: string
  items: ProposalItem[]
}

interface PricingSectionBlock {
  kind: "pricing"
  title: string
  items: ProposalItem[]
  currency: string
}

interface InvestmentBlock {
  kind: "investment"
  totalValue: number
  currency: string
  itemCount: number
}

type ContentBlock =
  | TextSectionBlock
  | ItemSectionBlock
  | PricingSectionBlock
  | InvestmentBlock

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

function splitParagraphIntoChunks(text: string, targetLength = 180) {
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
  }

  if (!notes?.trim()) return parsed

  const sections = notes
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean)

  sections.forEach((section) => {
    const [rawTitle, ...rest] = section.split(/\r?\n/)
    const title = rawTitle
      .replace(/^##\s*/, "")
      .trim()
      .toLowerCase()
    const content = rest.join("\n").trim()
    const lines = splitContent(content)

    if (title === "resumo executivo") parsed.executiveSummary = lines
    else if (title === "objetivos do projeto") parsed.objectives = lines
    else if (title === "impacto esperado") parsed.expectedImpact = lines
    else if (title === "diferenciais da entrega") parsed.differentials = lines
    else if (title === "prazo estimado") parsed.timeline = lines
    else if (title === "condições de pagamento") parsed.paymentTerms = lines
    else if (title === "critérios de aceite") parsed.acceptanceCriteria = lines
    else if (title === "o que não está incluso") parsed.notIncluded = lines
    else if (title === "garantia e ajustes") parsed.warranty = lines
    else if (title === "operação pela plataforma") parsed.platformFlow = lines
    else if (title === "próximos passos") parsed.nextSteps = lines
    else if (title === "observações adicionais") parsed.additionalNotes = lines
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
    parsed.additionalNotes.length === 0
  ) {
    parsed.additionalNotes = splitContent(notes)
  }

  return parsed
}

function buildFallbackSummary(proposal: ProposalData) {
  const count = proposal.items.length

  return [
    `Esta proposta organiza ${count} ${
      count === 1 ? "entrega principal" : "entregas principais"
    } em uma leitura comercial clara, conectando escopo, critério de execução e investimento de forma objetiva.`,
  ]
}

function buildFallbackObjectives() {
  return [
    "Dar clareza ao que será entregue, como o trabalho será conduzido e qual leitura de valor sustenta a decisão.",
    "Reduzir ambiguidades comerciais e aumentar confiança na aprovação.",
  ]
}

function buildFallbackImpact() {
  return [
    "Mais clareza sobre escopo, investimento e condução do projeto.",
    "Percepção mais profissional da entrega e menor atrito operacional ao longo da execução.",
  ]
}

function buildFallbackDifferentials() {
  return [
    "Leitura comercial estruturada por entregas, e não apenas por preço final.",
    "Centralização de aprovações, materiais e histórico para diminuir retrabalho.",
  ]
}

function buildFallbackPlatformFlow() {
  return [
    "Toda a comunicação, aprovações, centralização de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI.",
    "Esse fluxo reduz ruído operacional, preserva histórico e facilita a tomada de decisão durante o projeto.",
  ]
}

function buildScopeParagraph(item: ProposalItem) {
  if (item.longDescription?.trim()) return item.longDescription.trim()

  return `${item.description} será conduzido(a) como uma frente dedicada do projeto, com alinhamento claro de entrega, critério de aprovação e foco em resultado final consistente.`
}

function buildDeliverableLine(item: ProposalItem) {
  if (item.longDescription?.trim()) return item.longDescription.trim()
  return `${item.description} com direcionamento claro de execução e entrega.`
}

function buildScopeParagraphs(item: ProposalItem) {
  return splitParagraphIntoChunks(buildScopeParagraph(item), 180)
}

function buildDeliverableParagraphs(item: ProposalItem) {
  return splitParagraphIntoChunks(buildDeliverableLine(item), 150)
}

function buildProcessLines(items: ProposalItem[], timeline: string[]) {
  const lines = [
    `O projeto foi dividido em ${items.length} ${
      items.length === 1 ? "frente principal" : "frentes principais"
    } para facilitar entendimento, aprovação e execução.`,
    "Cada entrega foi separada para tornar o investimento mais tangível e a operação mais previsível.",
  ]

  if (timeline.length > 0) lines.push(...timeline)

  return lines
}

function buildNextSteps(
  validUntil?: Date | string | null,
  customSteps?: string[]
) {
  if (customSteps && customSteps.length > 0) return customSteps

  return [
    "Aprovação desta proposta para consolidação do escopo e do investimento.",
    "Alinhamento final de prioridades, cronograma e materiais de entrada.",
    `Validade comercial deste documento: ${toDateLabel(validUntil)}.`,
  ]
}

function createTextBlocks(
  kind: "bullets" | "paragraphs",
  title: string,
  lines: string[],
  maxBlockHeight: number
): TextSectionBlock[] {
  const charsPerLine = kind === "bullets" ? 54 : 58
  const blocks: TextSectionBlock[] = []
  let currentLines: string[] = []
  let currentHeight = 28

  lines.forEach((line) => {
    const estimatedHeight = estimateLines(line, charsPerLine) * 11

    if (
      currentLines.length > 0 &&
      currentHeight + estimatedHeight > maxBlockHeight
    ) {
      blocks.push({
        kind,
        title: blocks.length === 0 ? title : `${title} (continuação)`,
        lines: currentLines,
      })
      currentLines = []
      currentHeight = 28
    }

    currentLines.push(line)
    currentHeight += estimatedHeight
  })

  if (currentLines.length > 0) {
    blocks.push({
      kind,
      title: blocks.length === 0 ? title : `${title} (continuação)`,
      lines: currentLines,
    })
  }

  return blocks
}

function estimateBlockHeight(block: ContentBlock) {
  if (block.kind === "investment") return 88

  if (block.kind === "bullets") {
    return (
      28 +
      block.lines.reduce((sum, line) => sum + estimateLines(line, 54) * 11, 0)
    )
  }

  if (block.kind === "paragraphs") {
    return (
      28 +
      block.lines.reduce((sum, line) => sum + estimateLines(line, 58) * 11, 0)
    )
  }

  if (block.kind === "items") {
    return (
      28 +
      block.items.reduce(
        (sum, item) =>
          sum +
          12 +
          buildScopeParagraphs(item).reduce(
            (itemSum, paragraph) => itemSum + estimateLines(paragraph, 58) * 10,
            0
          ),
        0
      )
    )
  }

  if (block.kind === "pricing") {
    return (
      28 +
      block.items.reduce(
        (sum: number, item: ProposalItem) =>
          sum +
          16 +
          buildDeliverableParagraphs(item).reduce(
            (itemSum, paragraph) => itemSum + estimateLines(paragraph, 42) * 10,
            0
          ),
        0
      )
    )
  }

  return 0
}

function paginateBlocks(
  blocks: ContentBlock[],
  firstPageCapacity: number,
  nextPageCapacity: number
) {
  const pages: ContentBlock[][] = []
  let currentPage: ContentBlock[] = []
  let currentHeight = 0
  let currentCapacity = firstPageCapacity

  blocks.forEach((block) => {
    const blockHeight = estimateBlockHeight(block)

    if (
      currentPage.length > 0 &&
      currentHeight + blockHeight > currentCapacity
    ) {
      pages.push(currentPage)
      currentPage = []
      currentHeight = 0
      currentCapacity = nextPageCapacity
    }

    currentPage.push(block)
    currentHeight += blockHeight
  })

  if (currentPage.length > 0) pages.push(currentPage)

  return pages
}

function renderBlock(block: ContentBlock, currency: string) {
  if (block.kind === "investment") {
    return (
      <View style={styles.investmentBox} wrap={false}>
        <Text style={styles.investmentLabel}>Investimento total</Text>
        <Text style={styles.investmentValue}>
          {formatCurrency(block.totalValue, block.currency)}
        </Text>
        <Text style={styles.investmentText}>
          Valor consolidado para todas as entregas previstas nesta proposta, com
          leitura pensada para decisão comercial clara e condução mais
          previsível do projeto.
        </Text>
        <View style={styles.investmentMiniGrid}>
          <View style={styles.investmentMiniCard}>
            <Text style={styles.investmentMiniLabel}>Total de entregas</Text>
            <Text style={styles.investmentMiniValue}>
              {String(block.itemCount).padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.investmentMiniCard}>
            <Text style={styles.investmentMiniLabel}>Ticket medio</Text>
            <Text style={styles.investmentMiniValue}>
              {formatCurrency(
                block.itemCount > 0 ? block.totalValue / block.itemCount : 0,
                block.currency
              )}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  if (block.kind === "bullets") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.lines.map((line, index) => (
          <View key={`${block.title}-${index}`} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>-</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (block.kind === "paragraphs") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.lines.map((line, index) => (
          <Text key={`${block.title}-${index}`} style={styles.paragraph}>
            {line}
          </Text>
        ))}
      </View>
    )
  }

  if (block.kind === "items") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.items.map((item, index) => (
          <View key={`${item.description}-${index}`} style={styles.itemBlock}>
            <Text style={styles.itemTitle}>{item.description}</Text>
            {buildScopeParagraphs(item).map((paragraph, paragraphIndex) => (
              <Text
                key={`${item.description}-${index}-${paragraphIndex}`}
                style={styles.itemText}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>
    )
  }

  if (block.kind === "pricing") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.items.map((item: ProposalItem, index: number) => {
          const subtotal = item.unitValue * item.quantity

          return (
            <View
              key={`${item.description}-${index}`}
              style={styles.pricingRow}
            >
              <View style={styles.pricingLeft}>
                <Text style={styles.itemTitle}>{item.description}</Text>
                {buildDeliverableParagraphs(item).map(
                  (paragraph, paragraphIndex) => (
                    <Text
                      key={`${item.description}-${index}-${paragraphIndex}`}
                      style={styles.itemText}
                    >
                      {paragraph}
                    </Text>
                  )
                )}
              </View>
              <View style={styles.pricingRight}>
                <Text style={styles.priceValue}>
                  {formatCurrency(subtotal, currency)}
                </Text>
                <Text style={styles.priceMeta}>
                  {item.quantity}x {formatCurrency(item.unitValue, currency)}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  return null
}

function InternalPage({
  kicker,
  title,
  leadName,
  summaryLines,
  createdAt,
  validUntil,
  isContinuation,
  blocks,
  currency,
}: {
  kicker: string
  title: string
  leadName?: string
  summaryLines?: string[]
  createdAt?: Date | string
  validUntil?: Date | string | null
  isContinuation: boolean
  blocks: ContentBlock[]
  currency: string
}) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={PAGE_IMAGE} style={styles.sheet} fixed />

      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.header} fixed>
          <View style={styles.studioInfo}>
            <Text style={styles.studioDetails}>
              Padrão de Autoridade Digital
            </Text>
            <Text style={styles.studioDetails}>
              magui.studio | contato@magui.studio
            </Text>
          </View>
        </View>

        <View style={styles.headerLine} />
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={isContinuation ? styles.continuationTitle : styles.title}>
          {isContinuation ? `${title} (continuação)` : title}
        </Text>

        {!isContinuation && leadName ? (
          <Text style={styles.leadLine}>{leadName}</Text>
        ) : null}

        {!isContinuation && summaryLines
          ? summaryLines.map((line, index) => (
              <Text key={`summary-${index}`} style={styles.intro}>
                {line}
              </Text>
            ))
          : null}

        {!isContinuation && createdAt ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Emitido em: {toDateLabel(createdAt)}
            </Text>
            <Text style={styles.metaText}>
              Validade: {toDateLabel(validUntil)}
            </Text>
          </View>
        ) : null}

        {blocks.map((block, index) => (
          <React.Fragment key={`${block.kind}-${index}`}>
            {renderBlock(block, currency)}
          </React.Fragment>
        ))}

        {/* Brand Footer */}
        <View style={styles.footer} fixed>
          <Text></Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
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
  const currency = proposal.currency || "BRL"
  const parsedNotes = parseProposalNotes(proposal.notes)

  const summaryLines =
    parsedNotes.executiveSummary.length > 0
      ? parsedNotes.executiveSummary
      : buildFallbackSummary(proposal)
  const objectives =
    parsedNotes.objectives.length > 0
      ? parsedNotes.objectives
      : buildFallbackObjectives()
  const expectedImpact =
    parsedNotes.expectedImpact.length > 0
      ? parsedNotes.expectedImpact
      : buildFallbackImpact()
  const differentials =
    parsedNotes.differentials.length > 0
      ? parsedNotes.differentials
      : buildFallbackDifferentials()
  const platformFlow =
    parsedNotes.platformFlow.length > 0
      ? parsedNotes.platformFlow
      : buildFallbackPlatformFlow()
  const processLines = buildProcessLines(proposal.items, parsedNotes.timeline)
  const nextSteps = buildNextSteps(proposal.validUntil, parsedNotes.nextSteps)

  const overviewBlocks: ContentBlock[] = [
    ...createTextBlocks("bullets", "Objetivos desta proposta", objectives, 120),
    ...(parsedNotes.paymentTerms.length > 0
      ? createTextBlocks(
          "bullets",
          "Condicoes de pagamento",
          parsedNotes.paymentTerms,
          120
        )
      : []),
    ...createTextBlocks("bullets", "Prazo e ativacao", processLines, 120),
    ...proposal.items.map(
      (item, index) =>
        ({
          kind: "items",
          title:
            index === 0
              ? "Escopo da entrega"
              : "Escopo da entrega (continuação)",
          items: [item],
        }) satisfies ItemSectionBlock
    ),
    ...createTextBlocks("bullets", "Impacto esperado", expectedImpact, 120),
    ...createTextBlocks(
      "bullets",
      "Diferenciais da proposta",
      differentials,
      120
    ),
    ...(parsedNotes.acceptanceCriteria.length > 0
      ? createTextBlocks(
          "bullets",
          "Critérios de aceite",
          parsedNotes.acceptanceCriteria,
          120
        )
      : []),
  ]

  const commercialBlocks: ContentBlock[] = [
    ...createTextBlocks(
      "bullets",
      "Operação pela plataforma",
      platformFlow,
      120
    ),
    ...(parsedNotes.notIncluded.length > 0
      ? createTextBlocks(
          "bullets",
          "O que não está incluso",
          parsedNotes.notIncluded,
          120
        )
      : []),
    ...(parsedNotes.warranty.length > 0
      ? createTextBlocks(
          "bullets",
          "Garantia e ajustes",
          parsedNotes.warranty,
          120
        )
      : []),
    ...(parsedNotes.additionalNotes.length > 0
      ? createTextBlocks(
          "bullets",
          "Observações importantes",
          parsedNotes.additionalNotes,
          120
        )
      : []),
    ...proposal.items.map(
      (item, index) =>
        ({
          kind: "pricing",
          title:
            index === 0
              ? "Investimento por entrega"
              : "Investimento por entrega (continuação)",
          items: [item],
          currency,
        }) satisfies PricingSectionBlock
    ),
    {
      kind: "investment",
      totalValue: proposal.totalValue,
      currency,
      itemCount: proposal.items.length,
    },
    ...createTextBlocks("bullets", "Próximos passos", nextSteps, 120),
  ]

  const overviewPages = paginateBlocks(overviewBlocks, 320, 440)
  const commercialPages = paginateBlocks(commercialBlocks, 300, 430)

  return (
    <Document title={proposal.title || "Proposta Comercial"}>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={FRONT_IMAGE} style={styles.fullBleed} />
      </Page>

      {overviewPages.map((blocks, index) => (
        <InternalPage
          key={`overview-${index}`}
          kicker="Proposta Comercial"
          title={proposal.title || "Proposta Comercial"}
          leadName={lead.companyName}
          summaryLines={summaryLines}
          createdAt={proposal.createdAt}
          validUntil={proposal.validUntil}
          isContinuation={index > 0}
          blocks={blocks}
          currency={currency}
        />
      ))}

      {commercialPages.map((blocks, index) => (
        <InternalPage
          key={`commercial-${index}`}
          kicker="Investimento"
          title="Estrutura comercial e condições da proposta"
          isContinuation={index > 0}
          blocks={blocks}
          currency={currency}
        />
      ))}

      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={BACK_IMAGE} style={styles.fullBleed} />
      </Page>
    </Document>
  )
}
