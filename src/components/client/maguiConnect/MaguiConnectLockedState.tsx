"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

import {
  ArrowRight,
  ChartBar,
  CursorClick,
  LinkSimple,
  LockKey,
  PaperPlaneTilt,
  Receipt,
  RocketLaunch,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"

import { requestMaguiConnectAccessAction } from "@/src/lib/actions/maguiConnect.actions"
import { type MaguiConnectAccessState } from "@/src/lib/maguiConnectData"

export function MaguiConnectLockedState({
  accessState = { mode: "REQUESTABLE" },
}: {
  accessState?: MaguiConnectAccessState
}) {
  const t = useTranslations("MaguiConnect")
  const [isPending, startTransition] = React.useTransition()
  const [requested, setRequested] = React.useState(false)
  const isBonusPending = accessState.mode === "BONUS_PENDING"
  const primaryHref = isBonusPending
    ? `/projects/${accessState.projectId}`
    : "/"
  const primaryLabel = isBonusPending
    ? t("bonusPendingProjectButton")
    : t("lockedBackHome")
  const title = isBonusPending ? t("bonusPendingTitle") : t("lockedTitle")
  const description = isBonusPending
    ? t("bonusPendingDescription", { projectName: accessState.projectName })
    : t("lockedDescription")
  const priceLabel = isBonusPending
    ? t("bonusPendingPriceLabel")
    : t("lockedPriceLabel")
  const priceValue = isBonusPending
    ? t("bonusPendingPriceValue")
    : t("lockedPriceValue")
  const ctaDescription = isBonusPending
    ? t("bonusPendingCtaDescription")
    : t("lockedCtaDescription")
  const blockerLines = isBonusPending
    ? [
        accessState.awaitingLaunch ? t("bonusPendingAwaitingLaunch") : null,
        accessState.awaitingPayment ? t("bonusPendingAwaitingPayment") : null,
      ].filter(Boolean)
    : []

  const handleRequest = () =>
    startTransition(async () => {
      try {
        await requestMaguiConnectAccessAction()
        setRequested(true)
        toast.success(t("lockedRequestSuccess"))
      } catch (error) {
        console.error(error)
        toast.error(t("lockedRequestError"))
      }
    })

  return (
    <main className="min-h-full w-full bg-background">
      <section className="w-full px-6 py-12 lg:px-12 lg:py-18">
        <div className="grid w-full gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-10">
            <div className="relative h-14 w-52">
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

            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
                {isBonusPending ? t("bonusPendingEyebrow") : t("lockedEyebrow")}
              </p>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.07em] lg:text-8xl">
                {title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground/75 lg:text-2xl">
                {description}
              </p>
            </div>

            {!isBonusPending ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <HighlightCard
                  icon={<LinkSimple size={24} weight="duotone" />}
                  title={t("lockedBenefitOneTitle")}
                  description={t("lockedBenefitOneDescription")}
                />
                <HighlightCard
                  icon={<CursorClick size={24} weight="duotone" />}
                  title={t("lockedBenefitTwoTitle")}
                  description={t("lockedBenefitTwoDescription")}
                />
                <HighlightCard
                  icon={<ChartBar size={24} weight="duotone" />}
                  title={t("lockedBenefitThreeTitle")}
                  description={t("lockedBenefitThreeDescription")}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {!isBonusPending ? (
                <Button
                  className="h-14 rounded-full bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-none"
                  disabled={isPending || requested}
                  onClick={handleRequest}
                >
                  <PaperPlaneTilt size={18} weight="bold" className="mr-2" />
                  {requested
                    ? t("lockedRequestSent")
                    : t("lockedRequestButton")}
                </Button>
              ) : null}

              <Button
                asChild
                variant="ghost"
                className="h-14 rounded-full px-8 text-[11px] font-black uppercase tracking-[0.24em]"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight size={18} weight="bold" className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-foreground px-8 py-8 text-background lg:px-10 lg:py-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-background/55">
                    {priceLabel}
                  </p>
                  <p className="mt-4 text-5xl font-black tracking-[-0.07em] lg:text-7xl">
                    {priceValue}
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/8 text-brand-primary">
                  <LockKey size={30} weight="duotone" />
                </div>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-background/68">
                {ctaDescription}
              </p>

              {blockerLines.length > 0 ? (
                <div className="mt-6 grid gap-2">
                  {blockerLines.map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-6 text-background/72"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              {isBonusPending ? (
                <>
                  <CompactFeature
                    title={t("bonusPendingProjectButton")}
                    description={t("bonusPendingCtaDescription")}
                  />
                  {blockerLines.map((line, index) => (
                    <CompactFeature
                      key={`${line}-${index}`}
                      title={t("bonusPendingStatusTitle")}
                      description={line}
                    />
                  ))}
                </>
              ) : (
                <>
                  <CompactFeature
                    title={t("lockedFeatureOneTitle")}
                    description={t("lockedFeatureOneDescription")}
                  />
                  <CompactFeature
                    title={t("lockedFeatureTwoTitle")}
                    description={t("lockedFeatureTwoDescription")}
                  />
                  <CompactFeature
                    title={t("lockedFeatureFourTitle")}
                    description={t("lockedFeatureFourDescription")}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {!isBonusPending ? (
        <section className="w-full px-6 py-16 lg:px-12 lg:py-20">
        <div className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
              {t("lockedHowEyebrow")}
            </p>
            <h2 className="text-4xl font-black leading-[0.94] tracking-[-0.05em] lg:text-6xl">
              {t("lockedHowTitle")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-4 lg:gap-0">
            <HorizontalStepCard
              number="01"
              icon={<PaperPlaneTilt size={22} weight="duotone" />}
              title={t("lockedHowStepOneTitle")}
              description={t("lockedHowStepOneDescription")}
            />
            <HorizontalStepCard
              number="02"
              icon={<Receipt size={22} weight="duotone" />}
              title={t("lockedHowStepTwoTitle")}
              description={t("lockedHowStepTwoDescription")}
            />
            <HorizontalStepCard
              number="03"
              icon={<LockKey size={22} weight="duotone" />}
              title={t("lockedHowStepThreeTitle")}
              description={t("lockedHowStepThreeDescription")}
            />
            <HorizontalStepCard
              number="04"
              icon={<RocketLaunch size={22} weight="duotone" />}
              title={t("lockedHowStepFourTitle")}
              description={t("lockedHowStepFourDescription")}
              isLast
            />
          </div>
        </div>
        </section>
      ) : null}

      {!isBonusPending ? (
        <section className="w-full px-6 py-16 lg:px-12 lg:py-22">
        <div className="grid w-full gap-10 bg-muted/10 px-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-14">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary/70">
              {t("lockedValueEyebrow")}
            </p>
            <h2 className="max-w-4xl text-4xl font-black leading-[0.94] tracking-[-0.05em] lg:text-6xl">
              {t("lockedValueTitle")}
            </h2>
            <div className="grid gap-3 pt-2">
              <ValueLine text={t("lockedValuePointOne")} />
              <ValueLine text={t("lockedValuePointTwo")} />
              <ValueLine text={t("lockedValuePointThree")} />
              <ValueLine text={t("lockedValuePointFour")} />
              <ValueLine text={t("lockedValuePointFive")} />
            </div>
          </div>

          <div className="space-y-6 lg:text-right">
            <p className="text-5xl font-black tracking-[-0.07em] text-foreground lg:text-7xl">
              {priceValue}
            </p>
            {!isBonusPending ? (
              <Button
                className="h-14 rounded-full bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-none"
                disabled={isPending || requested}
                onClick={handleRequest}
              >
                <PaperPlaneTilt size={18} weight="bold" className="mr-2" />
                {requested
                  ? t("lockedRequestSent")
                  : t("lockedRequestButton")}
              </Button>
            ) : (
              <Button
                asChild
                className="h-14 rounded-full bg-brand-primary px-8 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-none"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight size={18} weight="bold" className="ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
        </section>
      ) : null}
    </main>
  )
}

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-muted/10 p-5">
      <div className="mb-4 text-brand-primary">{icon}</div>
      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground/72">
        {description}
      </p>
    </div>
  )
}

function CompactFeature({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-muted/10 px-6 py-5">
      <h3 className="text-base font-black tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground/72">
        {description}
      </p>
    </div>
  )
}

function HorizontalStepCard({
  number,
  icon,
  title,
  description,
  isLast = false,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
  isLast?: boolean
}) {
  return (
    <div className="relative bg-muted/10 px-6 py-6 lg:min-h-[260px] lg:px-7 lg:py-8">
      {!isLast ? (
        <div className="absolute right-0 top-11 hidden h-px w-8 translate-x-1/2 bg-border/50 lg:block" />
      ) : null}

      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-brand-primary">
            {icon}
          </div>
          <div className="text-[10px] font-black tracking-[0.28em] text-muted-foreground/60">
            {number}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-black tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted-foreground/72">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

function ValueLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-primary" />
      <p className="text-base leading-7 text-foreground/85">{text}</p>
    </div>
  )
}
