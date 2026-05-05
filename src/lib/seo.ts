import type { Metadata } from "next"

import { siteConfig } from "@/src/config/site"

type PageMetadataInput = {
  title: string
  description?: string
  path?: string
  noIndex?: boolean
}

const defaultDescription = siteConfig.description

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
      title,
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
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
