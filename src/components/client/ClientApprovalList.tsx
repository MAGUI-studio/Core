import * as React from "react"

import { getTranslations } from "next-intl/server"

import { ApprovalStatus } from "@/src/generated/client"
import { ClientPortalUpdate } from "@/src/types/client-portal"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

import { ClientApprovalCard } from "./ClientApprovalCard"
import { ClientEmptyState } from "./ClientEmptyState"

interface ClientApprovalListProps {
  updates: ClientPortalUpdate[]
  projectId: string
}

export async function ClientApprovalList({
  updates,
  projectId,
}: ClientApprovalListProps) {
  const pendingUpdates = updates.filter(
    (u) => u.requiresApproval && u.approvalStatus === ApprovalStatus.PENDING
  )

  const t = await getTranslations(
    "Dashboard.project_detail.empty_states.approvals"
  )

  if (pendingUpdates.length === 0) {
    return (
      <ClientEmptyState
        title={t("title")}
        description={t("description")}
        icon={CheckCircle}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {pendingUpdates.map((update) => (
        <ClientApprovalCard
          key={update.id}
          update={update}
          projectId={projectId}
        />
      ))}
    </div>
  )
}
