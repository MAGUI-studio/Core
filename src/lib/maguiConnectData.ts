import { unstable_cache } from "next/cache"

import {
  MaguiConnectLink,
  MaguiConnectProfile,
  MaguiConnectSection,
} from "@/src/generated/client"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

type PublicMaguiConnectProfile = MaguiConnectProfile & {
  links: MaguiConnectLink[]
  sections: (MaguiConnectSection & { links: MaguiConnectLink[] })[]
}

const sectionSelection = {
  id: true,
  profileId: true,
  title: true,
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
  themeAccent: true,
  themeBackground: true,
  themeForeground: true,
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
  themeAccent: true,
  themeBackground: true,
  themeForeground: true,
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
  return {
    profile: {
      id: profile.id,
      title: profile.displayName,
      description: profile.headline,
      displayName: profile.displayName,
      headline: profile.headline,
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
      themeAccent: profile.themeAccent,
      themeBackground: profile.themeBackground,
      themeForeground: profile.themeForeground,
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
    },
    links: profile.links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      icon: link.icon,
      kind: link.kind,
      sortOrder: link.sortOrder,
      isFeatured: link.isFeatured,
      openInNewTab: link.openInNewTab,
    })),
    sections: profile.sections.map((section) => ({
      id: section.id,
      title: section.title,
      sortOrder: section.sortOrder,
      links: section.links.map((link) => ({
        id: link.id,
        label: link.label,
        url: link.url,
        icon: link.icon,
        kind: link.kind,
        sortOrder: link.sortOrder,
        isFeatured: link.isFeatured,
        openInNewTab: link.openInNewTab,
      })),
    })),
  }
}
