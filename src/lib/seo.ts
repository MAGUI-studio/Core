import type { Metadata } from "next"

import { siteConfig } from "@/src/config/site"

type PageMetadataInput = {
  title: string
  description?: string
  path?: string
  noIndex?: boolean
}

const defaultDescription = siteConfig.description
const brandName = siteConfig.name

function withBrandTitle(title: string): string {
  const normalized = title.trim()

  if (!normalized || normalized === brandName) {
    return brandName
  }

  if (normalized.includes(`| ${brandName}`)) {
    return normalized
  }

  return `${normalized} | ${brandName}`
}

export function pageMetadata({
  title,
  description = defaultDescription,
  path = "/",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString()

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: withBrandTitle(title),
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: withBrandTitle(title),
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  }
}

export function dashboardMetadata(input: Omit<PageMetadataInput, "noIndex">) {
  return pageMetadata({ ...input, noIndex: true })
}
