import { env } from "./env"

export const siteConfig = {
  name: "MAGUI.studio",
  shortName: "MAGUI.studio",
  description:
    "Estúdio de engenharia visual e interface focado em transformar desafios de negócios em sistemas digitais de alta performance.",
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/og.png`,
  authors: [
    {
      name: "Guilherme Bustamante",
      url: "https://github.com/bustamante-gui",
    },
  ],
  creator: "Guilherme Bustamante",
  links: {
    twitter: "https://twitter.com/maguistudio",
    github: "https://github.com/maguistudio",
  },
  contact: {
    email: "contato@magui.studio",
  },
  locales: ["pt", "en"],
  defaultLocale: "pt",
  analytics: {
    google: env.NEXT_PUBLIC_GA_ID || "",
  },
}

export type SiteConfig = typeof siteConfig
