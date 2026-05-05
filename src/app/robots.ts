import { MetadataRoute } from "next"

import { siteConfig } from "@/src/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/admin",
        "/*/projects",
        "/*/briefing",
        "/*/approvals",
        "/*/files",
        "/*/tasks",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
