import { unstable_cache } from "next/cache"

import { MaguiConnectLink, MaguiConnectSection } from "@/src/generated/client"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

type PublicMaguiConnectProfile = {
  id: string
  userId: string
  displayName: string
  headline: string | null
  heroKicker: string | null
  heroHeadline: string | null
  heroDescription: string | null
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  ogImageUrl: string | null
  slug: string | null
  domain: string | null
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
  headline: true,
  heroKicker: true,
  heroHeadline: true,
  heroDescription: true,
  bio: true,
  avatarUrl: true,
  bannerUrl: true,
  ogImageUrl: true,
  slug: true,
  domain: true,
  professionalCategory: true,
  location: true,
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
  seoTitle: true,
  seoDescription: true,
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
  headline: true,
  heroKicker: true,
  heroHeadline: true,
  heroDescription: true,
  bio: true,
  avatarUrl: true,
  bannerUrl: true,
  ogImageUrl: true,
  slug: true,
  domain: true,
  professionalCategory: true,
  location: true,
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
  seoTitle: true,
  seoDescription: true,
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
  return unstable_cache(
    async () => {
      const profile = await prisma.maguiConnectProfile.findUnique({
        where: { domain },
        select: publicProfileSelection,
      })

      if (!profile) return null

      return formatPublicPayload(profile)
    },
    ["public-magui-connect-domain", domain],
    {
      revalidate: CACHE_TTL.DASHBOARD,
      tags: [cacheTags.maguiConnectPublicByDomain(domain)],
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
      headline: profile.headline,
      heroKicker: profile.heroKicker,
      heroHeadline: profile.heroHeadline,
      heroDescription: profile.heroDescription,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      ogImageUrl: profile.ogImageUrl || profile.avatarUrl || null,
      domain: profile.domain,
      slug: profile.slug,
      professionalCategory: profile.professionalCategory,
      location: profile.location,
      companyName: profile.companyName,
      publicEmail: profile.publicEmail,
      publicPhone: profile.publicPhone,
      whatsapp: profile.whatsapp,
      primaryCtaLabel: profile.primaryCtaLabel,
      primaryCtaUrl: profile.primaryCtaUrl,
      secondaryCtaLabel: profile.secondaryCtaLabel,
      secondaryCtaUrl: profile.secondaryCtaUrl,
      themeAccent: profile.themeAccent,
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
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
