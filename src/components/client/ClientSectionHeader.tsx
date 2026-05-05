import * as React from "react"

interface ClientSectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function ClientSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: ClientSectionHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm font-medium leading-relaxed text-muted-foreground/70 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
