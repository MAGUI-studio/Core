"use client"

import { Buildings, EnvelopeSimple, Globe, InstagramLogo, Phone, User } from "@phosphor-icons/react"

import { Lead } from "@/src/types/crm"

type LeadInfoDisplayProps = {
  lead: Lead
  client?: {
    id: string
    name: string | null
    email: string
    companyName: string | null
    phone: string | null
    position: string | null
  } | null
}

type InfoItemProps = {
  icon: React.ElementType
  label: string
  value: string
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-[1.5rem] border border-border/15 bg-background px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/8 text-brand-primary">
          <Icon size={16} weight="bold" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/45">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-foreground/80">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function LeadInfoDisplay({
  lead,
  client,
}: LeadInfoDisplayProps): React.JSX.Element {
  const displayClientName = client?.name || lead.contactName || "Nao informado"
  const displayCompanyName = client?.companyName || lead.companyName || "Nao informado"
  const displayEmail = client?.email || lead.email || "Nao informado"
  const displayPhone = client?.phone || lead.phone || "Nao informado"
  const displayRole = client?.position || "Contato principal"
  const clientOriginLabel = client
    ? lead.convertedProjectId
      ? "Cliente vinculado ao projeto"
      : "Cliente encontrado na base"
    : "Contato principal do lead"

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-border/15 bg-muted/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
            Cliente e contato
          </p>
          <p className="text-sm text-muted-foreground/65">
            {clientOriginLabel}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoItem icon={User} label="Nome" value={displayClientName} />
          <InfoItem icon={Buildings} label="Empresa" value={displayCompanyName} />
          <InfoItem icon={EnvelopeSimple} label="E-mail" value={displayEmail} />
          <InfoItem icon={Phone} label="Telefone" value={displayPhone} />
          <InfoItem icon={User} label="Papel" value={displayRole} />
          <InfoItem
            icon={InstagramLogo}
            label="Instagram"
            value={lead.instagram || "Nao informado"}
          />
        </div>

        {lead.website ? (
          <div className="mt-4 grid gap-3">
            {lead.website ? (
              <InfoItem icon={Globe} label="Website" value={lead.website} />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
