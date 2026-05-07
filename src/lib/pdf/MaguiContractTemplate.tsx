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
const CONTENT_BOTTOM = 80
const CONTENT_LEFT = 50

function imageToDataUri(dir: string, fileName: string) {
  const filePath = path.join(process.cwd(), "public", dir, fileName)
  const file = fs.readFileSync(filePath)
  const extension = path.extname(fileName).slice(1)
  const mimeType = extension === "svg" ? "image/svg+xml" : `image/${extension}`
  return `data:${mimeType};base64,${file.toString("base64")}`
}

const PAGE_IMAGE = imageToDataUri("images", "proposal_page.png")

const styles = StyleSheet.create({
  page: {
    position: "relative",
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fontFamily: "Helvetica",
    color: "#000000",
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
    marginBottom: 20,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 6,
    color: "#000000",
    textAlign: "justify",
  },
  clauseTitle: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginTop: 18,
    marginBottom: 8,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginTop: 4,
    marginBottom: 8,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
  },
  spacer: {
    height: 10,
  },
  signatureBlock: {
    marginTop: 22,
  },
  signatureDate: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 42,
    textAlign: "center",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 28,
  },
  signatureItem: {
    width: "46%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginBottom: 10,
  },
  signatureRole: {
    fontSize: 10,
    lineHeight: 1.3,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  signatureName: {
    fontSize: 10,
    lineHeight: 1.3,
    textAlign: "center",
  },
})

interface ContractClause {
  title: string
  content: string
}

interface ContractDocumentData {
  title: string
  clauses: ContractClause[]
  contractingData?: unknown
  commercialData?: unknown
}

type Block =
  | { type: "section"; text: string }
  | { type: "clause"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "spacer" }
  | { type: "signature"; signerName: string; contractDateLabel: string }

function isNumberedLine(line: string) {
  return /^\d+\.\d+\./.test(line)
}

function isClauseTitle(line: string) {
  return line.startsWith("CLÁUSULA ")
}

function isSectionTitle(line: string) {
  return line === "I. DAS PARTES"
}

function normalizeParagraphLines(lines: string[]) {
  return lines.join(" ").replace(/\s+/g, " ").trim()
}

function buildBlocks(text: string): Block[] {
  const lines = text.split("\n")
  const blocks: Block[] = []
  let paragraphBuffer: string[] = []

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    blocks.push({
      type: "paragraph",
      text: normalizeParagraphLines(paragraphBuffer),
    })
    paragraphBuffer = []
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      blocks.push({ type: "spacer" })
      return
    }

    if (isSectionTitle(line)) {
      flushParagraph()
      blocks.push({ type: "section", text: line })
      return
    }

    if (isClauseTitle(line)) {
      flushParagraph()
      blocks.push({ type: "clause", text: line })
      return
    }

    if (
      isNumberedLine(line) ||
      line.startsWith("CONTRATADA:") ||
      line.startsWith("CONTRATANTE:")
    ) {
      flushParagraph()
      paragraphBuffer = [line]
      return
    }

    paragraphBuffer.push(line)
  })

  flushParagraph()

  return blocks.filter((block, index, array) => {
    if (block.type !== "spacer") return true
    const prev = array[index - 1]
    const next = array[index + 1]
    return Boolean(prev) && Boolean(next) && prev.type !== "spacer" && next.type !== "spacer"
  })
}

function estimateBlockHeight(block: Block) {
  if (block.type === "spacer") return 10
  if (block.type === "section") return 22
  if (block.type === "clause") return 34
  if (block.type === "signature") return 145
  return Math.max(18, Math.ceil(block.text.length / 108) * 15)
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
  const usableHeight = PAGE_HEIGHT - CONTENT_TOP - CONTENT_BOTTOM - 26
  const firstPageUsableHeight = usableHeight - 42

  blocks.forEach((block, index) => {
    const blockHeight = estimateBlockHeight(block)
    const currentLimit = pages.length === 0 ? firstPageUsableHeight : usableHeight

    const nextBlock = blocks[index + 1]
    const keepWithNext =
      (block.type === "clause" || block.type === "section") &&
      nextBlock &&
      nextBlock.type === "paragraph"
        ? estimateBlockHeight(nextBlock)
        : 0

    if (
      current.length > 0 &&
      height + blockHeight + keepWithNext > currentLimit
    ) {
      const cleaned = cleanPageBlocks(current)
      if (cleaned.length > 0) pages.push(cleaned)
      current = []
      height = 0
    }

    if (current.length === 0 && block.type === "spacer") {
      return
    }

    current.push(block)
    height += blockHeight
  })

  const cleaned = cleanPageBlocks(current)
  if (cleaned.length > 0) pages.push(cleaned)
  return pages
}

function formatContractDate(value?: string | null) {
  if (!value) {
    const now = new Date()
    const formattedNow = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now)

    return `São José dos Campos/SP, ${formattedNow}.`
  }

  const date = new Date(value)
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)

  return `São José dos Campos/SP, ${formatted}.`
}

