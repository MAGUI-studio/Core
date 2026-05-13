import { unstable_cache } from "next/cache"

import { MaguiConnectLink, MaguiConnectSection } from "@/src/generated/client"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"
import { normalizeProjectScheduleData } from "./project-schedule"

export type MaguiConnectAccessState =
  | { mode: "REQUESTABLE" }
  | {
      mode: "BONUS_PENDING"
      projectId: string
      projectName: string
      awaitingPayment: boolean
      awaitingLaunch: boolean
    }

function normalizeDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
}

function getSeoStatus(profile: PublicMaguiConnectProfile) {
  if (!profile.indexable) return "NOINDEX" as const

  const effectiveOgImage =
    profile.ogImageUrl || profile.bannerUrl || profile.avatarUrl || null
  const effectiveSeoTitle = profile.seoTitle || profile.displayName || null
  const effectiveSeoDescription =
    profile.seoDescription || profile.headline || profile.bio || null

  if (
    profile.domain &&
    effectiveSeoTitle &&
    effectiveSeoDescription &&
    effectiveOgImage
  ) {
    return "READY" as const
  }

  return "INCOMPLETE" as const
}

type PublicMaguiConnectProfile = {
  id: string
  userId: string
  displayName: string
  siteName: string | null
  headline: string | null
  heroKicker: string | null
  heroHeadline: string | null
  heroDescription: string | null
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
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
  links: MaguiConnectLink[]
  sections: (MaguiConnectSection & {
    description: string | null
    links: MaguiConnectLink[]
  })[]
}

const sectionSelection = {
  id: true,
  profileId: true,
  title: true,
  description: true,
  sortOrder: true,
  isActive: true,
  isCollapsible: true,
  createdAt: true,
  updatedAt: true,
} as const

const linkSelection = {
  id: true,
  profileId: true,
  sectionId: true,
  label: true,
  url: true,
  customShortDescription: true,
  startsAt: true,
  expiresAt: true,
  icon: true,
  kind: true,
  sortOrder: true,
  isActive: true,
  isFeatured: true,
  openInNewTab: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
} as const

const publicProfileSelection = {
  id: true,
  userId: true,
  displayName: true,
  siteName: true,
  headline: true,
  heroKicker: true,
  heroHeadline: true,
  heroDescription: true,
  bio: true,
  avatarUrl: true,
  bannerUrl: true,
  faviconUrl: true,
  logoUrl: true,
  ogImageUrl: true,
  twitterImageUrl: true,
  slug: true,
  domain: true,
  canonicalUrl: true,
  locale: true,
  professionalCategory: true,
  location: true,
  entityType: true,
  jobTitle: true,
  companyName: true,
  publicEmail: true,
  publicPhone: true,
  whatsapp: true,
  whatsappMessage: true,
  primaryCtaLabel: true,
  primaryCtaUrl: true,
  secondaryCtaLabel: true,
  secondaryCtaUrl: true,
  themeAccent: true,
  themeColor: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  twitterHandle: true,
  indexable: true,
  seoNoFollow: true,
  createdAt: true,
  updatedAt: true,
  links: {
    where: { isActive: true, sectionId: null },
    orderBy: { sortOrder: "asc" as const },
    select: linkSelection,
  },
  sections: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      ...sectionSelection,
      links: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" as const },
        select: linkSelection,
      },
    },
  },
} as const

const adminProfileSelection = {
  id: true,
  userId: true,
  displayName: true,
  siteName: true,
  headline: true,
  heroKicker: true,
  heroHeadline: true,
  heroDescription: true,
  bio: true,
  avatarUrl: true,
  bannerUrl: true,
  faviconUrl: true,
  logoUrl: true,
  ogImageUrl: true,
  twitterImageUrl: true,
  slug: true,
  domain: true,
  canonicalUrl: true,
  locale: true,
  professionalCategory: true,
  location: true,
  entityType: true,
  jobTitle: true,
  companyName: true,
  publicEmail: true,
  publicPhone: true,
  whatsapp: true,
  whatsappMessage: true,
  primaryCtaLabel: true,
  primaryCtaUrl: true,
  secondaryCtaLabel: true,
  secondaryCtaUrl: true,
  themeAccent: true,
  themeColor: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  twitterHandle: true,
  indexable: true,
  seoNoFollow: true,
  createdAt: true,
  updatedAt: true,
  links: {
    orderBy: { sortOrder: "asc" as const },
    select: linkSelection,
  },
  sections: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      links: {
        orderBy: { sortOrder: "asc" as const },
        select: linkSelection,
      },
    },
  },
} as const

export async function getAdminMaguiConnectProfileByClerkId(clerkId: string) {
  return prisma.maguiConnectProfile.findFirst({
    where: { user: { clerkId } },
    select: adminProfileSelection,
  })
}

export async function getAdminMaguiConnectProfileByUserId(userId: string) {
  return prisma.maguiConnectProfile.findUnique({
    where: { userId },
    select: adminProfileSelection,
  })
}

export async function getOwnMaguiConnectProfile(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.maguiConnectProfile.findUnique({
        where: { userId },
        select: adminProfileSelection,
      })
    },
    ["own-magui-connect-profile", userId],
    {
      revalidate: CACHE_TTL.USER_PREFERENCES,
      tags: [cacheTags.maguiConnectProfile(userId)],
    }
  )()
}

