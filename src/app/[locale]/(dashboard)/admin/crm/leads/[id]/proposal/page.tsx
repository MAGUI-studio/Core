import { redirect } from "next/navigation"

interface LegacyLeadProposalPageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyLeadProposalPage({
  params,
}: LegacyLeadProposalPageProps) {
  const { id } = await params
  redirect(`/admin/crm/proposals/new?leadId=${id}`)
}