function renderHighlightedTokens(text: string) {
  const normalizedText = text.replace(
    /https:\/\/\s+([^\s),]+)/g,
    "https://$1"
  )
  const tokenPattern =
    /https?:\/\/[^\s),]+|2 \(dois\) dias úteis|1 \(um\) dia de atraso|\d+(?:\s*a\s*\d+)? dias úteis|01 \(um\)|12 meses|CONTRATADA ?|CONTRATANTE ?/gi

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  for (const match of normalizedText.matchAll(tokenPattern)) {
    const matchText = match[0]
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      parts.push(normalizedText.slice(lastIndex, matchIndex))
    }

    if (/^https?:\/\//i.test(matchText)) {
      parts.push(
        <Link
          key={`link-${matchIndex}`}
          src={matchText}
          style={{ color: "#000000", textDecoration: "none" }}
        >
          {matchText}
        </Link>
      )
    } else {
      const boldText = matchText.endsWith(" ")
        ? `${matchText.slice(0, -1)}\u00A0`
        : matchText

      parts.push(
        <Text
          key={`bold-${matchIndex}`}
          style={{ fontFamily: "Helvetica-Bold" }}
        >
          {boldText}
        </Text>
      )
    }

    lastIndex = matchIndex + matchText.length
  }

  if (lastIndex < normalizedText.length) {
    parts.push(normalizedText.slice(lastIndex))
  }

  return parts
}

function renderParagraphText(text: string, key: string) {
  const numberedLine = text.match(/^(\d+\.\d+\.)(\s*)(.*)$/)
  if (numberedLine) {
    const [, prefix, spacing, rest] = numberedLine
    return (
      <Text key={key} style={styles.paragraph}>
        <Text style={{ fontFamily: "Helvetica-Bold" }}>{prefix}</Text>
        {spacing}
        {renderHighlightedTokens(rest)}
      </Text>
    )
  }

  return (
    <Text key={key} style={styles.paragraph}>
      {renderHighlightedTokens(text)}
    </Text>
  )
}

function renderSignatureBlock(
  signerName: string,
  contractDateLabel: string,
  key: string
) {
  return (
    <View key={key} style={styles.signatureBlock}>
      <Text style={styles.signatureDate}>{contractDateLabel}</Text>
      <View style={styles.signatureRow}>
        <View style={styles.signatureItem}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureRole}>MAGUI.studio</Text>
          <Text style={styles.signatureName}>GUILHERME BUSTAMANTE</Text>
        </View>
        <View style={styles.signatureItem}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureRole}>CONTRATANTE</Text>
          <Text style={styles.signatureName}>{signerName}</Text>
        </View>
      </View>
    </View>
  )
}

function renderBlock(block: Block, key: string) {
  if (block.type === "spacer") {
    return <View key={key} style={styles.spacer} />
  }

  if (block.type === "section") {
    return (
      <Text key={key} style={styles.sectionTitle}>
        {block.text}
      </Text>
    )
  }

  if (block.type === "clause") {
    return (
      <Text key={key} style={styles.clauseTitle}>
        {block.text}
      </Text>
    )
  }

  if (block.type === "signature") {
    return renderSignatureBlock(block.signerName, block.contractDateLabel, key)
  }

  return renderParagraphText(block.text, key)
}

function getSignatureBlock(document: ContractDocumentData): Block {
  const contractingData =
    document.contractingData && typeof document.contractingData === "object"
      ? (document.contractingData as Record<string, unknown>)
      : {}

  const commercialData =
    document.commercialData && typeof document.commercialData === "object"
      ? (document.commercialData as Record<string, unknown>)
      : {}

  const signerName =
    typeof contractingData.legalName === "string" &&
    contractingData.legalName.trim().length > 0
      ? contractingData.legalName
      : typeof contractingData.signerName === "string" &&
          contractingData.signerName.trim().length > 0
        ? contractingData.signerName
      : "[Nome do Responsável]"

  const contractDateLabel = formatContractDate(
    typeof commercialData.contractDate === "string"
      ? commercialData.contractDate
      : null
  )

  return {
    type: "signature",
    signerName,
    contractDateLabel,
  }
}

export function MaguiContractTemplate({
  document,
}: {
  document: ContractDocumentData
}) {
  const exactText = document.clauses[0]?.content || ""
  const signatureBlock = getSignatureBlock(document)
  const blocks = [...buildBlocks(exactText), signatureBlock]
  const pages = paginateBlocks(blocks)

  return (
    <Document title={document.title}>
      {pages.map((pageBlocks, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Image src={PAGE_IMAGE} style={styles.sheet} fixed />
          <View style={styles.content}>
            {pageIndex === 0 ? (
              <Text style={styles.title}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
            ) : null}
            {pageBlocks.map((block, index) =>
              renderBlock(block, `${pageIndex}-${index}`)
            )}
          </View>
        </Page>
      ))}
    </Document>
  )
}
