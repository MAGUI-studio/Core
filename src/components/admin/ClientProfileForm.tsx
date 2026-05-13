"use client"

import * as React from "react"

import {
  Buildings,
  EnvelopeSimple,
  IdentificationCard,
  Phone,
  Tag,
  User,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { updateClientProfileAction } from "@/src/lib/actions/user.actions"

type ClientProfileFormProps = {
  clerkUserId: string
  firstName: string
  lastName: string
  username: string
  email: string
  companyName: string
  phone: string
  position: string
  taxId: string
}

export function ClientProfileForm({
  clerkUserId,
  firstName,
  lastName,
  username,
  email,
  companyName,
  phone,
  position,
  taxId,
}: ClientProfileFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await updateClientProfileAction(formData)
      return {
        success: Boolean(result.success),
        error: result.error ?? null,
      }
    },
    { success: false, error: null as string | null }
  )

  React.useEffect(() => {
    if (state.success) {
      toast.success("Dados do cliente atualizados.")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={formAction} className="grid gap-7">
      <input type="hidden" name="clerkUserId" value={clerkUserId} />

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <IdentificationCard
            className="size-4 text-brand-primary"
            weight="duotone"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
            Cadastro do cliente
          </p>
        </div>
        <h2 className="text-lg font-black tracking-tight text-foreground">
          Editar informacoes
        </h2>
        <p className="text-sm text-muted-foreground/75">
          Atualize nome, e-mail, username e dados de contato sem sair desta
          tela.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="grid gap-2.5">
          <Label
            htmlFor="client-first-name"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            Nome <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              id="client-first-name"
              name="firstName"
              defaultValue={firstName}
              required
              disabled={isPending}
              className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-last-name"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            Sobrenome
          </Label>
          <Input
            id="client-last-name"
            name="lastName"
            defaultValue={lastName}
            disabled={isPending}
            className="h-12 rounded-2xl border-border/35 bg-muted/10 font-semibold"
          />
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-username"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client-username"
            name="username"
            defaultValue={username}
            required
            disabled={isPending}
            className="h-12 rounded-2xl border-border/35 bg-muted/10 font-semibold"
          />
        </div>

        <div className="grid gap-2.5 md:col-span-2 xl:col-span-1">
          <Label
            htmlFor="client-email"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            E-mail <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <EnvelopeSimple className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              id="client-email"
              name="email"
              type="email"
              defaultValue={email}
              required
              disabled={isPending}
              className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-company"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            Empresa / Marca
          </Label>
          <div className="relative">
            <Buildings className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              id="client-company"
              name="companyName"
              defaultValue={companyName}
              disabled={isPending}
              className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-phone"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            WhatsApp / Contato
          </Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              id="client-phone"
              name="phone"
              defaultValue={phone}
              disabled={isPending}
              className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 font-semibold"
            />
          </div>
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-position"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            Cargo / Funcao
          </Label>
          <Input
            id="client-position"
            name="position"
            defaultValue={position}
            disabled={isPending}
            className="h-12 rounded-2xl border-border/35 bg-muted/10 font-semibold"
          />
        </div>

        <div className="grid gap-2.5">
          <Label
            htmlFor="client-tax-id"
            className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
          >
            CPF / CNPJ
          </Label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              id="client-tax-id"
              name="taxId"
              defaultValue={taxId}
              disabled={isPending}
              className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-full bg-brand-primary px-6 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-none hover:bg-brand-primary/90"
        >
          {isPending ? "Salvando..." : "Salvar alteracoes"}
        </Button>
      </div>
    </form>
  )
}