export async function getOwnMaguiConnectAccessState(
  userId: string,
  canAccessMaguiConnect: boolean
): Promise<MaguiConnectAccessState> {
  if (canAccessMaguiConnect) {
    return { mode: "REQUESTABLE" }
  }

  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      scheduleData: true,
      invoices: {
        where: {
          kind: "PROJECT",
          status: { not: "CANCELLED" },
        },
        select: {
          installments: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  })

  const bonusProject = projects.find((project) => {
    const schedule = normalizeProjectScheduleData(project.scheduleData)
    return (
      schedule.includesMaguiConnectBonus &&
      schedule.maguiConnectBonusStatus === "PENDING_RELEASE"
    )
  })

  if (!bonusProject) {
    return { mode: "REQUESTABLE" }
  }

  const awaitingLaunch = bonusProject.status !== "LAUNCHED"
  const awaitingPayment = bonusProject.invoices.some((invoice) =>
    invoice.installments.some(
      (installment) =>
        installment.status !== "PAID" && installment.status !== "WAIVED"
    )
  )

  return {
    mode: "BONUS_PENDING",
    projectId: bonusProject.id,
    projectName: bonusProject.name,
    awaitingLaunch,
    awaitingPayment,
  }
}

export async function getOwnMaguiConnectAnalytics(userId: string) {
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          displayName: true,
          links: {
            orderBy: [{ clickCount: "desc" }, { sortOrder: "asc" }],
            select: {
              id: true,
              label: true,
              url: true,
              kind: true,
              clickCount: true,
              isFeatured: true,
              section: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      })

      if (!profile) {
        return {
          profileName: null,
          totalClicks: 0,
          totalLinks: 0,
          topLink: null,
          links: [],
        }
      }

      const totalClicks = profile.links.reduce(
        (sum, link) => sum + link.clickCount,
        0
      )

      return {
        profileName: profile.displayName,
        totalClicks,
        totalLinks: profile.links.length,
        topLink: profile.links[0] ?? null,
        links: profile.links,
      }
    },
    ["own-magui-connect-analytics", userId],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectProfile(userId)],
    }
  )()
}

export async function getPublicMaguiConnectByDomain(domain: string) {
  const normalizedDomain = normalizeDomain(domain)
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { domain: normalizedDomain },
        select: publicProfileSelection,
      })

      if (!profile) return null

      return formatPublicPayload(profile)
    },
    ["public-magui-connect-domain", normalizedDomain],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectPublicByDomain(normalizedDomain)],
    }
  )()
}

export async function getPublicMaguiConnectBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { slug },
        select: publicProfileSelection,
      })

      if (!profile) return null

      return formatPublicPayload(profile)
    },
    ["public-magui-connect-slug", slug],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectPublicBySlug(slug)],
    }
  )()
}

function formatPublicPayload(profile: PublicMaguiConnectProfile) {
  const now = new Date()
  const seoStatus = getSeoStatus(profile)
  const siteName = profile.siteName || profile.displayName
  const ogImageUrl =
    profile.ogImageUrl || profile.bannerUrl || profile.avatarUrl
  const twitterImageUrl = profile.twitterImageUrl || ogImageUrl || null
  const seoTitle = profile.seoTitle || profile.displayName
  const seoDescription =
    profile.seoDescription || profile.headline || profile.bio
  const isLinkVisible = (link: MaguiConnectLink) => {
    if (link.startsAt && link.startsAt > now) return false
    if (link.expiresAt && link.expiresAt < now) return false
    return true
  }

  return {
    profile: {
      id: profile.id,
      title: profile.displayName,
      description: profile.headline,
      displayName: profile.displayName,
      siteName,
      headline: profile.headline,
      heroKicker: profile.heroKicker,
      heroHeadline: profile.heroHeadline,
      heroDescription: profile.heroDescription,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      faviconUrl: profile.faviconUrl,
      logoUrl: profile.logoUrl,
      ogImageUrl,
      twitterImageUrl,
      domain: profile.domain,
      slug: profile.slug,
      canonicalUrl: profile.canonicalUrl,
      locale: profile.locale,
      professionalCategory: profile.professionalCategory,
      location: profile.location,
      entityType: profile.entityType,
      jobTitle: profile.jobTitle,
      companyName: profile.companyName,
      publicEmail: profile.publicEmail,
      publicPhone: profile.publicPhone,
      whatsapp: profile.whatsapp,
      whatsappMessage: profile.whatsappMessage,
      primaryCtaLabel: profile.primaryCtaLabel,
      primaryCtaUrl: profile.primaryCtaUrl,
      secondaryCtaLabel: profile.secondaryCtaLabel,
      secondaryCtaUrl: profile.secondaryCtaUrl,
      themeAccent: profile.themeAccent,
      themeColor: profile.themeColor,
      seoTitle,
      seoDescription,
      seoKeywords: profile.seoKeywords,
      twitterHandle: profile.twitterHandle,
      indexable: profile.indexable,
      seoNoFollow: profile.seoNoFollow,
      seoStatus,
    },
    links: profile.links.filter(isLinkVisible).map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      customShortDescription: link.customShortDescription,
      startsAt: link.startsAt,
      expiresAt: link.expiresAt,
      icon: link.icon,
      kind: link.kind,
      sortOrder: link.sortOrder,
      isFeatured: link.isFeatured,
      openInNewTab: link.openInNewTab,
    })),
    sections: profile.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      links: section.links.filter(isLinkVisible).map((link) => ({
        id: link.id,
        label: link.label,
        url: link.url,
        customShortDescription: link.customShortDescription,
        startsAt: link.startsAt,
        expiresAt: link.expiresAt,
        icon: link.icon,
        kind: link.kind,
        sortOrder: link.sortOrder,
        isFeatured: link.isFeatured,
        openInNewTab: link.openInNewTab,
      })),
    })),
  }
}
