"use client"

import { useMemo, useState, useTransition } from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"

import {
  ArrowRight,
  CaretDown,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import {
  createMaguiConnectLinkForUserAction,
  createMaguiConnectProfileForUserAction,
  deleteMaguiConnectLinkForUserAction,
  setMaguiConnectAccessForUserAction,
  updateMaguiConnectLinkForUserAction,
  upsertMaguiConnectProfileForUserAction,
} from "@/src/lib/actions/maguiConnect.actions"
import {
  type MaguiConnectAdminProfileInput,
  type MaguiConnectLinkInput,
  maguiConnectAdminProfileSchema,
  maguiConnectLinkSchema,
} from "@/src/lib/validations/maguiConnect"

import { MAGUI_CONNECT_LINK_KIND_PRESETS } from "@/src/config/magui-connect-presets"

interface MaguiConnectAdminViewProps {
  clientName: string
  userId: string
  canAccess: boolean
  profile:
    | ({
        displayName: string
        headline: string | null
        heroKicker: string | null
        heroHeadline: string | null
        heroDescription: string | null
        bio: string | null
        avatarUrl: string | null
        bannerUrl: string | null
        siteName: string | null
        faviconUrl: string | null
        logoUrl: string | null
        ogImageUrl: string | null
        twitterImageUrl: string | null
        slug: string | null
        domain: string | null
        canonicalUrl: string | null
        locale: string
        professionalCategory: string | null
        location: string | null
        entityType: "PERSON" | "ORGANIZATION" | "BRAND"
        jobTitle: string | null
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
        themeColor: string | null
        seoTitle: string | null
        seoDescription: string | null
        seoKeywords: string | null
        twitterHandle: string | null
        indexable: boolean
        seoNoFollow: boolean
      } & {
        links: Array<{
          id: string
          label: string
          url: string
          customShortDescription?: string | null
          startsAt?: Date | null
          expiresAt?: Date | null
          kind?: string
          isFeatured?: boolean
          openInNewTab?: boolean
        }>
      })
    | null
}

export function MaguiConnectAdminView({
  clientName,
  userId,
  canAccess,
  profile,
}: MaguiConnectAdminViewProps) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<MaguiConnectAdminProfileInput>({
    title: profile?.displayName ?? clientName,
    description: profile?.headline ?? "",
    heroKicker: profile?.heroKicker ?? "",
    heroHeadline: profile?.heroHeadline ?? "",
    heroDescription: profile?.heroDescription ?? "",
    bio: profile?.bio ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    bannerUrl: profile?.bannerUrl ?? "",
    siteName: profile?.siteName ?? "",
    faviconUrl: profile?.faviconUrl ?? "",
    logoUrl: profile?.logoUrl ?? "",
    ogImageUrl: profile?.ogImageUrl ?? "",
    twitterImageUrl: profile?.twitterImageUrl ?? "",
    slug: profile?.slug ?? "",
    domain: profile?.domain ?? "",
    canonicalUrl: profile?.canonicalUrl ?? "",
    locale: profile?.locale ?? "pt-BR",
    professionalCategory: profile?.professionalCategory ?? "",
    location: profile?.location ?? "",
    entityType: profile?.entityType ?? "PERSON",
    jobTitle: profile?.jobTitle ?? "",
    companyName: profile?.companyName ?? "",
    publicEmail: profile?.publicEmail ?? "",
    publicPhone: profile?.publicPhone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    whatsappMessage: profile?.whatsappMessage ?? "",
    primaryCtaLabel: profile?.primaryCtaLabel ?? "",
    primaryCtaUrl: profile?.primaryCtaUrl ?? "",
    secondaryCtaLabel: profile?.secondaryCtaLabel ?? "",
    secondaryCtaUrl: profile?.secondaryCtaUrl ?? "",
    themeAccent: profile?.themeAccent ?? "",
    themeColor: profile?.themeColor ?? "",
    seoTitle: profile?.seoTitle ?? "",
    seoDescription: profile?.seoDescription ?? "",
    seoKeywords: profile?.seoKeywords ?? "",
    twitterHandle: profile?.twitterHandle ?? "",
    indexable: profile?.indexable ?? true,
    seoNoFollow: profile?.seoNoFollow ?? false,
  })
  const [newLink, setNewLink] = useState<MaguiConnectLinkInput>({
    label: "",
    url: "",
    customShortDescription: "",
    startsAt: "",
    expiresAt: "",
    kind: "LINK",
    isFeatured: false,
    openInNewTab: true,
  })
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editingLinkData, setEditingLinkData] = useState<MaguiConnectLinkInput>(
    {
      label: "",
      url: "",
      customShortDescription: "",
      startsAt: "",
      expiresAt: "",
      kind: "LINK",
      isFeatured: false,
      openInNewTab: true,
    }
  )
  const primaryActionClassName =
    "h-12 rounded-full bg-brand-primary px-7 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:bg-brand-primary/90"

  const links = useMemo(() => profile?.links ?? [], [profile?.links])
  const seoStatus = useMemo(() => {
    if (!formData.indexable) return "NOINDEX"
    const hasOg =
      !!formData.ogImageUrl || !!formData.bannerUrl || !!formData.avatarUrl
    const hasTitle = !!formData.seoTitle?.trim()
    const hasDescription = !!formData.seoDescription?.trim()
    const hasDomain = !!formData.domain?.trim()

    return hasOg && hasTitle && hasDescription && hasDomain
      ? "READY"
      : "INCOMPLETE"
  }, [
    formData.avatarUrl,
    formData.bannerUrl,
    formData.domain,
    formData.indexable,
    formData.ogImageUrl,
    formData.seoDescription,
    formData.seoTitle,
  ])

  if (!canAccess) {
    return (
      <section className="border-t border-border/40 pt-6">
        <div className="rounded-4xl border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-40 flex-shrink-0">
                <Image
                  src="/logos/connect/connect_DM.svg"
                  alt="Magui Connect"
                  fill
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/logos/connect/connect_LM.svg"
                  alt="Magui Connect"
                  fill
                  className="hidden object-contain object-left dark:block"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  MAGUI Connect bloqueado
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Este cliente ainda nao tem acesso liberado ao MAGUI Connect.
                  Quando houver compra, bonus ou liberacao manual, ative o
                  acesso por aqui.
                </p>
              </div>
            </div>

            <Button
              className={primaryActionClassName}
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await setMaguiConnectAccessForUserAction(userId, true)
                    toast.success("MAGUI Connect liberado com sucesso.")
                    router.refresh()
                  } catch (error) {
                    console.error(error)
                    toast.error("Nao foi possivel liberar o MAGUI Connect.")
                  }
                })
              }
            >
              Liberar Connect
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="border-t border-border/40 pt-6">
        <div className="rounded-4xl border border-border/30 bg-muted/10 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-40 flex-shrink-0">
                <Image
                  src="/logos/connect/connect_DM.svg"
                  alt="Magui Connect"
                  fill
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/logos/connect/connect_LM.svg"
                  alt="Magui Connect"
                  fill
                  className="hidden object-contain object-left dark:block"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {clientName}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminCreateDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="ghost"
                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await setMaguiConnectAccessForUserAction(userId, false)
                      toast.success("Acesso ao MAGUI Connect removido.")
                      router.refresh()
                    } catch (error) {
                      console.error(error)
                      toast.error("Nao foi possivel atualizar o acesso.")
                    }
                  })
                }
              >
                Bloquear Connect
              </Button>
              <p className="text-sm text-muted-foreground">{t("adminEmpty")}</p>
              <Button
                className={primaryActionClassName}
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await createMaguiConnectProfileForUserAction(userId)
                      toast.success(t("adminCreateSuccess"))
                      router.refresh()
                    } catch (error) {
                      console.error(error)
                      toast.error(t("adminCreateError"))
                    }
                  })
                }
              >
                <Plus size={16} className="mr-2" weight="bold" />
                {t("adminCreateButton")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-border/40 pt-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="rounded-4xl border border-border/30 bg-muted/10 backdrop-blur-md"
      >
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between gap-6 p-6 text-left transition-colors hover:bg-background/30"
            type="button"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-12 w-40 flex-shrink-0">
                <Image
                  src="/logos/connect/connect_DM.svg"
                  alt="Magui Connect"
                  fill
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/logos/connect/connect_LM.svg"
                  alt="Magui Connect"
                  fill
                  className="hidden object-contain object-left dark:block"
                />
              </div>

              <div className="min-w-0 space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {formData.title || clientName}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                {links.length} {links.length === 1 ? "link" : "links"}
              </div>
              <span
                className={`rounded-full border border-border/40 p-2 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <CaretDown size={16} weight="bold" />
              </span>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-border/20 px-6 pb-6">
          <div className="space-y-10 pt-6">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await setMaguiConnectAccessForUserAction(userId, false)
                      toast.success("Acesso ao MAGUI Connect removido.")
                      router.refresh()
                    } catch (error) {
                      console.error(error)
                      toast.error("Nao foi possivel atualizar o acesso.")
                    }
                  })
                }
              >
                Bloquear Connect
              </Button>
            </div>

            <section className="space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("registerTitle")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("registerDescription")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-title"
                  >
                    {t("titleLabel")}
                  </Label>
                  <Input
                    aria-label={t("titleLabel")}
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-title"
                    placeholder={t("titlePlaceholder")}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-slug"
                    >
                      {t("slugLabel")}
                    </Label>
                    <Input
                      aria-label={t("slugLabel")}
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-slug"
                      placeholder={t("slugPlaceholder")}
                      value={formData.slug ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          slug: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-domain"
                    >
                      {t("domainLabel")}
                    </Label>
                    <Input
                      aria-label={t("domainLabel")}
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-domain"
                      placeholder={t("domainPlaceholder")}
                      value={formData.domain ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          domain: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-hero-kicker"
                  >
                    {t("heroKickerLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-hero-kicker"
                    placeholder={t("heroKickerPlaceholder")}
                    value={formData.heroKicker ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        heroKicker: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-hero-headline"
                  >
                    {t("heroHeadlineLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-hero-headline"
                    placeholder={t("heroHeadlinePlaceholder")}
                    value={formData.heroHeadline ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        heroHeadline: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-hero-description"
                  >
                    {t("heroDescriptionLabel")}
                  </Label>
                  <Textarea
                    className="min-h-28 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-hero-description"
                    placeholder={t("heroDescriptionPlaceholder")}
                    value={formData.heroDescription ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        heroDescription: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-secondary-cta-label"
                    >
                      {t("secondaryCtaLabelLabel")}
                    </Label>
                    <Input
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-secondary-cta-label"
                      placeholder={t("secondaryCtaLabelPlaceholder")}
                      value={formData.secondaryCtaLabel ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          secondaryCtaLabel: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      htmlFor="admin-magui-secondary-cta-url"
                    >
                      {t("secondaryCtaUrlLabel")}
                    </Label>
                    <Input
                      className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                      id="admin-magui-secondary-cta-url"
                      placeholder={t("ctaUrlPlaceholder")}
                      value={formData.secondaryCtaUrl ?? ""}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          secondaryCtaUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    htmlFor="admin-magui-description"
                  >
                    {t("descriptionLabel")}
                  </Label>
                  <Textarea
                    aria-label={t("descriptionLabel")}
                    className="min-h-32 rounded-2xl border-border/40 bg-transparent shadow-none"
                    id="admin-magui-description"
                    placeholder={t("descriptionPlaceholder")}
                    value={formData.description ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("adminSlugDomainHelper")}
                </p>
              </div>

              <div className="flex justify-start">
                <Button
                  className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        const parsed =
                          maguiConnectAdminProfileSchema.parse(formData)
                        await upsertMaguiConnectProfileForUserAction(
                          userId,
                          parsed
                        )
                        toast.success(t("adminUpdateSuccess"))
                        router.refresh()
                      } catch (error) {
                        console.error(error)
                        toast.error(
                          error instanceof Error && error.message
                            ? error.message
                            : t("adminUpdateError")
                        )
                      }
                    })
                  }
                >
                  {t("save")}
                </Button>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/20 pt-8">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("adminSeoSectionTitle")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminSeoSectionDescription")}
                </p>
              </div>

              <div className="rounded-3xl border border-border/30 bg-background/40 p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">
                    {t("seoStatusLabel")}:
                  </span>
                  <span className="rounded-full border border-border/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {seoStatus === "READY"
                      ? t("seoStatusReady")
                      : seoStatus === "NOINDEX"
                        ? t("seoStatusNoIndex")
                        : t("seoStatusIncomplete")}
                  </span>
                </div>
                {!formData.indexable ? (
                  <p className="mt-3 text-sm text-amber-600">
                    {t("adminSeoNoIndexWarning")}
                  </p>
                ) : null}
                {!formData.domain?.trim() ? (
                  <p className="mt-2 text-sm text-amber-600">
                    {t("adminSeoMissingDomainWarning")}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-border/30 px-4 py-3">
                  <input
                    checked={formData.indexable}
                    type="checkbox"
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        indexable: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    {t("indexableLabel")}
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-border/30 px-4 py-3">
                  <input
                    checked={formData.seoNoFollow}
                    type="checkbox"
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        seoNoFollow: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    {t("seoNoFollowLabel")}
                  </span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("siteNameLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder={t("siteNamePlaceholder")}
                    value={formData.siteName ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        siteName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("localeLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="pt-BR"
                    value={formData.locale ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        locale: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("canonicalUrlLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="https://bio.exemplo.com"
                    value={formData.canonicalUrl ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        canonicalUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("twitterHandleLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="@magui"
                    value={formData.twitterHandle ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        twitterHandle: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("entityTypeLabel")}
                  </Label>
                  <select
                    className="h-12 rounded-2xl border border-border/40 bg-background px-4 text-sm text-foreground shadow-none outline-none transition-colors focus:border-brand-primary"
                    value={formData.entityType ?? "PERSON"}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        entityType: e.target.value as
                          | "PERSON"
                          | "ORGANIZATION"
                          | "BRAND",
                      }))
                    }
                  >
                    <option
                      className="bg-background text-foreground"
                      value="PERSON"
                    >
                      {t("entityTypePerson")}
                    </option>
                    <option
                      className="bg-background text-foreground"
                      value="ORGANIZATION"
                    >
                      {t("entityTypeOrganization")}
                    </option>
                    <option
                      className="bg-background text-foreground"
                      value="BRAND"
                    >
                      {t("entityTypeBrand")}
                    </option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("jobTitleLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder={t("jobTitlePlaceholder")}
                    value={formData.jobTitle ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        jobTitle: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("faviconUrlLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="https://cdn.exemplo.com/favicon.png"
                    value={formData.faviconUrl ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        faviconUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("logoUrlLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="https://cdn.exemplo.com/logo.png"
                    value={formData.logoUrl ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        logoUrl: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("ogImageUrlLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="https://cdn.exemplo.com/og-image.jpg"
                    value={formData.ogImageUrl ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        ogImageUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("twitterImageUrlLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="https://cdn.exemplo.com/twitter-image.jpg"
                    value={formData.twitterImageUrl ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        twitterImageUrl: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t("seoTitleLabel")}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {(formData.seoTitle ?? "").length}/70
                    </span>
                  </div>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder={t("seoTitlePlaceholder")}
                    value={formData.seoTitle ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        seoTitle: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("themeColorLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder="#0F172A"
                    value={formData.themeColor ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        themeColor: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("seoDescriptionLabel")}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {(formData.seoDescription ?? "").length}/160
                  </span>
                </div>
                <Textarea
                  className="min-h-28 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("seoDescriptionPlaceholder")}
                  value={formData.seoDescription ?? ""}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      seoDescription: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("seoKeywordsLabel")}
                  </Label>
                  <Textarea
                    className="min-h-24 rounded-2xl border-border/40 bg-transparent shadow-none"
                    placeholder={t("seoKeywordsPlaceholder")}
                    value={formData.seoKeywords ?? ""}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        seoKeywords: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("adminSeoAssetsNoteTitle")}
                  </Label>
                  <p className="rounded-2xl border border-border/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {t("adminSeoAssetsNote")}
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        const parsed =
                          maguiConnectAdminProfileSchema.parse(formData)
                        await upsertMaguiConnectProfileForUserAction(
                          userId,
                          parsed
                        )
                        toast.success(t("adminUpdateSuccess"))
                        router.refresh()
                      } catch (error) {
                        console.error(error)
                        toast.error(
                          error instanceof Error && error.message
                            ? error.message
                            : t("adminUpdateError")
                        )
                      }
                    })
                  }
                >
                  {t("save")}
                </Button>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/20 pt-8">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("linksTitle")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("adminLinksDescription")}
                </p>
              </div>

              <div className="grid gap-3 border-b border-border/30 pb-5">
                <Input
                  className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("linkLabel")}
                  value={newLink.label}
                  onChange={(e) =>
                    setNewLink((current) => ({
                      ...current,
                      label: e.target.value,
                    }))
                  }
                />
                <Input
                  className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("linkUrl")}
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((current) => ({
                      ...current,
                      url: e.target.value,
                    }))
                  }
                />
                <Input
                  className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                  placeholder={t("customShortDescriptionPlaceholder")}
                  value={newLink.customShortDescription ?? ""}
                  onChange={(e) =>
                    setNewLink((current) => ({
                      ...current,
                      customShortDescription: e.target.value,
                    }))
                  }
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                    type="datetime-local"
                    value={newLink.startsAt ?? ""}
                    onChange={(e) =>
                      setNewLink((current) => ({
                        ...current,
                        startsAt: e.target.value,
                      }))
                    }
                  />
                  <Input
                    className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                    type="datetime-local"
                    value={newLink.expiresAt ?? ""}
                    onChange={(e) =>
                      setNewLink((current) => ({
                        ...current,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-start">
                  <Button
                    className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          const parsed = maguiConnectLinkSchema.parse(newLink)
                          await createMaguiConnectLinkForUserAction(
                            userId,
                            parsed
                          )
                          setNewLink({
                            label: "",
                            url: "",
                            customShortDescription: "",
                            startsAt: "",
                            expiresAt: "",
                            kind: "LINK",
                            isFeatured: false,
                            openInNewTab: true,
                          })
                          toast.success(t("adminLinkCreateSuccess"))
                          router.refresh()
                        } catch (error) {
                          console.error(error)
                          toast.error(t("adminLinkCreateError"))
                        }
                      })
                    }
                  >
                    <Plus size={16} className="mr-2" weight="bold" />
                    {t("addLink")}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {links.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("adminNoLinks")}
                  </p>
                ) : (
                  links.map((link, index) => {
                    const isEditing = editingLinkId === link.id

                    return (
                      <div
                        key={link.id}
                        className="space-y-3 border-b border-border/30 pb-4 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Link {index + 1}
                            </p>
                          </div>

                          {!isEditing ? (
                            <div className="flex items-center gap-1">
                              <Button
                                className="h-9 rounded-full px-3"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLinkId(link.id)
                                  setEditingLinkData({
                                    label: link.label,
                                    url: link.url,
                                    customShortDescription:
                                      link.customShortDescription ?? "",
                                    startsAt: link.startsAt
                                      ? new Date(link.startsAt)
                                          .toISOString()
                                          .slice(0, 16)
                                      : "",
                                    expiresAt: link.expiresAt
                                      ? new Date(link.expiresAt)
                                          .toISOString()
                                          .slice(0, 16)
                                      : "",
                                    kind: link.kind ?? "LINK",
                                    isFeatured: link.isFeatured ?? false,
                                    openInNewTab: link.openInNewTab ?? true,
                                  })
                                }}
                              >
                                <PencilSimple size={14} />
                              </Button>
                              <Button
                                className="h-9 rounded-full px-3"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startTransition(async () => {
                                    try {
                                      await deleteMaguiConnectLinkForUserAction(
                                        userId,
                                        link.id
                                      )
                                      toast.success(t("adminLinkDeleteSuccess"))
                                      router.refresh()
                                    } catch (error) {
                                      console.error(error)
                                      toast.error(t("adminLinkDeleteError"))
                                    }
                                  })
                                }
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                              value={editingLinkData.label}
                              onChange={(e) =>
                                setEditingLinkData((current) => ({
                                  ...current,
                                  label: e.target.value,
                                }))
                              }
                            />
                            <Input
                              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                              value={editingLinkData.url}
                              onChange={(e) =>
                                setEditingLinkData((current) => ({
                                  ...current,
                                  url: e.target.value,
                                }))
                              }
                            />
                            <Input
                              className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                              placeholder={t(
                                "customShortDescriptionPlaceholder"
                              )}
                              value={
                                editingLinkData.customShortDescription ?? ""
                              }
                              onChange={(e) =>
                                setEditingLinkData((current) => ({
                                  ...current,
                                  customShortDescription: e.target.value,
                                }))
                              }
                            />
                            <div className="grid gap-3 md:grid-cols-2">
                              <Input
                                className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                                type="datetime-local"
                                value={editingLinkData.startsAt ?? ""}
                                onChange={(e) =>
                                  setEditingLinkData((current) => ({
                                    ...current,
                                    startsAt: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                className="h-11 rounded-2xl border-border/40 bg-transparent shadow-none"
                                type="datetime-local"
                                value={editingLinkData.expiresAt ?? ""}
                                onChange={(e) =>
                                  setEditingLinkData((current) => ({
                                    ...current,
                                    expiresAt: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    try {
                                      const parsed =
                                        maguiConnectLinkSchema.parse(
                                          editingLinkData
                                        )
                                      await updateMaguiConnectLinkForUserAction(
                                        userId,
                                        link.id,
                                        parsed
                                      )
                                      setEditingLinkId(null)
                                      toast.success(t("adminLinkUpdateSuccess"))
                                      router.refresh()
                                    } catch (error) {
                                      console.error(error)
                                      toast.error(t("adminLinkUpdateError"))
                                    }
                                  })
                                }
                              >
                                {t("save")}
                              </Button>
                              <Button
                                className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                                variant="ghost"
                                onClick={() => setEditingLinkId(null)}
                              >
                                {t("cancel")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative -mx-4 flex items-center gap-6 rounded-xl border-b border-foreground/5 px-4 py-8 transition-all hover:bg-foreground/[0.02]">
                            <div className="relative h-14 w-14 shrink-0">
                              <Image
                                src={
                                  MAGUI_CONNECT_LINK_KIND_PRESETS.find(
                                    (p) => p.value === link.kind
                                  )?.icon || "/icons/Link.svg"
                                }
                                alt={link.label}
                                fill
                                className="object-contain transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>

                            <div className="flex flex-1 flex-col overflow-hidden">
                              <span className="text-2xl font-bold leading-none tracking-tight md:text-3xl">
                                {link.label}
                              </span>
                              <span className="mt-1 truncate font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                                {(
                                  link.customShortDescription || link.url
                                ).replace(/^https?:\/\/(www\.)?/, "")}
                              </span>
                            </div>

                            <div className="mr-4 flex h-10 w-10 items-center justify-center opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-100">
                              <ArrowRight
                                size={24}
                                className="text-muted-foreground group-hover:text-foreground"
                              />
                            </div>

                            {link.isFeatured && (
                              <div
                                className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full"
                                style={{
                                  backgroundColor:
                                    formData.themeAccent || "var(--primary)",
                                  boxShadow: `0 0 20px ${formData.themeAccent || "var(--primary)"}`,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
