"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { useRouter } from "@/src/i18n/navigation"
import {
  Building,
  CircleNotch,
  CurrencyDollar,
  Envelope,
  Funnel,
  Globe,
  InstagramLogo,
  Note,
  Phone,
  User,
} from "@phosphor-icons/react"
import { toast } from "sonner"

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

import { createLead } from "@/src/lib/actions/crm.actions"

type LeadSourceValue =
  | "REFERRAL"
  | "ORGANIC"
  | "INSTAGRAM"
  | "LINKEDIN"
  | "WEBSITE"
  | "OTHER"

export function CreateLeadForm(): React.JSX.Element {
  const t = useTranslations("Admin.crm")
  const [isLoading, setIsLoading] = React.useState(false)
  const [source, setSource] = React.useState<LeadSourceValue>("OTHER")
  const router = useRouter()

  const showInstagramField = source === "INSTAGRAM"
  const showWebsiteField = source === "WEBSITE" || source === "LINKEDIN"

  const sourceFieldLabel = showInstagramField
    ? "Link do Instagram"
    : source === "LINKEDIN"
      ? "Link do LinkedIn"
      : "Site"

  const sourceFieldPlaceholder = showInstagramField
    ? "https://instagram.com/usuario"
    : source === "LINKEDIN"
      ? "https://linkedin.com/in/usuario"
      : "https://"

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)

    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    const websiteValue = (formData.get("website") as string) || ""
    const instagramValue = (formData.get("instagram") as string) || ""

    const result = await createLead({
      companyName: formData.get("companyName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      website: showWebsiteField ? websiteValue : "",
      instagram: showInstagramField ? instagramValue : "",
      notes: formData.get("notes") as string,
      value: formData.get("value") as string,
      source,
    })

    if (result.success) {
      toast.success(t("form.success"))
      formElement.reset()
      setSource("OTHER")
      router.push("/admin/crm")
    } else {
      toast.error(t("form.error"))
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
            Empresa
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("form.company")} <span className="text-red-500">*</span>
              </Label>
              <div className="group relative">
                <Building
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <Input
                  id="companyName"
                  name="companyName"
                  required
                  placeholder="Ex: Nome da Empresa Ltda"
                  className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contactName"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("form.contact")}
              </Label>
              <div className="group relative">
                <User
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Nome da pessoa"
                  className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
            Contato
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("form.email")}
              </Label>
              <div className="group relative">
                <Envelope
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {t("form.phone")}
              </Label>
              <div className="group relative">
                <Phone
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
            Acompanhamento
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Origem
              </Label>
              <div className="relative">
                <Funnel
                  className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-muted-foreground/40"
                  size={18}
                />
                <Select
                  name="source"
                  value={source}
                  onValueChange={(value) => setSource(value as LeadSourceValue)}
                >
                  <SelectTrigger
                    size="lg"
                    className="h-12 w-full rounded-2xl border-border/40 bg-muted/10 pl-12 text-left"
                  >
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="border border-border/60 bg-background shadow-2xl"
                  >
                    <SelectItem value="REFERRAL">Indicacao</SelectItem>
                    <SelectItem value="ORGANIC">Organico</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="WEBSITE">Site</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="value"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Valor estimado
              </Label>
              <div className="group relative">
                <CurrencyDollar
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <Input
                  id="value"
                  name="value"
                  placeholder="Ex: R$ 12.000"
                  className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                />
              </div>
            </div>

            {showInstagramField ? (
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="instagram"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {sourceFieldLabel}
                </Label>
                <div className="group relative">
                  <InstagramLogo
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                    size={18}
                  />
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder={sourceFieldPlaceholder}
                    className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                  />
                </div>
              </div>
            ) : null}

            {showWebsiteField ? (
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="website"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {sourceFieldLabel}
                </Label>
                <div className="group relative">
                  <Globe
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                    size={18}
                  />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder={sourceFieldPlaceholder}
                    className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
            Observacoes
          </h3>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              {t("form.notes")}
            </Label>
            <div className="group relative">
              <Note
                className="absolute top-4 left-4 text-muted-foreground/40 transition-colors group-focus-within:text-brand-primary"
                size={18}
              />
              <Textarea
                id="notes"
                name="notes"
                placeholder="Registre contexto, momento da conversa, proximo passo e qualquer sinal que fortaleça a qualificacao."
                className="min-h-[120px] rounded-2xl border-border/40 bg-muted/10 pl-12 transition-all focus:bg-muted/20"
              />
            </div>
            <p className="pl-1 text-[11px] text-muted-foreground/60">
              Boas notas deixam claro origem, valor, responsavel pela conversa e
              qual eh o proximo movimento comercial.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-border/40 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/crm")}
          disabled={isLoading}
          className="rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest"
        >
          {t("details.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 rounded-2xl bg-brand-primary px-12 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95 hover:bg-brand-primary/90"
        >
          {isLoading ? (
            <CircleNotch
              className="mr-2 animate-spin"
              size={18}
              weight="bold"
            />
          ) : null}
          {t("form.submit")}
        </Button>
      </div>
    </form>
  )
}
