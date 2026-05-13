"use client"

import * as React from "react"

import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/src/generated/client"

import { Badge } from "@/src/components/ui/badge"

import {
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_PRIORITY_STYLES,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_STYLES,
} from "@/src/lib/utils/support"

export function SupportStatusBadge({
  status,
}: {
  status: SupportTicketStatus
}): React.JSX.Element {
  const style = SUPPORT_STATUS_STYLES[status]

  return (
    <Badge
      variant="outline"
      className={`text-[8px] font-black uppercase ${style}`}
    >
      {SUPPORT_STATUS_LABELS[status]}
    </Badge>
  )
}

export function SupportPriorityBadge({
  priority,
}: {
  priority: SupportTicketPriority
}): React.JSX.Element {
  const style = SUPPORT_PRIORITY_STYLES[priority]

  return (
    <Badge
      variant="outline"
      className={`text-[8px] font-black uppercase ${style}`}
    >
      {SUPPORT_PRIORITY_LABELS[priority]}
    </Badge>
  )
}
