"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"

import {
  ArrowRight,
  Camera,
  Check,
  Globe,
  IdentificationCard,
  Image as ImageIcon,
  Palette,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"

import { upsertOwnMaguiConnectProfileAction } from "@/src/lib/actions/maguiConnect.actions"
import { UploadButton } from "@/src/lib/uploadthing"
import { cn } from "@/src/lib/utils/utils"
import {
  type MaguiConnectProfileInput,
  maguiConnectProfileSchema,
} from "@/src/lib/validations/maguiConnect"

interface MaguiConnectEditorProps {
  initialProfile: {
    displayName: string
    headline: string | null
    heroKicker: string | null
    heroHeadline: string | null
    heroDescription: string | null
    bio: string | null
    avatarUrl: string | null
    bannerUrl: string | null
    ogImageUrl: string | null
    professionalCategory: string | null
    location: string | null
    companyName: string | null
    publicEmail: string | null
    publicPhone: string | null
    whatsapp: string | null
    whatsappMessage: string | null
    primaryCtaLabel: string | null
    primaryCtaUrl: string | null
    secondaryCtaLabel: string | null
    secondaryCtaUrl: string | null
    themeAccent: string | null
    seoTitle: string | null
    seoDescription: string | null
  } | null
}

const editorTabs = [
  {
    value: "basic",
    icon: IdentificationCard,
    index: "01",
  },
  {
    value: "contact",
    icon: Globe,
    index: "02",
  },
  {
    value: "appearance",
    icon: Palette,
    index: "03",
  },
  {
    value: "seo",
    icon: Check,
    index: "04",
  },
] as const

export function MaguiConnectEditor({
  initialProfile,
}: MaguiConnectEditorProps) {
  const t = useTranslations("MaguiConnect")
  const [isPending, startTransition] = React.useTransition()

  const [formData, setFormData] = React.useState<MaguiConnectProfileInput>({
    title: initialProfile?.displayName ?? "",
    description: initialProfile?.headline ?? "",
    heroKicker: initialProfile?.heroKicker ?? "",
    heroHeadline: initialProfile?.heroHeadline ?? "",
    heroDescription: initialProfile?.heroDescription ?? "",
    bio: initialProfile?.bio ?? "",
    avatarUrl: initialProfile?.avatarUrl ?? "",
    ogImageUrl: initialProfile?.ogImageUrl ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slug: undefined as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    domain: undefined as any,
    professionalCategory: initialProfile?.professionalCategory ?? "",
    location: initialProfile?.location ?? "",
    companyName: initialProfile?.companyName ?? "",
    publicEmail: initialProfile?.publicEmail ?? "",
    publicPhone: initialProfile?.publicPhone ?? "",
    whatsapp: initialProfile?.whatsapp ?? "",
    whatsappMessage: initialProfile?.whatsappMessage ?? "",
    primaryCtaLabel: initialProfile?.primaryCtaLabel ?? "",
    primaryCtaUrl: initialProfile?.primaryCtaUrl ?? "",
    secondaryCtaLabel: initialProfile?.secondaryCtaLabel ?? "",
    secondaryCtaUrl: initialProfile?.secondaryCtaUrl ?? "",
    bannerUrl: initialProfile?.bannerUrl ?? "",
    themeAccent: initialProfile?.themeAccent ?? "#E5FF00",
    seoTitle: initialProfile?.seoTitle ?? "",
    seoDescription: initialProfile?.seoDescription ?? "",
  })

  // Helper to translate UploadThing errors
  const getUploadErrorMessage = (error: Error) => {
    const message = error.message.toLowerCase()
    if (message.includes("filesizemismatch") || message.includes("too large")) {
      return t("errorFileSize")
    }
    if (
      message.includes("filetypemismatch") ||
      message.includes("not allowed")
    ) {
      return t("errorFileType")
    }
    if (message.includes("limitexceeded")) {
      return t("errorFileLimit")
    }
    return t("errorUploadGeneric")
  }

  // Sync avatar immediately when uploaded
  const handleAvatarUpload = async (url: string) => {
    const updatedData = { ...formData, avatarUrl: url }
    setFormData(updatedData)

    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(updatedData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error("Erro ao salvar foto de perfil")
      }
    })
  }

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    const updatedData = { ...formData, avatarUrl: "" }
    setFormData(updatedData)

    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(updatedData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error("Erro ao remover foto de perfil")
      }
    })
  }

  // Sync banner immediately when uploaded
  const handleBannerUpload = async (url: string) => {
    const updatedData = { ...formData, bannerUrl: url }
    setFormData(updatedData)

    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(updatedData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error("Erro ao salvar banner de perfil")
      }
    })
  }

  // Handle banner removal
  const handleRemoveBanner = async () => {
    const updatedData = { ...formData, bannerUrl: "" }
    setFormData(updatedData)

    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(updatedData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error("Erro ao remover banner de perfil")
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const parsed = maguiConnectProfileSchema.parse(formData)
        await upsertOwnMaguiConnectProfileAction(parsed)
        toast.success(t("profileUpdated"))
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : t("updateFailed")
        )
      }
    })
  }

  // Phone formatting helper
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return ""
    if (numbers.length <= 2) return `+${numbers}`
    if (numbers.length <= 4)
      return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 9)
      return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`
  }

  const updateField = (
    field: keyof MaguiConnectProfileInput,
    value: string | null
  ) => {
    if (field === "whatsapp" && value) {
      const formatted = formatPhone(value)
      setFormData((prev) => ({
        ...prev,
        [field]: formatted.replace(/\D/g, ""),
      }))
      return
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="w-full">
      <Tabs defaultValue="basic" className="w-full">
        <div className="mb-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-brand-primary/60" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/60">
              {t("registerEyebrow")}
            </p>
          </div>

          <TabsList className="flex h-auto w-full flex-nowrap justify-start gap-10 overflow-x-auto overflow-y-hidden rounded-none border-b border-border/30 bg-transparent p-0 pb-px scrollbar-hide">
            {editorTabs.map((tab) => {
              const labelKey =
                tab.value === "basic"
                  ? "tabBasic"
                  : tab.value === "contact"
                    ? "tabContact"
                    : tab.value === "appearance"
                      ? "tabAppearance"
                      : "tabSEO"

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 text-left text-sm font-bold tracking-tight text-muted-foreground/60 shadow-none transition-all duration-200 hover:text-foreground",
                    "data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <p className="text-[10px] font-black tracking-widest text-brand-primary/40 group-data-[state=active]:text-brand-primary/60">
                      {tab.index}
                    </p>
                    {t(labelKey)}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* --- BASIC INFO --- */}
        <TabsContent
          value="basic"
          className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none"
        >
          <div className="mb-12 space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {t("tabBasic")}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground/70">
              {t("registerDescription")}
            </p>
          </div>

          <div className="grid gap-16">
            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="title"
              >
                {t("titleLabel")}
              </Label>
              <Input
                id="title"
                className="h-16 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-3xl font-normal tracking-tight shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                placeholder={t("titlePlaceholder")}
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="description"
              >
                {t("descriptionLabel")}
              </Label>
              <Input
                id="description"
                className="h-12 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-xl font-normal tracking-tight shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="heroKicker"
              >
                {t("heroKickerLabel")}
              </Label>
              <Input
                id="heroKicker"
                className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                placeholder={t("heroKickerPlaceholder")}
                value={formData.heroKicker ?? ""}
                onChange={(e) => updateField("heroKicker", e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="heroHeadline"
              >
                {t("heroHeadlineLabel")}
              </Label>
              <Input
                id="heroHeadline"
                className="h-12 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-xl font-normal tracking-tight shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                placeholder={t("heroHeadlinePlaceholder")}
                value={formData.heroHeadline ?? ""}
                onChange={(e) => updateField("heroHeadline", e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="heroDescription"
              >
                {t("heroDescriptionLabel")}
              </Label>
              <Textarea
                id="heroDescription"
                className="min-h-[120px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 py-4 text-lg font-normal leading-relaxed shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all resize-none"
                placeholder={t("heroDescriptionPlaceholder")}
                value={formData.heroDescription ?? ""}
                onChange={(e) => updateField("heroDescription", e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label
                className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                htmlFor="bio"
              >
                {t("bioLabel")}
              </Label>
              <Textarea
                id="bio"
                className="min-h-[120px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 py-4 text-lg font-normal leading-relaxed shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all resize-none"
                placeholder={t("bioPlaceholder")}
                value={formData.bio ?? ""}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>

            <div className="grid gap-12 sm:grid-cols-2">
              <div className="grid gap-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                  htmlFor="professionalCategory"
                >
                  {t("categoryLabel")}
                </Label>
                <Input
                  id="professionalCategory"
                  className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                  placeholder={t("categoryPlaceholder")}
                  value={formData.professionalCategory ?? ""}
                  onChange={(e) =>
                    updateField("professionalCategory", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                  htmlFor="location"
                >
                  {t("locationLabel")}
                </Label>
                <Input
                  id="location"
                  className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                  placeholder={t("locationPlaceholder")}
                  value={formData.location ?? ""}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- CONTACT & CTA --- */}
        <TabsContent
          value="contact"
          className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none"
        >
          <div className="mb-12 space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {t("tabContact")}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground/70">
              {t("linksDescription")}
            </p>
          </div>

          <div className="grid gap-16">
            <div className="grid gap-12 sm:grid-cols-2">
              <div className="grid gap-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                  htmlFor="publicEmail"
                >
                  {t("emailLabel")}
                </Label>
                <Input
                  id="publicEmail"
                  type="email"
                  className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                  placeholder="contato@exemplo.com"
                  value={formData.publicEmail ?? ""}
                  onChange={(e) => updateField("publicEmail", e.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                  htmlFor="whatsapp"
                >
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                  placeholder="+55 11 99999-9999"
                  value={formatPhone(formData.whatsapp ?? "")}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:col-span-2">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70"
                  htmlFor="whatsappMessage"
                >
                  {t("whatsappMessageLabel")}
                </Label>
                <Input
                  id="whatsappMessage"
                  className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                  placeholder={t("whatsappMessagePlaceholder")}
                  value={formData.whatsappMessage ?? ""}
                  onChange={(e) =>
                    updateField("whatsappMessage", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
                  {t("ctaSection")}
                </span>
                <div className="h-px flex-1 bg-border/30" />
              </div>
              <div className="grid gap-12 sm:grid-cols-2">
                <div className="grid gap-4">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="primaryCtaLabel"
                  >
                    {t("ctaLabel")}
                  </Label>
                  <Input
                    id="primaryCtaLabel"
                    className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    placeholder={t("primaryCtaLabelPlaceholder")}
                    value={formData.primaryCtaLabel ?? ""}
                    onChange={(e) =>
                      updateField("primaryCtaLabel", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="primaryCtaUrl"
                  >
                    {t("ctaUrl")}
                  </Label>
                  <Input
                    id="primaryCtaUrl"
                    className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-mono font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    placeholder={t("ctaUrlPlaceholder")}
                    value={formData.primaryCtaUrl ?? ""}
                    onChange={(e) =>
                      updateField("primaryCtaUrl", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="secondaryCtaLabel"
                  >
                    {t("secondaryCtaLabelLabel")}
                  </Label>
                  <Input
                    id="secondaryCtaLabel"
                    className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    placeholder={t("secondaryCtaLabelPlaceholder")}
                    value={formData.secondaryCtaLabel ?? ""}
                    onChange={(e) =>
                      updateField("secondaryCtaLabel", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4">
                  <Label
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    htmlFor="secondaryCtaUrl"
                  >
                    {t("secondaryCtaUrlLabel")}
                  </Label>
                  <Input
                    id="secondaryCtaUrl"
                    className="h-10 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-base font-mono font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    placeholder={t("ctaUrlPlaceholder")}
                    value={formData.secondaryCtaUrl ?? ""}
                    onChange={(e) =>
                      updateField("secondaryCtaUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="appearance"
          className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none"
        >
          <div className="mb-12 space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {t("tabAppearance")}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground/70">
              Personalize a identidade visual e as cores da sua página.
            </p>
          </div>

          <div className="grid gap-16">
            <div className="grid gap-10">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                {t("bannerLabel")}
              </Label>
              <div className="space-y-6">
                <div className="relative aspect-[3/1] w-full overflow-hidden bg-muted/20 border border-border/10">
                  {formData.bannerUrl ? (
                    <Image
                      src={formData.bannerUrl}
                      alt="Banner"
                      className="h-full w-full object-cover"
                      fill
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                      <ImageIcon size={64} weight="duotone" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {formData.bannerUrl
                        ? t("changeBanner")
                        : t("uploadBanner")}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground/60">
                      {t("bannerDescription")}
                    </p>
                  </div>

                  <div className="flex w-full items-center gap-4 sm:w-auto">
                    {formData.bannerUrl && (
                      <Button
                        variant="ghost"
                        onClick={handleRemoveBanner}
                        className="h-14 rounded-none border border-destructive/20 bg-destructive/5 px-6 text-[10px] font-black uppercase tracking-widest text-destructive transition-all hover:bg-destructive/10"
                      >
                        <Trash size={16} weight="bold" className="mr-2" />
                        {t("deleteBanner")}
                      </Button>
                    )}
                    <div className="flex-1 sm:flex-none">
                      <UploadButton
                        endpoint="maguiConnectBanner"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]) handleBannerUpload(res[0].url)
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(getUploadErrorMessage(error))
                        }}
                        content={{
                          button({ ready }) {
                            if (ready) return t("uploadBanner")
                            return "Carregando..."
                          },
                          allowedContent: "Imagens até 8MB",
                        }}
                        appearance={{
                          button:
                            "h-14 w-full rounded-none bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-brand-primary/90 transition-all ut-ready:bg-brand-primary ut-uploading:cursor-not-allowed shadow-none",
                          allowedContent: "hidden",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-10">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                {t("avatarLabel")}
              </Label>
              <div className="flex flex-col gap-10 sm:flex-row">
                <div className="flex flex-col">
                  <div className="h-40 w-40 overflow-hidden bg-muted/20 border border-border/10">
                    {formData.avatarUrl ? (
                      <Image
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                        width={160}
                        height={160}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                        <Camera size={48} weight="duotone" />
                      </div>
                    )}
                  </div>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 bg-destructive/10 py-3 text-[10px] font-black uppercase tracking-widest text-destructive transition-all hover:bg-destructive/20"
                    >
                      <Trash size={14} weight="bold" />
                      {t("deleteAvatar")}
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-foreground">
                      {formData.avatarUrl
                        ? t("changeAvatar")
                        : t("uploadAvatar")}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground/60">
                      {t("avatarDescription")}
                    </p>
                  </div>

                  <div className="mt-8">
                    <UploadButton
                      endpoint="maguiConnectAvatar"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) handleAvatarUpload(res[0].url)
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(getUploadErrorMessage(error))
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) return t("uploadAvatar")
                          return "Carregando..."
                        },
                        allowedContent: "Imagens até 4MB",
                      }}
                      appearance={{
                        button:
                          "h-14 w-full rounded-none bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-brand-primary/90 transition-all ut-ready:bg-brand-primary ut-uploading:cursor-not-allowed shadow-none",
                        allowedContent: "hidden",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-12 sm:grid-cols-1">
              <div className="grid gap-4 sm:max-w-xs">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                  {t("accentLabel")}
                </Label>
                <Input
                  type="color"
                  className="h-12 w-full p-1 rounded-lg border-border/40 bg-transparent"
                  value={formData.themeAccent ?? "#E5FF00"}
                  onChange={(e) => updateField("themeAccent", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="seo"
          className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none"
        >
          <div className="mb-12 space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {t("tabSEO")}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground/70">
              Configure os metadados para motores de busca.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="grid gap-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                {t("seoTitleLabel")}
              </Label>
              <Input
                className="h-12 rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-lg font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                placeholder={t("seoTitlePlaceholder")}
                value={formData.seoTitle ?? ""}
                onChange={(e) => updateField("seoTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/70">
                {t("seoDescriptionLabel")}
              </Label>
              <Textarea
                className="min-h-[100px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 py-4 text-base font-normal leading-relaxed shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all resize-none"
                placeholder={t("seoDescriptionPlaceholder")}
                value={formData.seoDescription ?? ""}
                onChange={(e) => updateField("seoDescription", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-12 mt-16 border-t border-border/20">
        <Button
          className="group relative cursor-pointer rounded-full bg-brand-primary px-12 h-16 text-[11px] font-black uppercase tracking-[0.5em] text-white hover:bg-brand-primary transition-all active:scale-[0.98] shadow-none overflow-hidden"
          disabled={isPending}
          onClick={handleSave}
        >
          <div className="relative z-10 flex items-center gap-3">
            {isPending ? t("saving") : t("save")}
            {!isPending && (
              <ArrowRight
                size={20}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
    </section>
  )
}
