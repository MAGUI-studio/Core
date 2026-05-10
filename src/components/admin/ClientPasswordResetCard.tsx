"use client"

import * as React from "react"

import { Checks, Copy, Eye, EyeSlash, LockKey, Sparkle } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import { resetClientPasswordAction } from "@/src/lib/actions/user.actions"

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

type ClientPasswordResetCardProps = {
  clerkUserId: string
  username: string | null
}

export function ClientPasswordResetCard({
  clerkUserId,
  username,
}: ClientPasswordResetCardProps) {
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [credentialsCopied, setCredentialsCopied] = React.useState(false)

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await resetClientPasswordAction(formData)
      return {
        success: Boolean(result.success),
        error: result.error ?? null,
      }
    },
    { success: false, error: null as string | null }
  )

  React.useEffect(() => {
    if (state.success) {
      toast.success("Senha atualizada com sucesso.")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  React.useEffect(() => {
    if (!credentialsCopied) return

    const timeout = window.setTimeout(() => {
      setCredentialsCopied(false)
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [credentialsCopied])

  const handleCopyCredentials = async () => {
    if (!username?.trim() || !password.trim()) {
      return
    }

    const message = `Bem-vindo(a)! Seu acesso a plataforma da MAGUI ja esta pronto.\n\nAqui estao seus dados para entrar:\n\nPlataforma: https://dashboard.magui.studio\nUsuario: ${username.trim()}\nSenha: ${password}\n\nSe precisar de apoio no primeiro acesso, pode nos chamar por aqui.`

    try {
      await navigator.clipboard.writeText(message)
      setCredentialsCopied(true)
      toast.success("Acesso copiado.")
    } catch {
      toast.error("Nao foi possivel copiar o acesso.")
    }
  }

  return (
    <form
      action={formAction}
      className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-8"
    >
      <input type="hidden" name="clerkUserId" value={clerkUserId} />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Sparkle className="size-4 text-brand-primary" weight="duotone" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/55">
              Acesso do cliente
            </p>
          </div>
          <h2 className="text-lg font-black tracking-tight text-foreground">
            Resetar senha
          </h2>
          <p className="text-sm text-muted-foreground/75">
            Gere uma senha forte ou defina uma nova manualmente quando precisar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
              Usuario
            </Label>
            <Input
              value={username || "Sem username"}
              readOnly
              className="h-12 rounded-2xl border-border/35 bg-muted/10 font-semibold text-foreground/80"
            />
          </div>

          <div className="grid gap-2.5">
            <Label
              htmlFor="client-reset-password"
              className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60"
            >
              Nova senha <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <LockKey
                weight="bold"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40"
              />
              <Input
                id="client-reset-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••••"
                minLength={8}
                required
                disabled={isPending}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-2xl border-border/35 bg-muted/10 pl-11 pr-32 font-semibold"
              />
              <button
                type="button"
                className="absolute right-11 top-1/2 flex h-8 -translate-y-1/2 items-center rounded-full px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 transition-none hover:text-foreground focus:outline-none"
                onClick={() => setPassword(generateStrongPassword())}
              >
                Gerar
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full text-muted-foreground/60 hover:bg-transparent hover:text-foreground"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeSlash className="size-4" weight="bold" />
                ) : (
                  <Eye className="size-4" weight="bold" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 md:w-[15rem] md:justify-end">
        <Button
          type="submit"
          disabled={isPending || !password.trim()}
          className="h-12 rounded-full bg-brand-primary px-5 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-none hover:bg-brand-primary/90"
        >
          {isPending ? "Salvando..." : "Atualizar senha"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!username?.trim() || !password.trim()}
          onClick={handleCopyCredentials}
          className="h-11 rounded-full border-border/20 bg-transparent text-[10px] font-black uppercase tracking-[0.24em] shadow-none"
        >
          {credentialsCopied ? (
            <Checks className="mr-2 size-4" weight="bold" />
          ) : (
            <Copy className="mr-2 size-4" weight="bold" />
          )}
          {credentialsCopied ? "Copiado" : "Copiar acesso"}
        </Button>
      </div>
    </form>
  )
}
