import * as React from "react"

import { getTranslations } from "next-intl/server"

import { Greetings } from "@/src/components/common/Greetings"

interface ClientHeroStatusProps {
  userName: string
  status:
    | "payment_pending"
    | "on_track"
    | "awaiting_approval"
    | "need_shipment"
    | "briefing_incomplete"
}

export async function ClientHeroStatus({
  userName,
  status,
}: ClientHeroStatusProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.client_home")

  const statusMap = {
    payment_pending: {
      label: t("status.payment_pending"),
      color: "bg-yellow-500",
    },
    on_track: {
      label: t("status.on_track"),
      color: "bg-emerald-500",
    },
    awaiting_approval: {
      label: t("status.awaiting_approval"),
      color: "bg-brand-primary",
    },
    need_shipment: {
      label: t("status.need_shipment"),
      color: "bg-amber-500",
    },
    briefing_incomplete: {
      label: t("status.briefing_incomplete"),
      color: "bg-brand-primary",
    },
  }

  const currentStatus = statusMap[status]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <div
          className={`size-1.5 animate-pulse rounded-full ${currentStatus.color}`}
        />
        <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          <Greetings name={userName} compact />
          <span className="opacity-30">•</span>
          {currentStatus.label}
        </p>
      </div>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
        {t("welcome_back")}
      </h1>
    </div>
  )
}
