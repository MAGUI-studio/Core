"use client"

import * as React from "react"

import { Lead, MessageTemplate } from "@/src/types/crm"
import {
  CaretDown,
  DeviceMobile,
  Plus,
  WhatsappLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import { saveMessageTemplateAction } from "@/src/lib/actions/crm.actions"
import { sanitizePhoneForWhatsApp } from "@/src/lib/utils/crm"

interface LeadQuickActionsProps {
  lead: Lead
  templates: MessageTemplate[]
}

export function LeadQuickActions({ lead, templates }: LeadQuickActionsProps) {
  const [open, setOpen] = React.useState(false)
  const [customMessage, setCustomMessage] = React.useState("")
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false)

  const personalize = (content: string) => {
    return content
      .replace(/{contact}/g, lead.contactName || "time")
      .replace(/{company}/g, lead.companyName)
  }

  const handleSaveAsTemplate = async () => {
    if (!customMessage) return
    setIsSavingTemplate(true)
    const result = await saveMessageTemplateAction({
      name: `Template ${new Date().toLocaleDateString()}`,
      content: customMessage
        .replace(lead.companyName, "{company}")
        .replace(lead.contactName || "time", "{contact}"),
      scope: "LEAD",
    })
    if (result.success) toast.success("Template salvo.")
    setIsSavingTemplate(false)
  }

  const phone = sanitizePhoneForWhatsApp(lead.phone)
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`
    : null

  return (
    <section className="grid gap-6 border-b border-border/15 pb-8">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
              Mensagens e Templates
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Acelere o contato com o cliente.
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
            >
              {open ? "Ocultar" : "Mostrar"}
              <CaretDown
                className={`ml-2 size-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-6 pt-6">
          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Templates Disponiveis
            </Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <Button
                  key={tpl.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => setCustomMessage(personalize(tpl.content))}
                  className="rounded-full border border-border/40 bg-muted/20 text-[9px] font-black uppercase tracking-widest"
                >
                  {tpl.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Mensagem Personalizada
              </Label>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSavingTemplate || !customMessage}
                onClick={handleSaveAsTemplate}
                className="h-7 rounded-full text-[8px] font-black uppercase tracking-widest"
              >
                <Plus className="mr-1 size-3" /> Salvar como Template
              </Button>
            </div>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Selecione um template..."
              className="min-h-[120px] rounded-2xl border-border/40 bg-background/50 text-sm"
            />
            <Button
              asChild
              disabled={!whatsappUrl || !customMessage}
              className="h-12 w-full rounded-full bg-green-600 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 hover:bg-green-700"
            >
              {whatsappUrl && customMessage ? (
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <WhatsappLogo size={18} weight="fill" className="mr-2" />{" "}
                  Enviar via WhatsApp
                </a>
              ) : (
                <span>
                  <DeviceMobile size={18} className="mr-2" /> Configure um
                  telefone
                </span>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
