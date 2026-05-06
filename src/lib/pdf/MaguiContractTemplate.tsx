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
})

interface ContractClause {
  title: string
  content: string
}

interface ContractDocumentData {
  title: string
  clauses: ContractClause[]
}

type Block =
  | { type: "section"; text: string }
  | { type: "clause"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "spacer" }

function isNumberedLine(line: string) {
  return /^\d+\.\d+\./.test(line)
}

function isClauseTitle(line: string) {
  return line.startsWith("CLÁUSULA ")
}

function isSectionTitle(line: string) {
  return line === "I. DAS PARTES"
}

function isStandaloneLine(line: string) {
  return (
    isSectionTitle(line) ||
    isClauseTitle(line) ||
    isNumberedLine(line) ||
    line.startsWith("CONTRATADA:") ||
    line.startsWith("CONTRATANTE:")
  )
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
      blocks.push({ type: "paragraph", text: line })
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

function renderHighlightedTokens(text: string) {
  const withMarkers = text
    .replaceAll("CONTRATADA", "__BOLD__CONTRATADA__END__")
    .replaceAll("CONTRATANTE", "__BOLD__CONTRATANTE__END__")

  return withMarkers
    .split(/(__BOLD__.*?__END__)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("__BOLD__") ? (
        <Text key={index} style={{ fontFamily: "Helvetica-Bold" }}>
          {part.replace("__BOLD__", "").replace("__END__", "")}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    )
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

  return renderParagraphText(block.text, key)
}

export function MaguiContractTemplate({
  document,
}: {
  document: ContractDocumentData
}) {
  const exactText = document.clauses[0]?.content || ""
  const blocks = buildBlocks(exactText)
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
