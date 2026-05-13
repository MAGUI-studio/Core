import * as React from "react"

import { getTranslations } from "next-intl/server"

import { CreateLeadForm } from "@/src/components/admin/CreateLeadForm"

import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Cadastrar Novo Lead",
  description:
    "Interface administrativa para prospecção e cadastro de novos leads no ecossistema comercial da MAGUI.studio.",
  path: "/admin/crm/register",
})

export default async function CreateLeadPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.crm")

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
            {t("eyebrow")}
          </p>
        </div>
        <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl lg:text-7xl">
          {t("create")}
        </h1>
        <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/80">
          {t("description")}
        </p>
      </div>

      <CreateLeadForm />
    </main>
  )
}
