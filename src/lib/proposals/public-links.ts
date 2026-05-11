export function normalizeInstagramProposalIdentifier(
  instagram: string | null | undefined
) {
  if (!instagram?.trim()) return null

  const cleaned = instagram
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/^\/+|\/+$/g, "")

  return cleaned || null
}

export function buildProposalPublicIdentifier(
  instagram: string | null | undefined,
  proposalId: string
) {
  return normalizeInstagramProposalIdentifier(instagram) ?? proposalId
}

export function buildProposalPublicPath(
  instagram: string | null | undefined,
  proposalId: string
) {
  return `/proposta/${buildProposalPublicIdentifier(instagram, proposalId)}`
}
