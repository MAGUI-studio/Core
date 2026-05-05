"use client"

import * as React from "react"

import { Image, Lightning, ShieldCheck, Tag } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { Textarea } from "@/src/components/ui/textarea"

import {
  formatCurrencyBRL,
  formatCurrencyBRLFromCents,
} from "@/src/lib/utils/utils"

interface ServiceCategoryFormProps {
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  initialValues?: {
    id?: string
    name: string
    description: string
    approach: string
    suggestedValue: number
    imageUrl: string
    isSubscription: boolean
  }
}

export function ServiceCategoryForm({
  action,
  submitLabel,
  initialValues,
}: ServiceCategoryFormProps): React.JSX.Element {
  const [suggestedValue, setSuggestedValue] = React.useState(
    formatCurrencyBRLFromCents(initialValues?.suggestedValue ?? 0)
  )

  return (
    <form action={action} className="flex w-full flex-col gap-12 text-left">
      {initialValues?.id ? (
        <input type="hidden" name="id" value={initialValues.id} />
      ) : null}

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
        Os campos marcados com <span className="text-red-500">*</span> sao
        obrigatorios.
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Tag weight="bold" className="size-5 text-brand-primary" />
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
              Identidade da categoria
            </h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Nome, descricao e promessa comercial do servico.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3 sm:col-span-2">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Titulo <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Tag
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                name="name"
                required
                defaultValue={initialValues?.name ?? ""}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:col-span-2">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Descricao
            </Label>
            <Textarea
              name="description"
              defaultValue={initialValues?.description ?? ""}
              className="min-h-32 rounded-2xl border-border/40 bg-muted/10 px-4 py-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
            />
          </div>

          <div className="flex flex-col gap-3 sm:col-span-2">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Abordagem <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Lightning
                weight="bold"
                className="absolute left-4 top-5 size-4 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Textarea
                name="approach"
                required
                defaultValue={initialValues?.approach ?? ""}
                className="min-h-32 rounded-2xl border-border/40 bg-muted/10 py-4 pr-4 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/20" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image weight="bold" className="size-5 text-brand-primary" />
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
              Oferta e exibicao
            </h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Valor sugerido, imagem e tipo de cobranca.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Valor sugerido <span className="text-red-500">*</span>
            </Label>
            <Input
              name="suggestedValue"
              required
              inputMode="decimal"
              value={suggestedValue}
              onChange={(event) =>
                setSuggestedValue(formatCurrencyBRL(event.target.value))
              }
              className="h-14 rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Foto (URL)
            </Label>
            <div className="relative group">
              <Image
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                name="imageUrl"
                type="url"
                defaultValue={initialValues?.imageUrl ?? ""}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-muted/5 px-1">
          <input
            name="isSubscription"
            type="checkbox"
            defaultChecked={initialValues?.isSubscription ?? false}
            className="size-4 rounded border border-border/40 accent-primary"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
            Categoria recorrente / assinatura
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-4">
          <ShieldCheck weight="bold" className="size-5 text-brand-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
            Revise texto, valor e imagem antes de salvar.
          </p>
        </div>

        <Button
          type="submit"
          className="group relative h-16 w-full overflow-hidden rounded-full font-sans font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-95 sm:w-max sm:px-12"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
