import * as React from "react"

import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

interface ClientEmptyStateProps {
  title: string
  description: string
  icon?: React.ComponentType<{
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"
    className?: string
  }>
}

export function ClientEmptyState({
  title,
  description,
  icon: IconComponent = CheckCircle,
}: ClientEmptyStateProps): React.JSX.Element {
  return (
    <div className="rounded-4xl border border-dashed border-border/30 bg-muted/5 px-6 py-14 text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <IconComponent weight="duotone" className="size-7" />
      </div>
      <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-muted-foreground/70">
        {description}
      </p>
    </div>
  )
}
