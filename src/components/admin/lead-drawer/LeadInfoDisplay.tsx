"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { LeadSource } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import {
  ChatCircleText,
  Copy,
  CurrencyDollar,
  Globe,
  ListChecks,
  WhatsappLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { sanitizePhoneForWhatsApp } from "@/src/lib/utils/crm"

interface LeadInfoDisplayProps {
  lead: Lead
}

export function LeadInfoDisplay({ lead }: LeadInfoDisplayProps) {
  const t = useTranslations("Admin.crm")

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const phone = sanitizePhoneForWhatsApp(lead.phone)
  const whatsappUrl = phone ? `https://wa.me/${phone}` : null
  const missingCriticalInfo = [
    !lead.source || lead.source === LeadSource.OTHER ? "Origem definida" : null,
    !lead.value?.trim() ? "Valor estimado" : null,
    !lead.nextActionAt ? "Proximo passo" : null,
    !lead.assignedToId ? "Responsavel" : null,
  ].filter(Boolean) as string[]
  const completedSignals = [
    lead.contactName ? "Contato principal" : null,
    lead.email ? "E-mail principal" : null,
    lead.phone ? "WhatsApp" : null,
    lead.value ? "Valor estimado" : null,
  ].filter(Boolean) as string[]

  return (
    <div className="grid gap-8">
      <section className="rounded-4xl border border-border/40 bg-muted/5 p-6">
        <div className="flex items-center gap-3">
          <ListChecks
            size={18}
            weight="duotone"
            className="text-brand-primary"
          />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
            Prontidao do lead
          </h4>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <Label label="Sinais preenchidos" />
            <div className="flex flex-wrap gap-2">
              {completedSignals.length > 0 ? (
                completedSignals.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm font-medium text-muted-foreground/70">
                  Ainda faltam bases minimas para uma leitura comercial forte.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label label="Faltando info critica" />
            <div className="flex flex-wrap gap-2">
              {missingCriticalInfo.length > 0 ? (
                missingCriticalInfo.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Sem lacunas criticas
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Intelligence */}
        <section className="space-y-4 rounded-4xl border border-border/40 bg-muted/5 p-6">
          <div className="flex items-center gap-3">
            <ChatCircleText
              size={18}
              weight="duotone"
              className="text-brand-primary"
            />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Inteligência de Contato
            </h4>
          </div>

          <div className="space-y-5">
            <div className="group space-y-1">
              <Label label="Responsável" />
              <p className="text-sm font-bold text-foreground/90">
                {lead.contactName || "Time Comercial"}
              </p>
            </div>

            {lead.email && (
              <div className="group space-y-1">
                <Label label="E-mail Corporativo" />
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-bold text-foreground/90">
                    {lead.email}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => copyToClipboard(lead.email!, "E-mail")}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="group space-y-1">
                <Label label="Telefone / WhatsApp" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground/90">
                    {lead.phone}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full"
                      onClick={() => copyToClipboard(lead.phone!, "Telefone")}
                    >
                      <Copy size={14} />
                    </Button>
                    {whatsappUrl && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-full text-green-600 hover:bg-green-500/10"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                          <WhatsappLogo size={16} weight="fill" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {lead.value && (
              <div className="group space-y-1">
                <Label label="Faixa de investimento" />
                <div className="flex items-center gap-2">
                  <CurrencyDollar size={16} className="text-brand-primary/60" />
                  <p className="text-sm font-bold text-foreground/90">
                    {lead.value}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Source & Presence */}
        <section className="space-y-4 rounded-4xl border border-border/40 bg-muted/5 p-6">
          <div className="flex items-center gap-3">
            <Globe size={18} weight="duotone" className="text-brand-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Origem e Presença
            </h4>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <Label label="Canal de Aquisição" />
              <p className="text-sm font-bold text-foreground/90">
                {t(`source.${lead.source}`)}
              </p>
            </div>

            {lead.instagram && (
              <div className="space-y-1">
                <Label label="Instagram" />
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground/90">
                    @{lead.instagram.replace("@", "")}
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-brand-primary/60"
                  >
                    <a
                      href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowSquareOut size={14} />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {lead.website && (
              <div className="space-y-1">
                <Label
                  label={
                    lead.source === LeadSource.LINKEDIN
                      ? "LinkedIn"
                      : "Website Oficial"
                  }
                />
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-foreground/90">
                    {lead.website.replace(/^https?:\/\//, "")}
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-brand-primary/60"
                  >
                    <a href={lead.website} target="_blank" rel="noreferrer">
                      <ArrowSquareOut size={14} />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Label({ label }: { label: string }) {
  return (
    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
      {label}
    </span>
  )
}

function ArrowSquareOut({
  size,
  className,
}: {
  size: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
      className={className}
    >
      <path d="M224,104a8,8,0,0,1-16,0V59.31l-66.34,66.35a8,8,0,0,1-11.32-11.32L196.69,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V48h72a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V136A8,8,0,0,0,184,128Z"></path>
    </svg>
  )
}
