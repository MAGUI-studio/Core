import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadStatus } from "@/src/generated/client"

import { Badge } from "@/src/components/ui/badge"

import { LEAD_STATUS_STYLES } from "@/src/lib/utils/crm"

export function LeadStatusBadge({
  status,
  className = "",
}: {
  status: LeadStatus
  className?: string
}): React.JSX.Element {
  const t = useTranslations("Admin.crm")

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${LEAD_STATUS_STYLES[status].badge} ${className}`}
    >
      {t(`status.${status}`)}
    </Badge>
  )
}
