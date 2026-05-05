import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { ArrowRight, LockKey } from "@phosphor-icons/react/dist/ssr"

import type { AppHref } from "@/src/lib/utils/navigation"

interface ClientFeatureLinkProps {
  title: string
  description: string
  href: AppHref
  icon: React.ComponentType<{
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"
    className?: string
  }>
  meta?: string
  isLocked?: boolean
}

export function ClientFeatureLink({
  title,
  description,
  href,
  icon: IconComponent,
  meta,
  isLocked,
}: ClientFeatureLinkProps): React.JSX.Element {
  if (isLocked) {
    return (
      <div className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border/25 bg-muted/5 p-5 opacity-60 grayscale transition sm:min-h-44 sm:p-6 cursor-not-allowed">
        <div className="flex items-start justify-between gap-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground">
            <LockKey weight="duotone" className="size-6" />
          </div>
        </div>
        <div className="space-y-2 mt-5">
          <h3 className="font-heading text-2xl font-black uppercase leading-none tracking-tight">
            {title}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground/70">
            Aguardando pagamento inicial para liberação.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border/25 bg-muted/5 p-5 transition hover:-translate-y-0.5 hover:border-brand-primary/25 hover:bg-background hover:shadow-xl hover:shadow-foreground/5 sm:min-h-44 sm:p-6"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <IconComponent weight="duotone" className="size-6" />
        </div>
        <ArrowRight
          weight="bold"
          className="size-4 text-muted-foreground/35 transition group-hover:translate-x-1 group-hover:text-brand-primary"
        />
      </div>
      <div className="space-y-2 mt-5">
        {meta && (
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
            {meta}
          </p>
        )}
        <h3 className="font-heading text-2xl font-black uppercase leading-none tracking-tight">
          {title}
        </h3>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground/70">
          {description}
        </p>
      </div>
    </Link>
  )
}
