import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

import {
  ArrowRightIcon,
  CursorClickIcon,
  FlowArrowIcon,
  LinkSimpleIcon,
  MagicWandIcon,
  PathIcon,
  SelectionForegroundIcon,
  SparkleIcon,
  TrendUpIcon,
} from "@phosphor-icons/react/dist/ssr"

import { MaguiConnectLockedState } from "@/src/components/client/maguiConnect/MaguiConnectLockedState"

import { getOwnMaguiConnectProfile } from "@/src/lib/maguiConnectData"
import { getCurrentAppUser } from "@/src/lib/project-governance"

export async function generateMetadata() {
  const t = await getTranslations("MaguiConnect")

  return {
    title: t("pageTitle"),
  }
}

export default async function MaguiConnectOverviewPage() {
  const user = await getCurrentAppUser()
  if (!user) return null

  if (!user.canAccessMaguiConnect) {
    return <MaguiConnectLockedState />
  }

  const t = await getTranslations("MaguiConnect")
  const profile = await getOwnMaguiConnectProfile(user.id)

  const totalClicks =
    profile?.links.reduce((acc, link) => acc + (link.clickCount || 0), 0) ?? 0

  const totalLinks = profile?.links.length ?? 0

  return (
    <main className="min-h-full w-full overflow-hidden bg-background">
      <section className="relative flex w-full flex-col px-6 py-8 lg:px-12 lg:py-10">
        <BackgroundWord className="left-6 top-28" text="LINKS" />
        <BackgroundWord className="bottom-20 right-8" text="CLICKS" />

        <header className="relative z-10 flex w-full items-center justify-between gap-8">
          <div className="relative h-14 w-52 sm:h-44 sm:w-96">
            <Image
              src="/logos/connect/connect_DM.svg"
              alt="Magui Connect"
              fill
              className="object-contain object-left dark:hidden"
              priority
            />
            <Image
              src="/logos/connect/connect_LM.svg"
              alt="Magui Connect"
              fill
              className="hidden object-contain object-left dark:block"
              priority
            />
          </div>
        </header>

        <div className="relative z-10 grid w-full flex-1 items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <div className="space-y-10">
            <div className="space-y-5">
              <p className="text-xs font-black uppercase tracking-[0.36em] text-brand-primary">
                {t("crmBadge")}
              </p>

              <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {t("landingTitle")}
              </h1>
            </div>

            <p className="text-xl font-medium leading-snug text-muted-foreground lg:w-4/5 lg:text-2xl">
              {t("crmDescription")}
            </p>

            <div className="flex flex-wrap gap-4 w-full">
              <Link
                href="/magui-connect/links"
                className="group inline-flex w-full md:w-fit items-center gap-3 rounded-full bg-brand-primary px-7 py-4 text-sm font-semibold transition hover:opacity-90 text-white"
              >
                {t("overview.manageLinks")}
                <ArrowRightIcon
                  size={18}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/magui-connect/analytics"
                className="inline-flex w-full md:w-fit items-center gap-3 rounded-full bg-muted px-7 py-4 text-sm font-semibold text-foreground transition hover:bg-muted/70"
              >
                {t("overview.understandClicks")}
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:flex min-h-140 w-full items-center justify-center">
            <div className="relative w-full space-y-6">
              <DummyLink
                label={t("linkKinds.INSTAGRAM")}
                url="instagram.com/seu-perfil"
                iconPath="/icons/Instagram.svg"
                accentColor="#E5FF00"
              />
              <DummyLink
                label={t("linkKinds.LINKEDIN")}
                url="linkedin.com/in/exemplo"
                iconPath="/icons/LinkedIn.svg"
                accentColor="#E5FF00"
              />
              <DummyLink
                label={t("linkKinds.WHATSAPP")}
                url="wa.me/5511999999999"
                iconPath="/icons/Whatsapp.svg"
                accentColor="#E5FF00"
              />
              <DummyLink
                label="Portfólio"
                url="magui.studio/portfolio"
                iconPath="/icons/Link.svg"
                accentColor="#E5FF00"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-foreground px-6 py-24 text-background lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute right-8 top-8 text-background/[0.06]">
          <MagicWandIcon size={220} weight="duotone" />
        </div>

        <div className="relative grid w-full gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.36em] text-background/50">
              {t("overview.economyTitle")}
            </p>

            <h2
              className="text-5xl font-black leading-[0.92] tracking-[-0.055em] lg:text-8xl"
              dangerouslySetInnerHTML={{ __html: t("overview.economyHeadline") }}
            />
          </div>

          <div className="space-y-8">
            <p className="text-xl font-medium leading-snug text-background/65 lg:text-3xl">
              {t("overview.economyDescription")}
            </p>

            <div className="flex flex-wrap gap-3 text-sm font-medium text-background/55">
              <span>{t("overview.lessNoise")}</span>
              <span>•</span>
              <span>{t("overview.moreFocus")}</span>
              <span>•</span>
              <span>{t("overview.obviousChoice")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full px-6 py-24 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute left-8 top-10 text-foreground/[0.04]">
          <FlowArrowIcon size={240} weight="duotone" />
        </div>

        <div className="relative grid w-full gap-20 lg:grid-cols-3">
          <LandingArgument
            icon={<LinkSimpleIcon size={30} weight="duotone" />}
            title={t("overview.topAnchorsTitle")}
            description={t("overview.topAnchorsDescription")}
          />

          <LandingArgument
            icon={<CursorClickIcon size={30} weight="duotone" />}
            title={t("overview.clickDenouncesInterestTitle")}
            description={t("overview.clickDenouncesInterestDescription")}
          />

          <LandingArgument
            icon={<PathIcon size={30} weight="duotone" />}
            title={t("overview.excessStealsConversionTitle")}
            description={t("overview.excessStealsConversionDescription")}
          />
        </div>
      </section>

      <section className="relative w-full bg-muted px-6 py-24 lg:px-12 lg:py-32">
        <div className="absolute bottom-10 right-10 hidden text-foreground/[0.04] lg:block">
          <TrendUpIcon size={260} weight="duotone" />
        </div>

        <div className="relative grid w-full gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-8">
            <p className="text-xs font-black uppercase tracking-[0.36em] text-brand-primary">
              {t("overview.realReadingTitle")}
            </p>

            <h2 className="text-5xl font-black leading-[0.92] tracking-[-0.055em] lg:text-8xl">
              {t("overview.realReadingHeadline")}
            </h2>
          </div>

          <div className="grid gap-10">
            <MetricLine label={t("overview.clicksReceived")} value={totalClicks} />
            <MetricLine label={t("overview.activeLinks")} value={totalLinks} />

            <p className="text-lg font-medium leading-relaxed text-muted-foreground lg:text-xl">
              {t("overview.realReadingDescription")}
            </p>

            <div className="flex flex-wrap gap-4 w-full">
              <Link
                href="/magui-connect/analytics"
                className="inline-flex w-full md:w-fit items-center gap-3 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {t("overview.viewAnalytics")}
                <ArrowRightIcon size={18} weight="bold" />
              </Link>

              <Link
                href="/magui-connect/links"
                className="inline-flex w-full md:w-fit items-center gap-3 rounded-full bg-background px-7 py-4 text-sm font-semibold text-foreground transition hover:opacity-80"
              >
                {t("overview.adjustLinks")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full px-6 py-24 lg:px-12 lg:py-32">
        <div className="grid w-full gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.36em] text-brand-primary">
              {t("overview.clickHierarchyTitle")}
            </p>

            <h2 className="text-5xl font-black leading-[0.92] tracking-[-0.055em] lg:text-7xl">
              {t("overview.clickHierarchyHeadline")}
            </h2>
          </div>

          <div className="space-y-12">
            <LandingRule
              number="01"
              title={t("overview.ruleOneTitle")}
              description={t("overview.ruleOneDescription")}
            />

            <LandingRule
              number="02"
              title={t("overview.ruleTwoTitle")}
              description={t("overview.ruleTwoDescription")}
            />

            <LandingRule
              number="03"
              title={t("overview.ruleThreeTitle")}
              description={t("overview.ruleThreeDescription")}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

type BackgroundWordProps = {
  text: string
  className?: string
}

function BackgroundWord({ text, className }: BackgroundWordProps) {
  return (
    <span
      className={`pointer-events-none absolute hidden select-none text-[12vw] font-black leading-none tracking-[-0.08em] text-foreground/[0.025] lg:block ${className}`}
    >
      {text}
    </span>
  )
}

type DummyLinkProps = {
  label: string
  url: string
  iconPath: string
  accentColor: string
}

function DummyLink({ label, url, iconPath, accentColor }: DummyLinkProps) {
  return (
    <div className="group relative -mx-4 flex cursor-default items-center gap-6 rounded-xl border-b border-foreground/5 px-4 py-8 transition-all hover:bg-foreground/[0.02]">
      <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
        <Image
          src={iconPath}
          alt={label}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="font-heading text-2xl font-bold leading-none tracking-tight sm:text-4xl">
          {label}
        </span>
        <span className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
          {url.replace(/^https?:\/\/(www\.)?/, "")}
        </span>
      </div>

      <div className="mr-4 flex h-10 w-10 items-center justify-center opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-100 sm:h-12 sm:w-12">
        <ArrowRightIcon
          size={32}
          className="text-muted-foreground group-hover:text-foreground"
        />
      </div>
    </div>
  )
}

type LandingArgumentProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function LandingArgument({ icon, title, description }: LandingArgumentProps) {
  return (
    <div className="space-y-8">
      <div className="text-brand-primary">{icon}</div>

      <div className="space-y-4">
        <h3 className="text-4xl font-black leading-none tracking-[-0.045em]">
          {title}
        </h3>

        <p className="text-lg font-medium leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

type MetricLineProps = {
  label: string
  value: React.ReactNode
}

function MetricLine({ label, value }: MetricLineProps) {
  return (
    <div className="flex items-end justify-between gap-8">
      <p className="text-sm font-black uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>

      <p className="text-5xl font-black leading-none tracking-[-0.075em]">
        {value}
      </p>
    </div>
  )
}

type LandingRuleProps = {
  number: string
  title: string
  description: string
}

function LandingRule({ number, title, description }: LandingRuleProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[96px_0.8fr_1fr] lg:items-start">
      <p className="text-sm font-black tracking-[0.32em] text-brand-primary">
        {number}
      </p>

      <h3 className="text-3xl font-black leading-none tracking-[-0.04em] lg:text-4xl">
        {title}
      </h3>

      <p className="text-base font-medium leading-relaxed text-muted-foreground lg:text-lg">
        {description}
      </p>
    </div>
  )
}
