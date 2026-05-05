import * as React from "react"

import { getTranslations } from "next-intl/server"

interface GreetingsProps {
  name: string | null | undefined
  compact?: boolean
}

export async function Greetings({
  name,
  compact = false,
}: GreetingsProps): Promise<React.JSX.Element> {
  const t = await getTranslations("Dashboard.greetings")
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  )

  let key = "morning"
  if (hour >= 12 && hour < 18) key = "afternoon"
  if (hour >= 18 || hour < 5) key = "evening"

  if (compact) {
    return (
      <span className="text-muted-foreground/60">
        {t(key, { name: name || "User" })}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
        {t(key, { name: name || "User" })}
      </h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 leading-relaxed">
        {t("track_evolution")}
      </p>
    </div>
  )
}
