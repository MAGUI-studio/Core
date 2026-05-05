"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowRight,
  Buildings,
  EnvelopeSimple,
  Fingerprint,
  IdentificationCard,
  LockKey,
  Phone,
  ShieldCheck,
  Tag,
  User,
  UserCircleGear,
} from "@phosphor-icons/react"

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
import { Separator } from "@/src/components/ui/separator"

import { createClientAction } from "@/src/lib/actions/user.actions"

export function CreateClientForm() {
  const t = useTranslations("Admin.clients.form")
  const router = useRouter()

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createClientAction(formData)
      if (result.success) {
        router.push("/admin/clients")
        return { success: true, error: null }
      }
      return { success: false, error: result.error }
    },
    { success: false, error: null }
  )

  return (
    <form action={formAction} className="flex flex-col gap-12 text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
        Os campos marcados com <span className="text-red-500">*</span> são
        obrigatórios.
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <IdentificationCard
              weight="bold"
              className="size-5 text-brand-primary"
            />
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
              {t("identity_title")}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
            {t("identity_desc")}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="firstName"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("firstName")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <User
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ex: John"
                required
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="lastName"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("lastName")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Ex: Doe"
              required
              disabled={isPending}
              className="h-14 rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
            />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="companyName"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              Empresa / Marca
            </Label>
            <div className="relative group">
              <Buildings
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="companyName"
                name="companyName"
                placeholder="MAGUI.studio"
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="position"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              Cargo / Função
            </Label>
            <Input
              id="position"
              name="position"
              placeholder="CEO / Diretor"
              disabled={isPending}
              className="h-14 rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
            />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="phone"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              WhatsApp / Contato
            </Label>
            <div className="relative group">
              <Phone
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="phone"
                name="phone"
                placeholder="+55 (11) 99999-9999"
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="taxId"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              CPF / CNPJ (Opcional)
            </Label>
            <div className="relative group">
              <Tag
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="taxId"
                name="taxId"
                placeholder="000.000.000-00"
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/20" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Fingerprint weight="bold" className="size-5 text-brand-primary" />
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
              {t("security_title")}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
            {t("security_desc")}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="email"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("email")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <EnvelopeSimple
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="username"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("username")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              required
              disabled={isPending}
              className="h-14 rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
            />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="password"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("password")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <LockKey
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
              />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isPending}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
            <p className="ml-1 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
              {t("password_hint")}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              htmlFor="role"
              className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
            >
              {t("role")} <span className="text-red-500">*</span>
            </Label>
            <Select
              name="role"
              defaultValue="client"
              required
              disabled={isPending}
            >
              <SelectTrigger
                id="role"
                size="lg"
                className="rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <UserCircleGear
                    weight="bold"
                    className="size-4 text-brand-primary"
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                <SelectItem
                  value="client"
                  className="rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                >
                  {t("roles.client")}
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                >
                  {t("roles.admin")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        {state.error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-2">
            <ShieldCheck weight="bold" className="size-5 text-destructive" />
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive">
              {state.error || t("security_violation")}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="group relative h-16 w-full overflow-hidden rounded-2xl font-sans font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 sm:w-max sm:self-end sm:px-12"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>{t("submitting")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>{t("submit")}</span>
              <ArrowRight
                weight="bold"
                className="size-5 transition-transform group-hover:translate-x-1"
              />
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}
