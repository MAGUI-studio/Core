"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Lead } from "@/src/types/crm"
import { CircleNotch } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

type LeadSourceValue =
  | "REFERRAL"
  | "ORGANIC"
  | "INSTAGRAM"
  | "LINKEDIN"
  | "WEBSITE"
  | "OTHER"

interface LeadEditFormProps {
  lead: Lead
  onSave: (data: Partial<Lead>) => Promise<boolean>
  isSaving: boolean
}

export function LeadEditForm({ lead, onSave, isSaving }: LeadEditFormProps) {
  const t = useTranslations("Admin.crm")
  const [form, setForm] = React.useState({
    companyName: lead.companyName,
    contactName: lead.contactName ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    website: lead.website ?? "",
    instagram: lead.instagram ?? "",
    notes: lead.notes ?? "",
    value: lead.value ?? "",
    source: lead.source as LeadSourceValue,
  })

  const showInstagramField = form.source === "INSTAGRAM"
  const showWebsiteField =
    form.source === "WEBSITE" || form.source === "LINKEDIN"

  return (
    <section className="grid gap-5 border-b border-border/15 pb-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            Empresa
          </Label>
          <Input
            value={form.companyName}
            onChange={(e) =>
              setForm((f) => ({ ...f, companyName: e.target.value }))
            }
            className="h-12 rounded-[1rem]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            Contato
          </Label>
          <Input
            value={form.contactName}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactName: e.target.value }))
            }
            className="h-12 rounded-[1rem]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            Telefone
          </Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="h-12 rounded-[1rem]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            E-mail
          </Label>
          <Input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="h-12 rounded-[1rem]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            Origem
          </Label>
          <Select
            value={form.source}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, source: v as LeadSourceValue }))
            }
          >
            <SelectTrigger size="lg" className="w-full rounded-[1rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "REFERRAL",
                "ORGANIC",
                "INSTAGRAM",
                "LINKEDIN",
                "WEBSITE",
                "OTHER",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`source.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
            Valor estimado
          </Label>
          <Input
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="Ex: R$ 12.000"
            className="h-12 rounded-[1rem]"
          />
        </div>
        {showInstagramField && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
              Link do Instagram
            </Label>
            <Input
              value={form.instagram}
              onChange={(e) =>
                setForm((f) => ({ ...f, instagram: e.target.value }))
              }
              placeholder="https://instagram.com/usuario"
              className="h-12 rounded-[1rem]"
            />
          </div>
        )}
        {showWebsiteField && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
              {form.source === "LINKEDIN" ? "Link do LinkedIn" : "Site"}
            </Label>
            <Input
              value={form.website}
              onChange={(e) =>
                setForm((f) => ({ ...f, website: e.target.value }))
              }
              placeholder="https://"
              className="h-12 rounded-[1rem]"
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/55">
          Observacoes iniciais
        </Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Registre contexto, decisor, valor, proximo passo e alertas da negociacao."
          className="min-h-28 rounded-[1.25rem]"
        />
      </div>
      <Button
        type="button"
        onClick={() => onSave(form)}
        disabled={isSaving || form.companyName.trim().length < 2}
        className="h-12 w-full rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
      >
        {isSaving && <CircleNotch className="mr-2 size-4 animate-spin" />}
        Salvar alteracoes
      </Button>
    </section>
  )
}
