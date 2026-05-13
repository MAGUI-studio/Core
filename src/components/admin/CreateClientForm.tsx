"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  ArrowRight,
  Buildings,
  Checks,
  Copy,
  EnvelopeSimple,
  Eye,
  EyeSlash,
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
import { formatBrazilPhoneInput } from "@/src/lib/utils/phone"

function generateStrongPassword(length: number = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%&*()-_=+?"
  const all = `${upper}${lower}${digits}${symbols}`

  const getRandom = (max: number) => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      const array = new Uint32Array(1)
      crypto.getRandomValues(array)
      return array[0] % max
    }

    return Math.floor(Math.random() * max)
  }

  const passwordChars = [
    upper[getRandom(upper.length)],
    lower[getRandom(lower.length)],
    digits[getRandom(digits.length)],
    symbols[getRandom(symbols.length)],
  ]

  while (passwordChars.length < length) {
    passwordChars.push(all[getRandom(all.length)])
  }

  for (let i = passwordChars.length - 1; i > 0; i -= 1) {
    const j = getRandom(i + 1)
    ;[passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]]
  }

  return passwordChars.join("")
}

type TaxIdType = "cpf" | "cnpj"

function formatTaxIdInput(value: string, type: TaxIdType): string {
  const digits = value.replace(/\D/g, "")

  if (type === "cpf") {
    const cpf = digits.slice(0, 11)

    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    }

    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const cnpj = digits.slice(0, 14)

  if (cnpj.length <= 2) return cnpj
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`
  if (cnpj.length <= 8) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`
  }
  if (cnpj.length <= 12) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`
  }

  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
}

export function CreateClientForm() {
  const t = useTranslations("Admin.clients.form")
  const router = useRouter()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [taxIdType, setTaxIdType] = React.useState<TaxIdType>("cpf")
  const [taxId, setTaxId] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [credentialsCopied, setCredentialsCopied] = React.useState(false)

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

  React.useEffect(() => {
    if (!credentialsCopied) return

    const timeout = window.setTimeout(() => {
      setCredentialsCopied(false)
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [credentialsCopied])

  const handleCopyCredentials = async () => {
    if (!username.trim() || !password.trim()) {
      return
    }

    const message = `Bem-vindo(a)! Seu acesso a plataforma da MAGUI ja esta pronto.\n\nAqui estao seus dados para entrar:\n\nPlataforma: https://dashboard.magui.studio\nUsuario: ${username.trim()}\nSenha: ${password}\n\nSe precisar de apoio no primeiro acesso, pode nos chamar por aqui.`

    try {
      await navigator.clipboard.writeText(message)
      setCredentialsCopied(true)
    } catch {
      // ignore clipboard failure here; submit flow remains unaffected
    }
  }

  const taxIdPlaceholder =
    taxIdType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"

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
                placeholder="(00) 0 0000-0000"
                disabled={isPending}
                value={phone}
                onChange={(event) =>
                  setPhone(formatBrazilPhoneInput(event.target.value))
                }
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              CPF / CNPJ (Opcional)
            </Label>
            <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <Select
                value={taxIdType}
                onValueChange={(value) => {
                  const nextType = value as TaxIdType
                  setTaxIdType(nextType)
                  setTaxId((current) => formatTaxIdInput(current, nextType))
                }}
                disabled={isPending}
              >
                <SelectTrigger
                  id="taxIdType"
                  size="lg"
                  className="h-14 rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Tag weight="bold" className="size-4 text-brand-primary" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 bg-background/95 shadow-2xl backdrop-blur-xl">
                  <SelectItem
                    value="cpf"
                    className="rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                  >
                    CPF
                  </SelectItem>
                  <SelectItem
                    value="cnpj"
                    className="rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-colors focus:bg-brand-primary focus:text-white"
                  >
                    CNPJ
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="relative group">
                <Tag
                  weight="bold"
                  className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                />
                <Input
                  id="taxId"
                  name="taxId"
                  placeholder={taxIdPlaceholder}
                  disabled={isPending}
                  value={taxId}
                  onChange={(event) =>
                    setTaxId(formatTaxIdInput(event.target.value, taxIdType))
                  }
                  className="h-14 rounded-2xl border-border/40 bg-muted/10 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
                />
              </div>
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
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isPending}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 rounded-2xl border-border/40 bg-muted/10 pr-32 pl-11 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/20"
              />
              <button
                type="button"
                className="absolute top-1/2 right-11 flex h-8 -translate-y-1/2 items-center rounded-full px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 transition-none hover:text-foreground focus:outline-none"
                onClick={() => setPassword(generateStrongPassword())}
              >
                Gerar
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 size-8 -translate-y-1/2 rounded-full text-muted-foreground/60 hover:bg-transparent hover:text-foreground"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeSlash className="size-4" weight="bold" />
                ) : (
                  <Eye className="size-4" weight="bold" />
                )}
              </Button>
            </div>
            <p className="ml-1 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
              {t("password_hint")}
            </p>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full border-border/20 bg-background px-4 text-[10px] font-black uppercase tracking-widest"
                onClick={handleCopyCredentials}
                disabled={!username.trim() || !password.trim()}
              >
                {credentialsCopied ? (
                  <Checks className="mr-2 size-4" weight="bold" />
                ) : (
                  <Copy className="mr-2 size-4" weight="bold" />
                )}
                {credentialsCopied ? "Copiado" : "Copiar acesso"}
              </Button>
            </div>
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
                className="h-14 w-full rounded-2xl border-border/40 bg-muted/10 px-4 font-sans font-bold text-foreground transition-all focus:ring-brand-primary/20 disabled:opacity-50"
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
          className="group relative h-16 w-full overflow-hidden rounded-2xl font-sans font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 sm:w-max sm:self-end sm:px-12"
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
