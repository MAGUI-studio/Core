import { MetadataRoute } from "next"

import { siteConfig } from "@/src/config/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: "Plataforma de Design e Engenharia de Elite - MAGUI.studio",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#0093C8",
    icons: [
      {
        src: "/logos/icon_white.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/icon_white.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Projetos",
        url: "/portal/projects",
        description: "Veja seus projetos ativos",
      },
      {
        name: "Financeiro",
        url: "/portal/projects",
        description: "Gestão de faturamento",
      },
    ],
  }
}
